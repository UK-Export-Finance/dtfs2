import { Request, Response } from 'express';
import { asLoggedInUserSession } from '../../../../helpers/express-session';
import { PRIMARY_NAV_KEY } from '../../../../constants';
import api from '../../../../api';
import { RecordCorrectionHistoryViewModel } from '../../../../types/view-models/record-correction/record-correction-history';
import { mapCompletedCorrectionsToViewModel } from './helpers';

/**
 * Controller for the GET record correction history route.
 * @param req - The request object
 * @param res - The response object
 */
export const getRecordCorrectionHistory = async (req: Request, res: Response) => {
  const { user, userToken } = asLoggedInUserSession(req.session);

  try {
    const bankId = user.bank.id;

    const completedCorrections = await api.getCompletedFeeRecordCorrections(userToken, bankId);

    const mappedCompletedCorrections = mapCompletedCorrectionsToViewModel(completedCorrections);

    const viewModel: RecordCorrectionHistoryViewModel = {
      user,
      primaryNav: PRIMARY_NAV_KEY.RECORD_CORRECTION_HISTORY,
      completedCorrections: mappedCompletedCorrections,
    };

    return res.render('utilisation-report-service/record-correction/correction-history.njk', viewModel);
  } catch (error) {
    console.error('Failed to get record correction history %o', error);
    return res.render('_partials/problem-with-service.njk', { user });
  }
};
