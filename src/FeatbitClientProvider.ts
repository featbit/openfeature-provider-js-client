import {
  ErrorCode,
  EvaluationContext,
  FlagValue,
  GeneralError,
  Hook,
  JsonValue,
  Logger,
  OpenFeatureEventEmitter,
  Provider,
  ProviderStatus,
  ResolutionDetails,
  StandardResolutionReasons,
} from "@openfeature/web-sdk";

import { FB } from "featbit-js-client-sdk";
import { IOption, IUser } from "featbit-js-client-sdk/esm/types";
import {
  FeatbitProviderInitializeOptions,
  FeatbitProviderOptions,
} from "./FeatbitProviderOptions";
import { FeatbitLogger, featbitBasicLogger } from "./FeatbitLogger";
import { translateContext } from "./translateContext";
import _ from "lodash";
import translateResult from "./FeatbitResultConverter";

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
  private readonly featbitProviderInitializeOptions:
    | FeatbitProviderInitializeOptions
    | undefined;
  private readonly logger: FeatbitLogger;
  private featbitClient: FB;

  private _status?: ProviderStatus | undefined;
  set status(status: ProviderStatus | undefined) {
    this.status = status;
  }
  get status(): ProviderStatus | undefined {
    return this._status;
  }

  constructor(
    private readonly envKey: string,
    {
      logger,
      ...featbitProviderInitializeOptions
    }: FeatbitProviderInitializeOptions
  ) {
    if (logger) {
      this.logger = logger;
    } else {
      this.logger = featbitBasicLogger;
    }
    this.featbitProviderInitializeOptions = {
      ...featbitProviderInitializeOptions,
      logger: this.logger,
    };
  }

  resolveBooleanEvaluation(
    flagKey: string,
    defaultValue: boolean,
    context: EvaluationContext,
    logger: FeatbitLogger
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

  events?: OpenFeatureEventEmitter | undefined;

  initialize?(context?: EvaluationContext | undefined): Promise<void> {
    let featbitProviderOptions: FeatbitProviderOptions | undefined;
    let _user: IUser | undefined;
    if (context !== undefined) {
      _user = this.translateContext(context);
    }
    featbitProviderOptions = Object.assign(
      {},
      _user,
      this.featbitProviderInitializeOptions,
      {
        envkey: this.envKey,
      }
    );
    if (context?.targetingKey && this.envKey) {
      this.featbitClient = new FB();
      this.featbitClient.init(featbitProviderOptions as IOption);
      return this.featbitClient.waitUntilReady().then(() => {
        this.status = ProviderStatus.READY;
      });
    } else {
      return Promise.reject(new Error("Something went wrong"));
    }
  }

  async onContextChange(
    _oldContext: EvaluationContext,
    newContext: EvaluationContext
  ): Promise<void> {
    // update the context on the featbit client, this is so it does not have to be checked on each evaluation
    await this.featbitClient.identify(this.translateContext(newContext)!);
  }

  onClose?(): Promise<void> {
    // code to shut down your
    return this.featbitClient.logout().then(() => {
      this.status = ProviderStatus.NOT_READY;
    });
  }
  private translateContext(context: EvaluationContext) {
    return translateContext(context, this.logger);
  }
}
