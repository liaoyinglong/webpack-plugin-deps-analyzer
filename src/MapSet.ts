export class MapSet<K extends string = string, V = string> extends Map<K, Set<V>> {
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
    for (const [key, value] of this) {
      r[key] = [...value];
    }
    return r;
  }
}
