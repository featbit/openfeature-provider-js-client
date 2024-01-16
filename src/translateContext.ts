import { IUser, ICustomizedProperty } from "featbit-js-client-sdk/src/types";
import { EvaluationContext, Logger } from "@openfeature/web-sdk";

const builtInKeys = ["key", "name", "custom", "targetingKey"];

export function translateContext(
  evaluationContext: EvaluationContext,
  featbitLogger: Logger
): IUser | undefined {
  const custom: ICustomizedProperty[] = (evaluationContext.custom ||
    []) as unknown as ICustomizedProperty[];
  const name = (evaluationContext.name as string) || "";
  const keyId = (evaluationContext.targetingKey as string) || "";
  if (keyId === "") {
    featbitLogger.error(
      "The EvaluationContext must contain either a 'targetingKey' or a 'key' and the " +
        "type must be a string."
    );
  }
  // 初始化一个基本的IUser对象
  const user: IUser = {
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

  // 从 evalContext 中添加额外的属性到 custom
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
