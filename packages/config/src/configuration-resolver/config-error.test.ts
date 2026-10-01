import { describe, expect, it } from "vitest";
import { ConfigError } from "./config-error.ts";

describe("ConfigError", () => {
  it("defaults retryable to false and preserves code/details", () => {
    const error = new ConfigError({
      code: "INVALID_CONFIG",
      message: "bad config",
      details: { path: "execution.parallelism" },
    });

    expect(error.code).toBe("INVALID_CONFIG");
    expect(error.retryable).toBe(false);
    expect(error.details).toEqual({ path: "execution.parallelism" });
    expect(error.category).toBe("CONTRACT");
    expect(error).toBeInstanceOf(Error);
  });
});
