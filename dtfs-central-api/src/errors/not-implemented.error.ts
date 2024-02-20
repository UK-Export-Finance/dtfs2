export class NotImplementedError extends Error {
  constructor(message: string = 'Not implemented') {
    super(message);
    this.name = this.constructor.name;
  }
}
