import { Logger } from "@openfeature/web-sdk";
export default interface FeatbitLogger extends Logger {
    log: (...args: any[]) => void;
    error: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    info: (...args: any[]) => void;
    debug: (...args: any[]) => void;
}
//# sourceMappingURL=FeatbitLogger.d.ts.map