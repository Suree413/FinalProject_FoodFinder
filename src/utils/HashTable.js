export class HashTable {
  constructor(bucketCount = 53) {
    if (!Number.isInteger(bucketCount) || bucketCount < 1) {
      throw new RangeError("Hash table bucket count must be a positive integer");
    }

    this.bucketCount = bucketCount;
    this.buckets = Array.from({ length: bucketCount }, () => []);
    this.count = 0;
  }

  _normalizeKey(key) {
    if (key === null || key === undefined) {
      throw new TypeError("Hash table keys cannot be null or undefined");
    }
    return String(key);
  }

  _hash(key) {
    const normalizedKey = this._normalizeKey(key);
    let hash = 0;

    for (let index = 0; index < normalizedKey.length; index += 1) {
      hash = (hash * 31 + normalizedKey.charCodeAt(index)) % this.bucketCount;
    }

    return hash;
  }

  set(key, value) {
    const normalizedKey = this._normalizeKey(key);
    const bucket = this.buckets[this._hash(normalizedKey)];
    const existing = bucket.find((entry) => entry.key === normalizedKey);

    if (existing) {
      existing.value = value;
      return;
    }

    bucket.push({ key: normalizedKey, value });
    this.count += 1;
  }

  get(key) {
    const normalizedKey = this._normalizeKey(key);
    const entry = this.buckets[this._hash(normalizedKey)].find(
      (item) => item.key === normalizedKey,
    );
    return entry?.value;
  }

  has(key) {
    const normalizedKey = this._normalizeKey(key);
    return this.buckets[this._hash(normalizedKey)].some(
      (entry) => entry.key === normalizedKey,
    );
  }

  remove(key) {
    const normalizedKey = this._normalizeKey(key);
    const bucket = this.buckets[this._hash(normalizedKey)];
    const index = bucket.findIndex((entry) => entry.key === normalizedKey);

    if (index < 0) return false;

    bucket.splice(index, 1);
    this.count -= 1;
    return true;
  }
}
