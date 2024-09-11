export type ViewModelErrors = {
  errorSummary: { text: string; href: string }[];
  fieldErrors: Record<string, { text: string }>;
};
