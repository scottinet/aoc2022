export interface Equatable {
  equals(other: Equatable): boolean;
}

export class OrderedSet<T extends Equatable> {
  private items: T[] = [];

  constructor() {}

  has(other: T): boolean {
    return this.items.some((item) => item.equals(other));
  }

  get first(): T | undefined {
    return this.items[0];
  }

  get last(): T | undefined {
    return this.items[this.items.length - 1];
  }

  push(other: T): boolean {
    if (!this.has(other)) {
      this.items.push(other);
      return true;
    }

    return false;
  }

  pushBack(other: T): boolean {
    if (!this.has(other)) {
      this.items.unshift(other);
      return true;
    }

    return false;
  }

  remove(other: T): boolean {
    const previousLength = this.items.length;
    this.items = this.items.filter((item) => !item.equals(other));

    return previousLength !== this.items.length;
  }

  get length(): number {
    return this.items.length;
  }

  values(): T[] {
    return this.items;
  }

  get(item: T): T | undefined {
    return this.items.find((value) => value.equals(item));
  }

  search(predicate: (value: T) => boolean): T[] {
    return this.items.filter((value) => predicate(value));
  }

  find(predicate: (value: T) => boolean): T | undefined {
    return this.items.find((value) => predicate(value));
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  toString(): string {
    return `OrderedSet(${this.items.length}) {\n${this.items
      .map((i) => "\t" + i.toString())
      .join(",\n")}\n}`;
  }
}
