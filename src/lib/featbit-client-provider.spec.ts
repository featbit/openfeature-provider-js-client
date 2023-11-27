import { FeatbitClientProvider } from "./featbit-client-provider";

describe("FeatbitClientProvider", () => {
  it("should be and instance of FeatbitClientProvider", () => {
    expect(new FeatbitClientProvider()).toBeInstanceOf(FeatbitClientProvider);
  });
});
