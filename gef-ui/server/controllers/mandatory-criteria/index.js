import _isEmpty from 'lodash/isEmpty';
import * as api from '../../services/api';
import { parseBool, validationErrorHandler } from '../../utils/helpers';

const getMandatoryCriteria = async (req, res) => {
  try {
    const criteria = await api.getMandatoryCriteria();

    return res.render('partials/mandatory-criteria.njk', {
      criteria,
    });
  } catch (err) {
    return err;
  }
};

const validateMandatoryCriteria = async (req, res) => {
  const { body } = req;
  const { mandatoryCriteria } = body;
  const isEmpty = _isEmpty(mandatoryCriteria);
  const criteria = await api.getMandatoryCriteria();


  if (isEmpty) {
    const mandatoryError = {
      errRef: 'bankInternalRefName',
      errMsg: 'You must enter a bank reference or name',
    };
    return res.render('partials/mandatory-criteria.njk', {
      errors: validationErrorHandler(mandatoryError, 'mandatory-criteria'),
      criteria,
    });
  }

  if (parseBool(mandatoryCriteria)) {
    return res.redirect('name-application');
  }

  return res.redirect('ineligible');
};

export {
  getMandatoryCriteria,
  validateMandatoryCriteria,
};
