export type ResendAnotherAccessCodeViewModel = {
  attemptsLeft?: number;
  requestNewCodeUrl: string;
  errors?: false | { errorSummary: any[]; fieldErrors: object };
};
