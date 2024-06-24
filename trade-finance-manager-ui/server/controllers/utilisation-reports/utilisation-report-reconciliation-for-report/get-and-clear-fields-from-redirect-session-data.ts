import { Request } from 'express';
import { ErrorSummaryViewModel } from '../../../types/view-models';
import { getAddPaymentError } from '../helpers/get-add-payment-error-helper';
import { getGenerateKeyingDataError } from '../helpers';

const clearRedirectSessionData = (req: Request): void => {
  delete req.session.addPaymentErrorKey;
  delete req.session.checkedCheckboxIds;
  delete req.session.generateKeyingDataErrorKey;
};

export const getAndClearFieldsFromRedirectSessionData = (
  req: Request,
): {
  errorSummary: [ErrorSummaryViewModel] | undefined;
  isCheckboxChecked: (checkboxId: string) => boolean;
} => {
  const { addPaymentErrorKey, generateKeyingDataErrorKey } = req.session;

  if (generateKeyingDataErrorKey) {
    clearRedirectSessionData(req);
    switch (generateKeyingDataErrorKey) {
      case 'no-matching-fee-records':
        return {
          errorSummary: getGenerateKeyingDataError(generateKeyingDataErrorKey),
          isCheckboxChecked: () => false,
        };
      default:
        throw new Error(`Unrecognised generate keying data error key '${generateKeyingDataErrorKey}'`);
    }
  }

  if (!addPaymentErrorKey) {
    return {
      errorSummary: undefined,
      isCheckboxChecked: () => false,
    };
  }

  const checkedCheckboxIds = { ...req.session.checkedCheckboxIds };

  const isCheckboxChecked = (checkboxId: string): boolean => Boolean(checkedCheckboxIds[checkboxId]);

  switch (addPaymentErrorKey) {
    case 'no-fee-records-selected':
    case 'different-fee-record-statuses':
    case 'different-fee-record-payment-currencies':
    case 'multiple-does-not-match-selected':
      clearRedirectSessionData(req);
      return { errorSummary: getAddPaymentError(addPaymentErrorKey), isCheckboxChecked };
    default:
      clearRedirectSessionData(req);
      throw new Error(`Unrecognised add payment error key '${addPaymentErrorKey}'`);
  }
};
