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

import { FB, fbClient, IOption, IUser, logger } from "featbit-js-client-sdk";

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
  // Adds runtime validation that the provider is used with the expected SDK
  public readonly runsOn = "client";
  readonly metadata = {
    name: "featbit-client-provider",
  } as const;

  private readonly fbClient: FB;
  private readonly clientConstructionError: any;

  private _status?: ProviderStatus = ProviderStatus.NOT_READY;
  public readonly events = new OpenFeatureEventEmitter();
  constructor(options: IOption) {
    try {
      this.fbClient = fbClient;
      this.fbClient.init(options);
      this.fbClient.on('ff_update', ({ key }: { key: string }) =>
        this.events.emit(ProviderEvents.ConfigurationChanged, {
          flagsChanged: [key],
        })
      );
    } catch (err) {
      this.clientConstructionError = err;
      logger.log(`Encountered unrecoverable initialization error, ${err}`);
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
      await this.fbClient.waitUntilReady();
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
    const variation = this.fbClient.variation(flagKey, defaultValue);
    if (typeof variation !== "boolean") {
      logger.log(ErrorCode.GENERAL);
      return wrongTypeResult(defaultValue);
    }

    return translateResult<boolean>(variation);
  }

  resolveStringEvaluation(
    flagKey: string,
    defaultValue: string
  ): ResolutionDetails<string> {
    const variation = this.fbClient.variation(flagKey, defaultValue);
    if (typeof variation !== "string") {
      logger.log(ErrorCode.GENERAL);
      return wrongTypeResult(defaultValue);
    }

    return translateResult<string>(variation);
  }

  resolveNumberEvaluation(
    flagKey: string,
    defaultValue: number
  ): ResolutionDetails<number> {
    const variation = this.fbClient.variation(flagKey, defaultValue);
    if (typeof variation !== "number") {
      logger.log(ErrorCode.GENERAL);
      return wrongTypeResult(defaultValue);
    }

    return translateResult<number>(variation);
  }

  resolveObjectEvaluation<T extends JsonValue>(
    flagKey: string,
    defaultValue: T
  ): ResolutionDetails<T> {
    if (this.fbClient.variation(flagKey, defaultValue) !== undefined) {
      return translateResult<T>(
        this.fbClient.variation(flagKey, defaultValue)
      );
    } else {
      logger.log(ErrorCode.GENERAL);
      return wrongTypeResult(defaultValue);
    }
  }

  async onContextChange(
    _oldContext: EvaluationContext,
    newContext: EvaluationContext
  ): Promise<void> {
    console.log('onchange');
    // update the context on the featbit client, this is so it does not have to be checked on each evaluation
    const _user: IUser | undefined = translateContext(newContext);
    if (_user) {
      await this.fbClient.identify(_user);
    } else {
      return Promise.reject(new Error("Something went wrong"));
    }
  }

  public getClient(): FB {
    return this.fbClient;
  }

  get status(): ProviderStatus | undefined {
    return this._status;
  }

  async onClose(): Promise<void> {
    // code to shut down your
    await this.fbClient.logout();
    this._status = ProviderStatus.NOT_READY;
  }
}
