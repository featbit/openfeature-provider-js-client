import { EvaluationContext, Logger } from "@openfeature/web-sdk";
import { IFeatureFlag, IOption, IUser } from "featbit-js-client-sdk/esm/types";
import { FeatbitLogger } from "./FeatbitLogger";
import _ from "lodash";

function validateUserName(
  userName: string,
  featbitLogger: FeatbitLogger
): void {
  if (_.isEmpty(userName)) {
    featbitLogger.error("User name is empty");
  }
}

function validateKeyId(keyId: string, featbitLogger: FeatbitLogger): void {
  if (_.isEmpty(keyId)) {
    featbitLogger.error("Key id is empty");
  }
}

export function translateContext(
  evaluationContext: EvaluationContext,
  featbitLogger: Logger
): IOption | undefined {
  const secretInput = evaluationContext.targetingKey;
  if (secretInput === undefined) {
    featbitLogger.error("Secret is undefined");
    return;
  }

  // 初始化一个基本的IOption对象
  const option: IOption = {
    secret: secretInput,
    // 初始化其他可能的属性
    anonymous: undefined,
    bootstrap: undefined,
    devModePassword: undefined,
    api: undefined,
    appType: undefined,
    user: undefined,
    enableDataSync: undefined,
  };

  // 遍历evaluationContext中的其他属性
  for (const key in evaluationContext) {
    if (evaluationContext.hasOwnProperty(key) && key !== "targetingKey") {
      const value = evaluationContext[key];

      // 根据key映射到IOption的相应属性
      switch (key) {
        case "anonymous":
          option.anonymous = Boolean(value);
          break;
        case "bootstrap":
          if (
            Array.isArray(value) &&
            value.every(
              (item) =>
                item !== null &&
                typeof item === "object" &&
                "flagName" in item &&
                "flagValue" in item
            )
          ) {
            option.bootstrap = value as unknown as IFeatureFlag[];
          } else {
            option.bootstrap = undefined;
          }
          break;
        case "devModePassword":
          option.devModePassword = String(value);
          break;
        case "api":
          option.api = String(value);
          break;
        case "appType":
          option.appType = String(value);
          break;
        case "user":
          if (
            typeof value === "object" &&
            value !== null &&
            "name" in value &&
            "keyId" in value
          ) {
            option.user = value as unknown as IUser;
          } else {
            option.user = undefined;
          }
          break;
        case "enableDataSync":
          option.enableDataSync = Boolean(value);
          break;
        default:
          featbitLogger.warn(
            `Unrecognized property '${key}' in EvaluationContext`
          );
          break;
      }
    }
  }

  return option;
}
