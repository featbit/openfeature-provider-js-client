import { Logger } from "@openfeature/web-sdk";

export default interface FeatbitLogger extends Logger {
  log: (...args) => void;
  error: (...args) => void;
  warn: (...args) => void;
  info: (...args) => void;
  debug: (...args) => void;
}
