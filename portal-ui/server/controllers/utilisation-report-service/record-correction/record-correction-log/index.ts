import { Request, Response } from 'express';
import { asLoggedInUserSession } from '../../../../helpers/express-session';
import { PRIMARY_NAV_KEY } from '../../../../constants';
import api from '../../../../api';
import { RecordCorrectionLogViewModel } from '../../../../types/view-models/record-correction/record-correction-log';
import { mapCompletedCorrectionsToViewModel } from './helpers';

/**
 * Controller for the GET record correction log route.
 * @param req - The request object
 * @param res - The response object
 */
export const getRecordCorrectionLog = async (req: Request, res: Response) => {
  const { user, userToken } = asLoggedInUserSession(req.session);

  try {
    const bankId = user.bank.id;

    const completedCorrections = await api.getCompletedFeeRecordCorrections(userToken, bankId);

    const mappedCompletedCorrections = mapCompletedCorrectionsToViewModel(completedCorrections);

    const viewModel: RecordCorrectionLogViewModel = {
      user,
      primaryNav: PRIMARY_NAV_KEY.RECORD_CORRECTION_LOG,
      completedCorrections: mappedCompletedCorrections,
    };

    return res.render('utilisation-report-service/record-correction/correction-log.njk', viewModel);
  } catch (error) {
    console.error('Failed to get record correction log %o', error);
    return res.render('_partials/problem-with-service.njk', { user });
  }
};
