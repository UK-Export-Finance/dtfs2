export class InvalidEnvironmentVariableError {
  public readonly message: string;

  public readonly name: string;

  constructor(message: string) {
    this.message = message;
    this.name = this.constructor.name;
  }
}
