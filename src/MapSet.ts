export class MapSet<
  K extends string = string,
  V extends string = string,
> extends Map<K, Set<V>> {
  append(key: K, value: V) {
    let s = this.get(key);
    if (!s) {
      s = new Set<V>();
      this.set(key, s);
    }
    s.add(value);
  }

  toJson() {
    const r = {} as Record<K, V[]>;

    // 用 en 的方式排序
    const keys = [...this.keys()].sort((a, b) => a.localeCompare(b, "en"));

    keys.forEach((k) => {
      const v = this.get(k)!;
      r[k] = [...v].sort((a, b) => a.localeCompare(b, "en"));
    });

    return r;
  }
}
