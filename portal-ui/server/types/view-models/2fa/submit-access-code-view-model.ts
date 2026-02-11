type ValidationErrors = { text: string; href: string };

export type submitAccessCodeViewModel = {
  attemptsLeft?: number;
  requestNewCodeUrl: string;
  errors?: false | { errorSummary: ValidationErrors[]; fieldErrors: object };
  email?: string;
};
