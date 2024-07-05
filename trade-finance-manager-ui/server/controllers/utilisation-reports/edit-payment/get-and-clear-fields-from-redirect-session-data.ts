import { Request } from 'express';
import { PaymentErrorsViewModel } from '../../../types/view-models';
import { getUnlinkPaymentFeesError } from '../helpers/get-unlink-payment-fees-error-helper';

const clearRedirectSessionData = (req: Request): void => {
  delete req.session.unlinkPaymentFeesErrorKey;
};

export const getAndClearFieldsFromRedirectSessionData = (
  req: Request,
): {
  errors: PaymentErrorsViewModel | undefined;
  allCheckboxesChecked?: boolean;
} => {
  const { unlinkPaymentFeesErrorKey } = req.session;

  if (!unlinkPaymentFeesErrorKey) {
    return {
      errors: undefined,
    };
  }

  const allCheckboxesChecked = unlinkPaymentFeesErrorKey === 'all-fee-records-selected';

  switch (unlinkPaymentFeesErrorKey) {
    case 'no-fee-records-selected':
    case 'all-fee-records-selected':
      clearRedirectSessionData(req);
      return {
        errors: {
          errorSummary: getUnlinkPaymentFeesError(unlinkPaymentFeesErrorKey),
        },
        allCheckboxesChecked,
      };
    default:
      clearRedirectSessionData(req);
      throw new Error(`Unrecognised unlink payment fees error key '${unlinkPaymentFeesErrorKey}'`);
  }
};
