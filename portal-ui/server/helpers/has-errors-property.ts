type ApiErrorResponse = {
  errors?: Array<{ msg?: string }>;
};

/**
 * Type guard that checks whether an unknown value looks like an ApiErrorResponse.
 */
export function hasErrorsProperty(obj: unknown): obj is ApiErrorResponse {
  return !!obj && typeof obj === 'object' && !Array.isArray(obj) && 'errors' in obj;
}

export type { ApiErrorResponse };
