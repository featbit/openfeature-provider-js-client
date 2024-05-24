import { IUser, IContextProperty, ILogger } from "@featbit/js-client-sdk";
import { EvaluationContext } from "@openfeature/web-sdk";

const builtInKeys = ["key", "name", "custom", "targetingKey"];

export function translateContext(evaluationContext: EvaluationContext, logger: ILogger): IUser | undefined {
  const custom: IContextProperty[] = (evaluationContext.custom || []) as unknown as IContextProperty[];
  const name = evaluationContext.name as string || "";
  const key: string = evaluationContext.targetingKey || evaluationContext.key as string || evaluationContext.keyId as string || '';

  if (key === "") {
    logger.error(
      "The EvaluationContext must contain either a 'targetingKey' or a 'key' or a 'keyId' and the " +
        "type must be a string."
    );
  }

  const user: IUser = {
    keyId: key,
    name: name,
    customizedProperties: [],
  };

  if (custom) {
    if (Array.isArray(custom)) {
      custom.forEach(({ name, value }) => {
        if (name) {
          user.customizedProperties.push({
            name: name,
            value: value as unknown as string,
          });
        }
      });
    } else if (typeof custom === "object") {
      Object.entries(custom).forEach(([key, value]) => {
        if (key) {
          user.customizedProperties.push({
            name: key,
            value: value as unknown as string,
          });
        }
      });
    }
  }

  // add properties from evalContext to custom
  Object.entries(evaluationContext).forEach(([key, value]) => {
    if (!builtInKeys.includes(key)) {
      user.customizedProperties.push({
        name: key,
        value: value as unknown as string,
      });
    }
  });

  return user;
}
