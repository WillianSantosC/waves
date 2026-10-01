import { describe, expect, it } from "vitest";
import { ProjectDiscoveryError } from "./project-discovery-error.ts";

describe("ProjectDiscoveryError", () => {
  it("carries the operational category, code, and details", () => {
    const error = new ProjectDiscoveryError({
      code: "DISCOVERY_REPOSITORY_ROOT_NOT_FOUND",
      message: "not found",
      retryable: false,
      details: { repositoryRoot: "/tmp/missing" },
    });

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("ProjectDiscoveryError");
    expect(error.category).toBe("OPERATIONAL");
    expect(error.code).toBe("DISCOVERY_REPOSITORY_ROOT_NOT_FOUND");
    expect(error.retryable).toBe(false);
    expect(error.details).toEqual({ repositoryRoot: "/tmp/missing" });
    expect(error.message).toBe("not found");
  });

  it("leaves retryable and details undefined when not provided", () => {
    const error = new ProjectDiscoveryError({ code: "X", message: "x" });

    expect(error.retryable).toBeUndefined();
    expect(error.details).toBeUndefined();
  });
});
