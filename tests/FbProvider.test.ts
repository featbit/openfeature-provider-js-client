// Mock the underlying SDK so we can construct FbProvider in a node test
// environment without depending on browser globals (localStorage) or network.
jest.mock('@featbit/js-client-sdk', () => {
  const actual = jest.requireActual('@featbit/js-client-sdk');

  class FakeFbClient {
    public logger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };
    public identify = jest.fn().mockResolvedValue(undefined);
    public on = jest.fn();
    public close = jest.fn().mockResolvedValue(undefined);
    public waitForInitialization = jest.fn().mockResolvedValue(undefined);
    public boolVariation = jest.fn();
    public stringVariation = jest.fn();
    public numberVariation = jest.fn();
    public jsonVariation = jest.fn();
    public track = jest.fn();
  }

  class FakeFbClientBuilder {
    constructor(_options?: any) {}
    build() {
      return new FakeFbClient();
    }
  }

  return {
    ...actual,
    FbClientBuilder: FakeFbClientBuilder,
  };
});

import { FbProvider } from '../src/FbProvider';
import { OpenFeature } from '@openfeature/web-sdk';

describe('FbProvider', () => {
  describe('tracking through OpenFeature', () => {
    afterEach(async () => {
      await OpenFeature.clearProviders();
      await OpenFeature.setContext({});
    });

    it.each([
      ['without details', undefined, undefined],
      ['with a metric', { value: 99.5 }, 99.5],
      ['with a zero metric', { value: 0 }, 0],
      ['with custom fields', { value: 10, currency: 'EUR' }, 10],
      ['with only custom fields', { currency: 'EUR' }, undefined],
    ])('%s forwards the event to FeatBit', async (_name, details, expectedValue) => {
      const provider = new FbProvider({
        sdkKey: 'test-sdk-key',
        streamingUri: 'wss://example.invalid',
        eventsUri: 'https://example.invalid',
      } as any);
      await OpenFeature.setProviderAndWait(provider);

      const result = OpenFeature.getClient().track('purchase', details);

      expect(result).toBeUndefined();
      expect(provider.getClient().track).toHaveBeenCalledTimes(1);
      expect(provider.getClient().track).toHaveBeenCalledWith('purchase', expectedValue);
      expect(provider.getClient().identify).not.toHaveBeenCalled();
    });

    it('tracks after reconciling a context change without identifying again', async () => {
      const provider = new FbProvider({
        sdkKey: 'test-sdk-key',
        streamingUri: 'wss://example.invalid',
        eventsUri: 'https://example.invalid',
      } as any);
      await OpenFeature.setProviderAndWait(provider);
      await OpenFeature.setContext({ targetingKey: 'user-123' });

      OpenFeature.getClient().track('purchase', { value: 1 });

      expect(provider.getClient().identify).toHaveBeenCalledTimes(1);
      expect(provider.getClient().identify).toHaveBeenCalledWith({
        keyId: 'user-123', name: '', customizedProperties: [],
      });
      expect(provider.getClient().track).toHaveBeenCalledWith('purchase', 1);
    });
  });

  describe('onContextChange (regression: issue #6)', () => {
    it('does not throw when the new context is missing a targeting key (happy-path construction)', async () => {
      // Happy-path construction: previously, this left `this.logger` undefined,
      // so the call below threw `Cannot read properties of undefined
      // (reading 'error')` from translateContext when the new context had no
      // targeting key.
      const provider = new FbProvider({
        sdkKey: 'test-sdk-key',
        streamingUri: 'wss://example.invalid',
        eventsUri: 'https://example.invalid',
      } as any);

      await expect(provider.onContextChange({}, {})).resolves.not.toThrow();
    });

    it('logs the missing-key error via the logger supplied in options', async () => {
      const errorSpy = jest.fn();
      const logger = {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: errorSpy,
      };

      const provider = new FbProvider({
        sdkKey: 'test-sdk-key',
        streamingUri: 'wss://example.invalid',
        eventsUri: 'https://example.invalid',
        logger,
      } as any);

      await provider.onContextChange({}, {});
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining("'targetingKey'")
      );
    });
  });
});
