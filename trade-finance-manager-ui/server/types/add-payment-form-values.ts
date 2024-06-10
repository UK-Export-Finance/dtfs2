export type AddPaymentFormValues = {
  paymentCurrency?: string;
  paymentAmount?: string;
  paymentDate: {
    day?: string;
    month?: string;
    year?: string;
  };
  paymentReference?: string;
  addAnotherPayment?: string;
};
