import { Response } from 'express';
import { CustomExpressRequest } from '@ukef/dtfs2-common';
import { validationErrorHandler } from '../../utils/helpers';

type BankReviewDateParams = { dealId: string; facilityId: string };
type BankReviewDatePostBody = { 'bank-review-date-day': string; 'bank-review-date-month': string; 'bank-review-date-year': string };

export const getBankReviewDate = (req: CustomExpressRequest<{ params: BankReviewDateParams }>, res: Response) => {
  const {
    params: { dealId, facilityId },
  } = req;

  return res.render('partials/bank-review-date.njk', {
    dealId,
    facilityId,
  });
};

export const postBankReviewDate = (req: CustomExpressRequest<{ reqBody: BankReviewDatePostBody; params: BankReviewDateParams }>, res: Response) => {
  const {
    params: { dealId, facilityId },
    body: { 'bank-review-date-year': bankReviewDateYear },
  } = req;

  // TODO: DTFS2-7162 - add validation
  if (!bankReviewDateYear) {
    return res.render('partials/bank-review-date.njk', {
      errors: validationErrorHandler([
        {
          errRef: 'bankReviewDate',
          errMsg: 'Bank review date must contain a year',
          subFieldErrorRefs: ['bankReviewDate-year'],
        },
      ]),
      dealId,
      facilityId,
    });
  }

  // TODO: DTFS2-7162 - store in database
  // TODO: DTFS2-7162 - handle saveAndReturn

  return res.redirect(`/gef/application-details/${dealId}/facilities/${facilityId}/provided-facility`);
};
