type ValidationErrors = { text: string; href: string };

export type CheckYourEmailAccessCodeViewModel = {
  attemptsLeft?: number;
  requestNewCodeUrl: string;
  errors?: false | { errorSummary: ValidationErrors[]; fieldErrors: Record<string, ValidationErrors> };
  email?: string;
};
