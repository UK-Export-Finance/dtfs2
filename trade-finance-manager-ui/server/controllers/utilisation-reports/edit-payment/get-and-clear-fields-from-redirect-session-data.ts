import { Request } from 'express';
import { PaymentErrorsViewModel } from '../../../types/view-models';
import { getUnlinkPaymentFeesError } from '../helpers/get-unlink-payment-fees-error-helper';

const clearRedirectSessionData = (req: Request): void => {
  delete req.session.unlinkPaymentFeesErrorKey;
  delete req.session.checkedCheckboxIds;
};

export const getAndClearFieldsFromRedirectSessionData = (
  req: Request,
): {
  errors: PaymentErrorsViewModel | undefined;
  isCheckboxChecked: (checkboxId: string) => boolean;
} => {
  const { unlinkPaymentFeesErrorKey } = req.session;

  if (!unlinkPaymentFeesErrorKey) {
    return {
      errors: undefined,
      isCheckboxChecked: () => false,
    };
  }

  const checkedCheckboxIds = { ...req.session.checkedCheckboxIds };

  const isCheckboxChecked = (checkboxId: string): boolean => Boolean(checkedCheckboxIds[checkboxId]);

  switch (unlinkPaymentFeesErrorKey) {
    case 'no-fee-records-selected':
    case 'all-fee-records-selected':
      clearRedirectSessionData(req);
      return {
        errors: {
          errorSummary: getUnlinkPaymentFeesError(unlinkPaymentFeesErrorKey),
        },
        isCheckboxChecked,
      };
    default:
      clearRedirectSessionData(req);
      throw new Error(`Unrecognised unlink payment fees error key '${unlinkPaymentFeesErrorKey}'`);
  }
};
