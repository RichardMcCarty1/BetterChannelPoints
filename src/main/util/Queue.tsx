export class Queue {

  private elements: Record<string, unknown>;

  private head: number;

  private tail: number;

  constructor() {
    this.elements = {};
    this.head = 0;
    this.tail = 0;
  }

  enqueue = (element: unknown) => {
    this.elements[this.tail] = element;
    // eslint-disable-next-line no-plusplus
    this.tail++;
  };

  dequeue() {
    const item = this.elements[this.head];
    delete this.elements[this.head];
    // eslint-disable-next-line no-plusplus
    this.head++;
    return item;
  }

  peek() {
    return this.elements[this.head];
  }

  get length() {
    return this.tail - this.head;
  }

  get isEmpty() {
    return this.length === 0;
  }

}
