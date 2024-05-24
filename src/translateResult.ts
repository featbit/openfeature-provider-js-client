import { ResolutionDetails } from "@openfeature/web-sdk";
import { FlagValue } from "@featbit/js-client-sdk";

export default function translateResult<T>(
  result: FlagValue
): ResolutionDetails<T> {
  const resolution: ResolutionDetails<T> = {
    value: result
  };

  return resolution;
}
