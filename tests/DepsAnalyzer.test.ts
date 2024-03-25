import { test, expect, describe } from "vitest";
import { runWebpackBuild } from "./shared";

describe("DepsAnalyzer", () => {
  test("web3Modal", async () => {
    await runWebpackBuild("web3Modal");
  });
});
