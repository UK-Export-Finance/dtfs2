import _isEmpty from 'lodash/isEmpty';
import { decode } from 'html-entities';
import * as api from '../../services/api';
import { validationErrorHandler, isTrueSet } from '../../utils/helpers';

const getMandatoryCriteria = async (req, res) => {
  try {
    const criteria = await api.getMandatoryCriteria();

    return res.render('partials/mandatory-criteria.njk', {
      criteria: {
        ...criteria,
        htmlText: decode(criteria.htmlText),
      },
    });
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

const validateMandatoryCriteria = async (req, res) => {
  const { body } = req;
  const { mandatoryCriteria } = body;
  const isEmpty = _isEmpty(mandatoryCriteria);

  try {
    const criteria = await api.getMandatoryCriteria();

    if (isEmpty) {
      const mandatoryError = {
        errRef: 'confirm',
        errMsg: 'Select if the mandatory criteria will be true or false on the date that cover starts',
      };

      return res.render('partials/mandatory-criteria.njk', {
        errors: validationErrorHandler(mandatoryError),
        criteria: {
          ...criteria,
          htmlText: decode(criteria.htmlText),
        },
      });
    }

    if (isTrueSet(mandatoryCriteria)) {
      return res.redirect('name-application');
    }

    return res.redirect('/gef/ineligible-gef');
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

export {
  getMandatoryCriteria,
  validateMandatoryCriteria,
};
