import { test, expect, describe, vi } from "vitest";
import { runWebpackBuild } from "./shared";

describe("DepsAnalyzer", () => {
  test("web3Modal", async () => {
    const plugin = await runWebpackBuild("web3Modal");

    expect(plugin.deps.size).gt(0);
    expect(plugin.depsFiles.size).gt(0);
    expect(plugin.issuer.size).gt(0);

    expect(plugin.deps.toJson()).toMatchSnapshot();
  });
});
