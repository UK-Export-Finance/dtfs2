type ValidationErrors = { text: string; href: string };

type FieldError = {
  text: string;
  order?: string;
};

export type ValidationErrorsObject = Record<string, FieldError>;

export type SubmitAccessCodeViewModel = {
  attemptsLeft?: number;
  requestNewCodeUrl: string;
  errors?: { errorSummary: ValidationErrors[]; fieldErrors: ValidationErrorsObject } | null;
  validationErrors?: ValidationErrorsObject | null;
  email?: string;
  sixDigitAccessCode?: string;
};
