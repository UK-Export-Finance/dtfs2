export interface NumberGeneratorResponse {
  readonly status: number;
  readonly data: Array<{
    id: number;
    maskedId: number;
    type: number;
    createdBy: string;
    createdDatetime: string;
    requestingSystem: string;
  }>;
}

export interface NumberGeneratorErrorResponse {
  readonly status: number;
  readonly error: object;
}
