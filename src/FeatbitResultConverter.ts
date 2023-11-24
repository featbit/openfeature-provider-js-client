import {
  ErrorCode,
  ResolutionDetails,
  ResolutionReason,
} from "@openfeature/web-sdk";
import { FeatureFlagValue } from "featbit-js-client-sdk/esm/types";

export default function translateResult<T>(
  result: FeatureFlagValue,
  reason: ResolutionReason,
  errorCode?: ErrorCode
): ResolutionDetails<T> {
  const resolution: ResolutionDetails<T> = {
    value: result,
    variant: result.variationIndex?.toString(),
    reason: reason,
  };
  if (reason === "ERROR") {
    if (errorCode === undefined) {
      resolution.errorCode = ErrorCode.GENERAL;
    } else {
      resolution.errorCode = errorCode;
    }
  }
  return resolution;
}
