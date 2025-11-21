import {
  ErrorCode,
  EvaluationContext,
  JsonValue,
  OpenFeatureEventEmitter,
  Provider,
  ProviderEvents,
  ProviderStatus,
  ResolutionDetails,
  StandardResolutionReasons,
} from "@openfeature/web-sdk";

import { BasicLogger, FbClientBuilder, IFbClient, ILogger, IOptions, IUser } from "@featbit/js-client-sdk";

import { translateContext } from "./translateContext";
import translateResult from "./translateResult";

/**
 * Create a ResolutionDetails for an evaluation that produced a type different
 * from the expected type.
 * @param value The default value to populate the ResolutionDetails with.
 * @returns A ResolutionDetails with the default value.
 */
function wrongTypeResult<T>(value: T): ResolutionDetails<T> {
  return {
    value,
    reason: StandardResolutionReasons.ERROR,
    errorCode: ErrorCode.TYPE_MISMATCH,
  };
}

// implement the provider interface
export class FbProvider implements Provider {
  private readonly logger: ILogger;

  // Adds runtime validation that the provider is used with the expected SDK
  public readonly runsOn = "client";
  readonly metadata = {
    name: "featbit-js-client-provider",
  } as const;

  private readonly fbClient: IFbClient;
  private readonly clientConstructionError: any;

  private _status?: ProviderStatus = ProviderStatus.NOT_READY;
  public readonly events = new OpenFeatureEventEmitter();
  constructor(options: IOptions) {
    try {
      this.fbClient = new FbClientBuilder({...options}).build();
      this.fbClient.on('update', (flagKeys: string[]) =>
        this.events.emit(ProviderEvents.ConfigurationChanged, {
          flagsChanged: flagKeys,
        })
      );
    } catch (err) {
      this.clientConstructionError = err;
      this.logger = this.fbClient?.logger || (options.logger ?? new BasicLogger({
        level: options.logLevel || 'none',
        destination: console.log
      }));

      this.logger.error(`Encountered unrecoverable initialization error, ${err}`);
      this._status = ProviderStatus.ERROR;
    }
  }

  async initialize(): Promise<void> {
    if (!this.fbClient) {
      // The client could not be constructed.
      if (this.clientConstructionError) {
        throw this.clientConstructionError;
      }
      throw new Error("Unknown problem encountered during initialization");
    }

    try {
      await this.fbClient.waitForInitialization();
      this._status = ProviderStatus.READY;
    } catch (error) {
      this._status = ProviderStatus.ERROR;
      throw error;
    }
  }

  /**
   * Determines the boolean variation of a feature flag for a context, along with information about
   * how it was calculated.
   *
   * If the flag does not evaluate to a boolean value, then the defaultValue will be returned.
   *
   * @param flagKey The unique key of the feature flag.
   * @param defaultValue The default value of the flag, to be used if the value is not available
   *   from FeatBit.
   * @returns A promise which will resolve to a ResolutionDetails.
   */
  resolveBooleanEvaluation(
    flagKey: string,
    defaultValue: boolean
  ): ResolutionDetails<boolean> {
    const variation = this.fbClient.boolVariation(flagKey, defaultValue);
    if (typeof variation !== "boolean") {
      this.logger.debug(ErrorCode.GENERAL);
      return wrongTypeResult(defaultValue);
    }

    return translateResult<boolean>(variation);
  }

  resolveStringEvaluation(
    flagKey: string,
    defaultValue: string
  ): ResolutionDetails<string> {
    const variation = this.fbClient.stringVariation(flagKey, defaultValue);
    if (typeof variation !== "string") {
      this.logger.debug(ErrorCode.GENERAL);
      return wrongTypeResult(defaultValue);
    }

    return translateResult<string>(variation);
  }

  resolveNumberEvaluation(
    flagKey: string,
    defaultValue: number
  ): ResolutionDetails<number> {
    const variation = this.fbClient.numberVariation(flagKey, defaultValue);
    if (typeof variation !== "number") {
      this.logger.debug(ErrorCode.GENERAL);
      return wrongTypeResult(defaultValue);
    }

    return translateResult<number>(variation);
  }

  resolveObjectEvaluation<T extends JsonValue>(
    flagKey: string,
    defaultValue: T
  ): ResolutionDetails<T> {
    const variation = this.fbClient.jsonVariation(flagKey, defaultValue);
    if (variation !== undefined) {
      return translateResult<T>(variation);
    } else {
      this.logger.debug(ErrorCode.GENERAL);
      return wrongTypeResult(defaultValue);
    }
  }

  async onContextChange(
    _oldContext: EvaluationContext,
    newContext: EvaluationContext
  ): Promise<void> {
    // update the context on the featbit client, this is so it does not have to be checked on each evaluation
    const _user: IUser | undefined = translateContext(newContext, this.logger);
    if (_user) {
      await this.fbClient.identify(_user);
    } else {
      return Promise.reject(new Error("Something went wrong"));
    }
  }

  public getClient(): IFbClient {
    return this.fbClient;
  }

  get status(): ProviderStatus | undefined {
    return this._status;
  }

  async onClose(): Promise<void> {
    // code to shut down your
    await this.fbClient.close();
    this._status = ProviderStatus.NOT_READY;
  }
}
