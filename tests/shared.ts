import webpack from "webpack";
import path from "path";
import DepsAnalyzer from "../src";

import fs from "fs-extra";

// 运行 webpack build main.js
export async function runWebpackBuild(name: string) {
  const { reject, resolve, promise } = Promise.withResolvers();
  const entry = path.resolve(__dirname, `fixtures/${name}/main.js`);
  const output = path.resolve(__dirname, `fixtures/${name}/dist`);

  // check entry file exists
  if (!(await fs.exists(entry))) {
    reject(new Error(`entry file not exists: ${entry}`));
    return promise;
  }

  webpack(
    {
      name,
      entry,
      output: {
        path: output,
        filename: "bundle.js",
      },
      mode: "development",
      plugins: [new DepsAnalyzer()],
    },
    (err, stats) => {
      if (err) {
        console.error(`build with error`, err);
        reject(err);
      } else {
        console.log("build success");

        resolve(stats);
      }
    }
  );

  return await promise;
}
