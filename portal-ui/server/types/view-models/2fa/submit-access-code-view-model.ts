type ValidationErrors = { text: string; href: string };

type FieldError = {
  text: string;
  order?: string;
};

type ValidationErrorsObject = Record<string, FieldError>;

export type submitAccessCodeViewModel = {
  attemptsLeft?: number;
  requestNewCodeUrl: string;
  errors?: false | { errorSummary: ValidationErrors[]; fieldErrors: object };
  validationErrors?: ValidationErrorsObject | null;
  email?: string;
  signInOTP?: string;
};
