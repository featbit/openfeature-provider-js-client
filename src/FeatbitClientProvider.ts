import {
  ErrorCode,
  EvaluationContext,
  JsonValue,
  Logger,
  OpenFeatureEventEmitter,
  Provider,
  ProviderEvents,
  ProviderStatus,
  ResolutionDetails,
  StandardResolutionReasons,
} from "@openfeature/web-sdk";

import { FB } from "featbit-js-client-sdk";
import { IOption, IUser } from "featbit-js-client-sdk/esm/types";

import FeatbitLogger from "./FeatbitLogger";
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
export class FeatbitClientProvider implements Provider {
  // Adds runtime validation that the provider is used with the expected SDK
  public readonly runsOn = "client";
  readonly metadata = {
    name: "featbit-client-provider",
  } as const;

  private readonly featbitLogger: FeatbitLogger;
  private readonly featbitClient: FB;
  private readonly clientConstructionError: any;

  private _status?: ProviderStatus = ProviderStatus.NOT_READY;
  public readonly events = new OpenFeatureEventEmitter();
  constructor(options: IOption, logger?: FeatbitLogger) {
    this.featbitLogger = logger;
    try {
      this.featbitClient = new FB();
      this.featbitClient.init(options);
      this.featbitClient.on("update", ({ key }: { key: string }) =>
        this.events.emit(ProviderEvents.ConfigurationChanged, {
          flagsChanged: [key],
        })
      );
    } catch (err) {
      this.clientConstructionError = err;
      this.featbitLogger.error(
        `Encountered unrecoverable initialization error, ${err}`
      );
      this._status = ProviderStatus.ERROR;
    }
  }

  async initialize(context?: EvaluationContext | undefined): Promise<void> {
    if (!this.featbitClient) {
      // The client could not be constructed.
      if (this.clientConstructionError) {
        throw this.clientConstructionError;
      }
      throw new Error("Unknown problem encountered during initialization");
    }
    try {
      await this.featbitClient.waitUntilReady();
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
   * @param context The context requesting the flag.
   * @returns A promise which will resolve to a ResolutionDetails.
   */
  resolveBooleanEvaluation(
    flagKey: string,
    defaultValue: boolean,
    context: EvaluationContext,
    logger: Logger
  ): ResolutionDetails<boolean> {
    // code to evaluate a boolean
    if (this.featbitClient.variation(flagKey, defaultValue) !== undefined) {
      return translateResult(
        this.featbitClient.variation(flagKey, defaultValue),
        StandardResolutionReasons.TARGETING_MATCH,
        logger
      );
    } else {
      logger.error(ErrorCode.GENERAL);
      return wrongTypeResult(defaultValue);
    }
  }

  resolveStringEvaluation(
    flagKey: string,
    defaultValue: string,
    context: EvaluationContext,
    logger: Logger
  ): ResolutionDetails<string> {
    // code to evaluate a boolean
    if (this.featbitClient.variation(flagKey, defaultValue) !== undefined) {
      return translateResult(
        this.featbitClient.variation(flagKey, defaultValue),
        StandardResolutionReasons.TARGETING_MATCH,
        logger
      );
    } else {
      logger.error(ErrorCode.GENERAL);
      return wrongTypeResult(defaultValue);
    }
  }

  resolveNumberEvaluation(
    flagKey: string,
    defaultValue: number,
    context: EvaluationContext,
    logger: Logger
  ): ResolutionDetails<number> {
    // code to evaluate a boolean
    if (this.featbitClient.variation(flagKey, defaultValue) !== undefined) {
      return translateResult(
        this.featbitClient.variation(flagKey, defaultValue),
        StandardResolutionReasons.TARGETING_MATCH,
        logger
      );
    } else {
      logger.error(ErrorCode.GENERAL);
      return wrongTypeResult(defaultValue);
    }
  }

  resolveObjectEvaluation<T extends JsonValue>(
    flagKey: string,
    defaultValue: T,
    context: EvaluationContext,
    logger: Logger
  ): ResolutionDetails<T> {
    // code to evaluate a boolean
    if (this.featbitClient.variation(flagKey, defaultValue) !== undefined) {
      return translateResult(
        this.featbitClient.variation(flagKey, defaultValue),
        StandardResolutionReasons.TARGETING_MATCH,
        logger
      );
    } else {
      logger.error(ErrorCode.GENERAL);
      return wrongTypeResult(defaultValue);
    }
  }

  async onContextChange(
    _oldContext: EvaluationContext,
    newContext: EvaluationContext
  ): Promise<void> {
    // update the context on the featbit client, this is so it does not have to be checked on each evaluation
    const _user: IUser | undefined = this.translateContext(newContext);
    if (_user) {
      this.featbitClient.identify(_user);
    } else {
      return Promise.reject(new Error("Something went wrong"));
    }
  }
  public getClient(): FB {
    return this.featbitClient;
  }
  get status(): ProviderStatus | undefined {
    return this._status;
  }
  async onClose(): Promise<void> {
    // code to shut down your
    await this.featbitClient.logout();
    this._status = ProviderStatus.NOT_READY;
  }
  private translateContext(context: EvaluationContext) {
    return translateContext(context, this.featbitLogger);
  }
}
