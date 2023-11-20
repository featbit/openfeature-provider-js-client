import { ErrorCode, ResolutionDetails } from "@openfeature/web-sdk";
import { FeatureFlagValue } from "featbit-js-client-sdk/esm/types";

function translateErrorType(errorType?: string): ErrorCode {
  // Error code specification.
  // https://github.com/open-feature/spec/blob/main/specification/sections/02-providers.md#requirement-28
  switch (errorType) {
    case "CLIENT_NOT_READY":
      return ErrorCode.PROVIDER_NOT_READY;
    case "MALFORMED_FLAG":
      return ErrorCode.PARSE_ERROR;
    case "FLAG_NOT_FOUND":
      return ErrorCode.FLAG_NOT_FOUND;
    case "USER_NOT_SPECIFIED":
      return ErrorCode.TARGETING_KEY_MISSING;
    // General errors.
    default:
      return ErrorCode.GENERAL;
  }
}

export default function translateResult<T>(
  result: FeatureFlagValue
): ResolutionDetails<T> {
  const resolution: ResolutionDetails<T> = {
    value: result.value,
    variant: result.variationIndex?.toString(),
    reason: result.reason?.kind,
  };

  if (result.reason?.kind === "ERROR") {
    resolution.errorCode = translateErrorType(result.reason.errorType);
  }
  return resolution;
}
