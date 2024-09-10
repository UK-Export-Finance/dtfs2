import { ValidationError } from './validation-error';

export type ErrorsOrDate =
  | {
      date: Date;
    }
  | {
      errors: ValidationError[];
    };
