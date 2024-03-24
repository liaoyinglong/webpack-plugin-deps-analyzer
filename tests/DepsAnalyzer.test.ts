import { test, expect, mock, describe } from "bun:test";
import { runWebpackBuild } from "./shared";
const random = mock(() => Math.random());

describe("DepsAnalyzer", () => {
  test("web3Modal", async () => {
    await runWebpackBuild("web3Modal");
  });
});
