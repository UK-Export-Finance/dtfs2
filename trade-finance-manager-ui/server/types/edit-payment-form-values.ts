export type EditPaymentFormValues = {
  paymentAmount?: string;
  paymentDate: {
    day?: string;
    month?: string;
    year?: string;
  };
  paymentReference?: string;
};
