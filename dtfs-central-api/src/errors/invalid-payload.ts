export class InvalidPayloadError extends Error {
  public status: number = 400;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
};
