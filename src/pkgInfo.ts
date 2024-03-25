import path from "path";
import fs from "fs-extra";

/**
 * 这个可以是全局的
 */
export class PkgInfo {
  // 缓存 dir -> package.json 内容
  private cache = new Map<
    string,
    {
      name: string;
      version: string;
    }
  >();

  async getInfo(dir: string) {
    let maxCount = 10;
    let count = 0;

    const needCacheDirs = new Set<string>([dir]);

    do {
      if (this.cache.has(dir)) {
        return this.cache.get(dir)!;
      }

      const pkgPath = path.resolve(dir, "package.json");
      if (await fs.exists(pkgPath)) {
        const pkg = await fs.readJson(pkgPath);
        if (pkg.name && pkg.version) {
          // save cache
          needCacheDirs.forEach((d) => this.cache.set(d, pkg));
          return pkg;
        }
      }
      dir = path.resolve(dir, "..");
      needCacheDirs.add(dir);
    } while (count++ < maxCount);

    console.log(`name or version is empty in: ${dir}`);
  }
}
