import path from "path";
import type { Compiler, ResolveData } from "webpack";
import fs from "fs-extra";
import { PkgInfo } from "./pkgInfo";
import { MapSet } from "./MapSet";

const pkgInfo = new PkgInfo();

class DepsAnalyzer {
  static name = "DepsAnalyzer";

  // 存储依赖版本
  // key - name
  // value - versions
  deps = new MapSet();

  // 存储依赖文件
  // key - name@version
  // value - files
  depsFiles = new MapSet();

  // 存储依赖被什么文件引用
  // key - name@version
  // value - file
  issuer = new Map<string, string>();

  private projectFileKey = "$$project";
  private addProjectSourceFile(file: string) {
    this.depsFiles.append(this.projectFileKey, file);
  }

  private handleDepsFile(name: string, version: string, file: string): boolean {
    if (!name || !version) {
      console.log(`name or version is empty in: ${file}`);
      return false;
    }
    this.deps.append(name, version);

    {
      const key = this.getKey(name, version);
      this.depsFiles.append(key, file);
    }

    return true;
  }

  private async resolveDep(data: ResolveData) {
    const res = data.createData.resourceResolveData as ResourceResolveData;
    let { name, version } = res.descriptionFileData;
    let dir = res.descriptionFileRoot;
    if (!name || !version) {
      //console.time("getPkgInfo");
      const r = await pkgInfo.getInfo(dir);
      //console.timeEnd("getPkgInfo");
      return r;
    }
    return { name, version };
  }
  private getKey(name: string, version: string) {
    return `${name}@${version}`;
  }

  apply(compiler: Compiler) {
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
            {
              // 对于 node_modules 中的文件，我们需要解析出依赖的包名和版本
              const res = await this.resolveDep(data);
              if (res) {
                const { name, version } = res;
                this.handleDepsFile(name, version, resolvedId);

                {
                  // 记录 issuer
                  const issuer = data.contextInfo.issuer;
                  const key = this.getKey(name, version);
                  // 只需要记录第一次引用就行
                  if (issuer && !this.issuer.has(key)) {
                    this.issuer.set(key, issuer);
                  }
                }
              }
            }
          }
        );
      }
    );

    // 完成编译后输出结果
    compiler.hooks.done.tap(`${DepsAnalyzer.name}.done`, () => {
      {
        // Log 有某些依赖安装了多个版本
        let msg = "";
        this.deps.forEach((versions, name) => {
          if (versions.size > 1) {
            msg += `\n${name}:\n`;
            versions.forEach((version) => {
              const key = this.getKey(name, version);
              msg += ` ${version} imported by: \n`;
              msg += ` ${this.issuer.get(key)}\n`;
            });
          }
        });
        if (msg) {
          console.log("Some dependencies have multiple versions installed:");
          console.log(msg);
        } else {
          //console.log("All dependencies are has only one version.");
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
