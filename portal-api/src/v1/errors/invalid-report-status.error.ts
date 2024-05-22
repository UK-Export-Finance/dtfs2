import { HttpStatusCode } from 'axios';

export class InvalidReportStatusError extends Error {
  public status: number;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    this.status = HttpStatusCode.InternalServerError;
  }
}
