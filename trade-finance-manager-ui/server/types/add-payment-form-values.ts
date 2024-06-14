import { Currency } from '@ukef/dtfs2-common';

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

export type ValidatedAddPaymentFormValues = {
  paymentCurrency: Currency;
  paymentAmount: string;
  paymentDate: {
    day: string;
    month: string;
    year: string;
  };
  paymentReference?: string;
  addAnotherPayment: 'true' | 'false';
};

export type ParsedAddPaymentFormValues = {
  paymentCurrency: Currency;
  paymentAmount: number;
  datePaymentReceived: Date;
  paymentReference?: string;
};
