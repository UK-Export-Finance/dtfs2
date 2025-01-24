import { ValidationError } from './validation-error';

export type ErrorsOrValue<T> =
  | {
      value: T;
    }
  | {
      errors: ValidationError[];
    };
