/**
 * 存储依赖被什么文件引用
 * key - name@version
 * value - file
 */
export class IssuerMap extends Map<string, string> {
  toJson() {
    const r = {} as Record<string, string>;

    // 用 en 的方式排序
    const keys = [...this.keys()].sort((a, b) => a.localeCompare(b, "en"));

    keys.forEach((k) => {
      let v = this.get(k)!;
      r[k] = v;
    });
    return r;
  }
}
