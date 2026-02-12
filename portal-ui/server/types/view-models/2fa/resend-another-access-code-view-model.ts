type ValidationErrors = { text: string; href: string };

export type ResendAnotherAccessCodeViewModel = {
  attemptsLeft?: number;
  requestNewCodeUrl: string;
  errors?: false | { errorSummary: ValidationErrors[]; fieldErrors: object };
};
