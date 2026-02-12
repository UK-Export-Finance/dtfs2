type ValidationErrors = { text: string; href: string };

export type NewAccessCodeViewModel = {
  attemptsLeft?: number;
  requestNewCodeUrl: string;
  errors?: false | { errorSummary: ValidationErrors[]; fieldErrors: object };
};
