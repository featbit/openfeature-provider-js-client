import { EvaluationContext, Logger } from "@openfeature/web-sdk";
import { ICustomizedProperty, IUser } from "featbit-js-client-sdk/esm/types";
import { FeatbitLogger } from "./FeatbitLogger";
import _ from "lodash";

export function translateContext(
  evaluationContext: EvaluationContext,
  featbitLogger: FeatbitLogger
): IUser | undefined {
  // 初始化一个基本的IUser对象
  const user: IUser = {
    keyId: "",
    name: "",
    customizedProperties: undefined,
  };

  // 遍历evaluationContext中的其他属性
  for (const key in evaluationContext) {
    if (evaluationContext.hasOwnProperty(key) && key !== "targetingKey") {
      const value = evaluationContext[key];

      // 根据key映射到IOption的相应属性
      switch (key) {
        case "keyId":
          user.keyId = String(value);
          break;
        case "name":
          user.name = String(value);
          break;
        case "customizedProperties":
          if (
            Array.isArray(value) &&
            value.every(
              (item) =>
                item !== null &&
                typeof item === "object" &&
                "name" in item &&
                "value" in item
            )
          ) {
            user.customizedProperties =
              value as unknown as ICustomizedProperty[];
          } else {
            user.customizedProperties = undefined;
          }
          break;
        default:
          featbitLogger.warn(
            `Unrecognized property '${key}' in EvaluationContext`
          );
          break;
      }
    }
  }

  return user;
}
