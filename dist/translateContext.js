const builtInKeys = ["key", "name", "custom", "targetingKey"];
export function translateContext(evaluationContext, featbitLogger) {
    const custom = (evaluationContext.custom ||
        []);
    const name = evaluationContext.name || "";
    const keyId = evaluationContext.targetingKey || "";
    if (keyId === "") {
        featbitLogger.error("The EvaluationContext must contain either a 'targetingKey' or a 'key' and the " +
            "type must be a string.");
    }
    // 初始化一个基本的IUser对象
    const user = {
        keyId: keyId,
        name: name,
        customizedProperties: undefined,
    };
    if (custom) {
        if (Array.isArray(custom)) {
            custom.forEach(({ name, value }) => {
                if (name) {
                    user.customizedProperties.push({
                        name: name,
                        value: value,
                    });
                }
            });
        }
        else if (typeof custom === "object") {
            Object.entries(custom).forEach(([key, value]) => {
                if (key) {
                    user.customizedProperties.push({
                        name: key,
                        value: value,
                    });
                }
            });
        }
    }
    // 从 evalContext 中添加额外的属性到 custom
    Object.entries(evaluationContext).forEach(([key, value]) => {
        if (!builtInKeys.includes(key)) {
            user.customizedProperties.push({
                name: key,
                value: value,
            });
        }
    });
    return user;
}
//# sourceMappingURL=translateContext.js.map