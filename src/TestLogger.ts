import { FeatbitLogger } from "./FeatbitLogger";

export default class TestLogger implements FeatbitLogger {
  public logs: string[] = [];

  error(...args: unknown[]): void {
    this.logs.push(args.join(" "));
  }

  warn(...args: unknown[]): void {
    this.logs.push(args.join(" "));
  }

  info(...args: unknown[]): void {
    this.logs.push(args.join(" "));
  }

  debug(...args: unknown[]): void {
    this.logs.push(args.join(" "));
  }

  log(...args: unknown[]): void {
    this.logs.push(args.join(" "));
  }

  reset() {
    this.logs = [];
  }
}
