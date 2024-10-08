export type EditPaymentFormValues = {
  paymentAmount?: string;
  paymentDate: {
    day?: string;
    month?: string;
    year?: string;
  };
  paymentReference?: string;
};

export type ValidatedEditPaymentFormValues = {
  paymentAmount: string;
  paymentDate: {
    day: string;
    month: string;
    year: string;
  };
  paymentReference?: string;
};

export type ParsedEditPaymentFormValues = {
  paymentAmount: number;
  datePaymentReceived: Date;
  paymentReference: string | null;
};
