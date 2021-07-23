import { decode } from 'html-entities';
import * as api from '../../services/api';
import { validationErrorHandler } from '../../utils/helpers';
import { DEAL_SUBMISSION_TYPE } from '../../../constants';

const updateSubmissionType = async (applicationId, isAutomaticCover) => {
  const applicationUpdate = {};

  if (isAutomaticCover) {
    applicationUpdate.submissionType = DEAL_SUBMISSION_TYPE.AIN;
  } else {
    applicationUpdate.submissionType = DEAL_SUBMISSION_TYPE.MIA;
  }

  await api.updateApplication(applicationId, applicationUpdate);
};

const automaticCover = async (req, res) => {
  const { params } = req;
  const { applicationId } = params;

  try {
    const { terms } = await api.getEligibilityCriteria();
    const { coverTermsId } = await api.getApplication(applicationId);
    const { details } = await api.getCoverTerms(coverTermsId);
    return res.render('partials/automatic-cover.njk', {
      selected: details,
      terms: terms.map((term) => ({
        ...term,
        htmlText: decode(term.htmlText),
      })),
      applicationId,
    });
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

const validateAutomaticCover = async (req, res, next) => {
  function AutomaticCoverErrors(fields, items) {
    const receivedFields = Object.keys(fields); // Array of received fields i.e ['coverStart']
    const errorsToDisplay = items.filter(
      (item) => !receivedFields.includes(item.id),
    );

    return errorsToDisplay.map((error) => ({
      errRef: error.id,
      errMsg: error.errMsg,
    }));
  }

  function fieldContainsAFalseBoolean(fields) {
    const receivedFields = Object.values(fields);
    return receivedFields.some((field) => field === 'false');
  }

  const { body, params, query } = req;
  const { applicationId } = params;
  const { saveAndReturn } = query;
  const { coverTermsId } = await api.getApplication(applicationId);

  try {
    if (saveAndReturn) {
      const payload = {
        coverStart: body.coverStart,
        noticeDate: body.noticeDate,
        facilityLimit: body.facilityLimit,
        exporterDeclaration: body.exporterDeclaration,
        dueDiligence: body.dueDiligence,
        facilityLetter: body.facilityLetter,
        facilityBaseCurrency: body.facilityBaseCurrency,
        facilityPaymentCurrency: body.facilityPaymentCurrency,
      };

      await api.updateCoverTerms(coverTermsId, payload);

      const isAutomaticCover = !fieldContainsAFalseBoolean(body);
      await updateSubmissionType(applicationId, isAutomaticCover);

      return res.redirect(`/gef/application-details/${applicationId}`);
    }
    const { terms } = await api.getEligibilityCriteria();
    const automaticCoverErrors = new AutomaticCoverErrors(body, terms);

    if (automaticCoverErrors.length > 0) {
      return res.render('partials/automatic-cover.njk', {
        errors: validationErrorHandler(automaticCoverErrors, 'automatic-cover'),
        selected: body,
        terms: terms.map((term) => ({
          ...term,
          htmlText: decode(term.htmlText),
        })),
        applicationId,
      });
    }

    await api.updateCoverTerms(coverTermsId, body);

    const isAutomaticCover = !fieldContainsAFalseBoolean(body);

    await updateSubmissionType(applicationId, isAutomaticCover);

    if (!isAutomaticCover) {
      return res.redirect(
        `/gef/application-details/${applicationId}/ineligible-automatic-cover`,
      );
    }

    return res.redirect(
      `/gef/application-details/${applicationId}/eligible-automatic-cover`,
    );
  } catch (err) {
    return next(err);
  }
};

export {
  automaticCover,
  validateAutomaticCover,
};
