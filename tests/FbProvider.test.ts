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

describe('FbProvider', () => {
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
