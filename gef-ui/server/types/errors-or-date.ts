import { ValidationError } from './validation-error';

export type ErrorsOrDate =
  | {
      errors: null;
      date: Date;
    }
  | {
      errors: ValidationError[];
    };
