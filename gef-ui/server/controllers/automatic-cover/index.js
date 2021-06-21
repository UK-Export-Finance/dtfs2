import { decode } from 'html-entities';
import * as api from '../../services/api';
import { validationErrorHandler } from '../../utils/helpers';

const automaticCover = async (req, res) => {
  const { params } = req;
  const { applicationId } = params;

  try {
    const { terms } = await api.getEligibilityCriteria();

    return res.render('partials/automatic-cover.njk', {
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

  const { body, params } = req;
  const { applicationId } = params;

  try {
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

    // If form has at least 1 false, then redirect user to not eligible page
    if (fieldContainsAFalseBoolean(body)) {
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
