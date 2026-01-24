// queue.js
class BoundedQueue {
    constructor(maxSize) {
        this.maxSize = maxSize;
        this.q = [];
    }

    enqueue(item) {
        if (this.q.length >= this.maxSize) return false;
        this.q.push(item);
        return true;
    }

    dequeue() {
        return this.q.shift();
    }

    size() {
        return this.q.length;
    }
}

module.exports = { BoundedQueue };
