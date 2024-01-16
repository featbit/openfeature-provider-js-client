import { EvaluationContext, JsonValue, Logger, OpenFeatureEventEmitter, Provider, ProviderStatus, ResolutionDetails } from "@openfeature/web-sdk";
import { FB } from "featbit-js-client-sdk";
import { IOption } from "featbit-js-client-sdk/esm/types";
import FeatbitLogger from "./FeatbitLogger";
export declare class FeatbitClientProvider implements Provider {
    readonly runsOn = "client";
    readonly metadata: {
        readonly name: "featbit-client-provider";
    };
    private readonly featbitLogger;
    private readonly featbitClient;
    private readonly clientConstructionError;
    private _status?;
    readonly events: OpenFeatureEventEmitter;
    constructor(logger: FeatbitLogger, options: IOption);
    initialize(context?: EvaluationContext | undefined): Promise<void>;
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
    resolveBooleanEvaluation(flagKey: string, defaultValue: boolean, context: EvaluationContext, logger: Logger): ResolutionDetails<boolean>;
    resolveStringEvaluation(flagKey: string, defaultValue: string, context: EvaluationContext, logger: Logger): ResolutionDetails<string>;
    resolveNumberEvaluation(flagKey: string, defaultValue: number, context: EvaluationContext, logger: Logger): ResolutionDetails<number>;
    resolveObjectEvaluation<T extends JsonValue>(flagKey: string, defaultValue: T, context: EvaluationContext, logger: Logger): ResolutionDetails<T>;
    onContextChange(_oldContext: EvaluationContext, newContext: EvaluationContext): Promise<void>;
    getClient(): FB;
    get status(): ProviderStatus | undefined;
    onClose(): Promise<void>;
    private translateContext;
}
//# sourceMappingURL=FeatbitClientProvider.d.ts.map