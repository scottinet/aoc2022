export class OrderedSet {
    constructor() {
        this.items = [];
    }
    has(other) {
        return this.items.some((item) => item.equals(other));
    }
    get first() {
        return this.items[0];
    }
    get last() {
        return this.items[this.items.length - 1];
    }
    push(other) {
        if (!this.has(other)) {
            this.items.push(other);
            return true;
        }
        return false;
    }
    pushBack(other) {
        if (!this.has(other)) {
            this.items.unshift(other);
            return true;
        }
        return false;
    }
    remove(other) {
        const previousLength = this.items.length;
        this.items = this.items.filter((item) => !item.equals(other));
        return previousLength !== this.items.length;
    }
    get length() {
        return this.items.length;
    }
    values() {
        return this.items;
    }
    search(predicate) {
        return this.items.filter((value) => predicate(value));
    }
    isEmpty() {
        return this.items.length === 0;
    }
}
