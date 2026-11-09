export class HashTable {
  constructor(size = 50) {
    this.size = size;
    this.buckets = new Array(size).fill(null).map(() => []);
  }

  _hash(key) {
    let hash = 0;
    const stringKey = String(key);
    for (let i = 0; i < stringKey.length; i++) {
      hash = (hash + stringKey.charCodeAt(i) * i) % this.size;
    }
    return hash;
  }

  set(key, value) {
    const index = this._hash(key);
    const bucket = this.buckets[index];
    
    const existing = bucket.find(item => item.key === key);
    if (existing) {
      existing.value = value;
    } else {
      bucket.push({ key, value });
    }
  }

  get(key) {
    const index = this._hash(key);
    const bucket = this.buckets[index];
    const found = bucket.find(item => item.key === key);
    return found ? found.value : undefined;
  }

  has(key) {
    const index = this._hash(key);
    return this.buckets[index].some(item => item.key === key);
  }

  remove(key) {
    const index = this._hash(key);
    const bucket = this.buckets[index];
    const idx = bucket.findIndex(item => item.key === key);
    if (idx >= 0) {
      bucket.splice(idx, 1);
      return true;
    }
    return false;
  }
}
