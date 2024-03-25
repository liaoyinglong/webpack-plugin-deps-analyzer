import path from "path";
import type { Compiler, ResolveData } from "webpack";
import fs from "fs-extra";

class DepsAnalyzer {
  static name = "DepsAnalyzer";

  // 存储依赖版本
  // key - name
  // value - versions
  deps = new Map<string, Set<string>>();

  // 存储依赖文件
  // key - name@version
  // value - files
  depsFiles = new Map<string, Set<string>>();

  private projectFileKey = "$$project";
  private addProjectSourceFile(file: string) {
    let s = this.depsFiles.get(this.projectFileKey);
    if (!s) {
      s = new Set();
      this.depsFiles.set(this.projectFileKey, s);
    }
    s.add(file);
  }

  private handleDepsFile(name: string, version: string, file: string): boolean {
    if (!name || !version) {
      console.log(`name or version is empty in: 
      ${file}`);

      return false;
    }
    {
      let s = this.deps.get(name);
      if (!s) {
        s = new Set();
        this.deps.set(name, s);
      }
      s.add(version);
    }

    {
      const key = `${name}@${version}`;
      let s = this.depsFiles.get(key);
      if (!s) {
        s = new Set();
        this.depsFiles.set(key, s);
      }
      s.add(file);
    }

    return true;
  }

  private async resolveDep(data: ResolveData) {
    const res = data.createData.resourceResolveData as ResourceResolveData;
    let { name, version } = res.descriptionFileData;
    let dir = res.descriptionFileRoot;
    let maxCount = 10;
    let count = 0;

    do {
      if (name && version) {
        return { name, version };
      }
      // 向上一级目录查找 package.json
      dir = path.resolve(dir, "..");
      const pkgPath = path.resolve(dir, "package.json");

      if (await fs.exists(pkgPath)) {
        const pkg = await fs.readJson(pkgPath);
        name = pkg.name;
        version = pkg.version;
      }

      // 读取 package.json
    } while (count++ < maxCount);

    if (!name || !version) {
      console.log(`name or version is empty in: 
      ${res.descriptionFilePath}`);
      return;
    }
  }

  apply(compiler: Compiler) {
    console.log("DepsAnalyzer is running...");

    compiler.hooks.normalModuleFactory.tap(
      `${DepsAnalyzer.name}.normalModuleFactory`,
      (normalModuleFactory) => {
        normalModuleFactory.hooks.afterResolve.tapPromise(
          `${DepsAnalyzer.name}.normalModuleFactory.afterResolve`,
          async (data) => {
            const resolvedId = data.createData.resource;
            if (!resolvedId) {
              return;
            }
            // 判断是否在 node_modules 中
            if (!resolvedId.includes("node_modules")) {
              // 说明这是一个源码文件
              this.addProjectSourceFile(resolvedId);
              return;
            }
            // 对于 node_modules 中的文件，我们需要解析出依赖的包名和版本
            const res = await this.resolveDep(data);
            if (res) {
              const { name, version } = res;
              this.handleDepsFile(name, version, resolvedId);
            }
          }
        );
      }
    );

    // 完成编译后输出结果
    compiler.hooks.done.tap(`${DepsAnalyzer.name}.done`, () => {
      console.log("DepsAnalyzer finished");

      {
        // Log 有某些依赖安装了多个版本
        const multiVersionDeps = Array.from(this.deps.entries()).filter(
          ([name, versions]) => versions.size > 1
        );
        if (multiVersionDeps.length > 0) {
          console.log("multiVersionDeps:");
          console.log(multiVersionDeps);
        }
      }
    });
  }
}

type ResourceResolveData = {
  // package.json 文件路径
  descriptionFilePath: string;
  // package.json 文件所在目录
  descriptionFileRoot: string;
  // package.json 文件内容
  descriptionFileData: {
    name?: string;
    version?: string;
  };
};

export default DepsAnalyzer;
