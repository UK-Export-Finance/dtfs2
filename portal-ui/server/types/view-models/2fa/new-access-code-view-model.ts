export type NewAccessCodeViewModel = {
  attemptsLeft?: number;
  requestNewCodeUrl: string;
  errors?: false | { errorSummary: any[]; fieldErrors: object };
};
