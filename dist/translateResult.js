export default function translateResult(result, reason, logger) {
    const resolution = {
        value: result,
        reason: reason,
    };
    logger.info(resolution.reason);
    return resolution;
}
//# sourceMappingURL=translateResult.js.map