import { Logger } from "@openfeature/web-sdk";
import { debugModeQueryStr } from "featbit-js-client-sdk/src/constants";

// get debug mode from query string
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const debugModeParam = urlParams.get(debugModeQueryStr);

export interface FeatbitLogger extends Logger {
  log: (...args: any[]) => void;
}

export const featbitBasicLogger: FeatbitLogger = {
  debug: (...args) => {
    if (debugModeParam === "true") {
      console.log(...args);
    }
  },
  info: (...args) => console.info(...args),
  warn: (...args) => console.warn(...args),
  error: (...args) => console.error(...args),
  log: (...args) => console.log(...args),
};
