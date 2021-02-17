import _isEmpty from 'lodash/isEmpty';
import * as api from '../../services/api';
import { parseBool, errorHandler } from '../../utils/helpers';

const getMandatoryCriteria = async (req, res) => {
  try {
    const criteria = await api.getMandatoryCriteria();

    return res.render('partials/mandatory-criteria.njk', {
      criteria,
    });
  } catch (err) {
    const { message } = errorHandler(err);
    return res.render('partials/mandatory-criteria.njk', {
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
    return res.render('partials/mandatory-criteria.njk', {
      errors: {
        errorSummary: [
          {
            text: 'Select an option',
            href: 'mandatory-criteria#confirm',
          },
        ],
        fieldErrors: {
          confirm: {
            text: 'Select an option',
          },
        },
      },
      criteria,
    });
  }

  if (parseBool(mandatoryCriteria)) {
    return res.redirect('name-application');
  }

  return res.render('partials/mandatory-criteria.njk', {
    criteria,
  });
};

export {
  getMandatoryCriteria,
  validateMandatoryCriteria,
};
