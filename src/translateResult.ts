import {
  ResolutionDetails,
  ResolutionReason,
} from "@openfeature/web-sdk";
import { FeatureFlagValue, logger } from "featbit-js-client-sdk";

export default function translateResult<T>(
  result: FeatureFlagValue,
  reason: ResolutionReason,
): ResolutionDetails<T> {
  const resolution: ResolutionDetails<T> = {
    value: result,
    reason: reason,
  };
  logger.logDebug(resolution.reason);
  return resolution;
}
