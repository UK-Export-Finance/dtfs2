import _isEmpty from 'lodash/isEmpty';
import * as api from '../../services/api';
import { parseBool, errorHandler } from '../../utils/helpers';

const getMandatoryCriteria = async (req, res) => {
  try {
    const criteria = await api.getMandatoryCriteria();

    return res.render('templates/mandatory-criteria.njk', {
      criteria,
    });
  } catch (err) {
    const { message } = errorHandler(err);
    return res.render('templates/mandatory-criteria.njk', {
      error: message,
    });
  }
};

const validateMandatoryCriteria = async (req, res) => {
  const { body } = req;
  const { mandatoryCriteria } = body;
  const isEmpty = _isEmpty(mandatoryCriteria);
  const criteria = await api.getMandatoryCriteria();

  if (isEmpty) {
    return res.status(422).render('templates/mandatory-criteria.njk', {
      validationErrorMessage: 'Select an option',
      criteria,
    });
  }

  if (parseBool(mandatoryCriteria)) {
    return res.redirect('name-application');
  }

  return res.render('templates/mandatory-criteria.njk', {
    criteria,
  });
};

export {
  getMandatoryCriteria,
  validateMandatoryCriteria,
};
