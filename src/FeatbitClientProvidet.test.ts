import { describe, expect, test } from "@jest/globals";
import TestLogger from "./TestLogger";
import { Client, ErrorCode, OpenFeature } from "@openfeature/web-sdk";
import { FeatbitClientProvider } from "./FeatbitClientProvider";
import { translateContext } from "./translateContext";

jest.mock("featbit-js-client-sdk", () => {
  const actualModule = jest.requireActual("featbit-js-client-sdk");
  return {
    __esModule: true,
    ...actualModule,
    initialize: jest.fn(),
  };
});

import { FB } from "featbit-js-client-sdk";

const logger: TestLogger = new TestLogger();
const testFlagKey = "game-runner";
