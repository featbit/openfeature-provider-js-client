import {
  ErrorCode,
  Logger,
  ResolutionDetails,
  ResolutionReason,
} from "@openfeature/web-sdk";
import { FeatureFlagValue } from "featbit-js-client-sdk/esm/types";

export default function translateResult<T>(
  result: FeatureFlagValue,
  reason: ResolutionReason,
  logger: Logger
): ResolutionDetails<T> {
  const resolution: ResolutionDetails<T> = {
    value: result,
    reason: reason,
  };
  logger.info(resolution.reason);
  return resolution;
}
