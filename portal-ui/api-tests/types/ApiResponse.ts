export type ApiResponse = {
  status: number;
  headers: {
    location?: string;
    [key: string]: unknown;
  };
};
