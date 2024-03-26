import webpack from "webpack";
import path from "path";
import DepsAnalyzer from "../src";

import fs from "fs-extra";

// 运行 webpack build main.js
export async function runWebpackBuild(name: string) {
  const entry = path.resolve(__dirname, `fixtures/${name}/main.js`);
  const output = path.resolve(__dirname, `fixtures/${name}/dist`);

  // check entry file exists
  if (!(await fs.exists(entry))) {
    throw new Error(`entry file not exists: ${entry}`);
  }

  // clean output dir
  await fs.remove(output);

  const plugin = new DepsAnalyzer({
    outDir: output,
    logFileCount: true,
    logMultiDeps: true,
  });

  return new Promise<DepsAnalyzer>((resolve, reject) => {
    webpack(
      {
        name,
        entry,
        output: {
          path: output,
          filename: "bundle.js",
        },
        mode: "production",
        plugins: [plugin],
        optimization: {
          minimize: false,
        },
      },
      (err, stats) => {
        if (err) {
          console.error(`build with error`, err);
          reject(err);
        } else {
          resolve(plugin);
        }
      }
    );
  });
}
