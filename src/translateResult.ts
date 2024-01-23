import { ResolutionDetails } from "@openfeature/web-sdk";
import { FeatureFlagValue } from "featbit-js-client-sdk";

export default function translateResult<T>(
  result: FeatureFlagValue
): ResolutionDetails<T> {
  const resolution: ResolutionDetails<T> = {
    value: result
  };

  return resolution;
}
