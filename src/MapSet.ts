export class MapSet<K = string, V = string> extends Map<K, Set<V>> {
  append(key: K, value: V) {
    let s = this.get(key);
    if (!s) {
      s = new Set<V>();
      this.set(key, s);
    }
    s.add(value);
  }
}
