import * as api from '../../services/api';
import { validationErrorHandler } from '../../utils/helpers';

const nameApplication = async (req, res) => res.render('partials/name-application.njk');

const createApplication = async (req, res) => {
  const { body, session } = req;

  const { bankInternalRefName } = body;
  const { _id: userId } = session.user;

  if (!bankInternalRefName) {
    const mandatoryError = {
      errRef: 'bankInternalRefName',
      errMsg: 'You must enter a bank reference or name',
    };
    return res.render('partials/name-application.njk', {
      errors: validationErrorHandler(mandatoryError, 'name-application'),
    });
  }

  try {
    await api.createApplication({
      ...body,
      userId,
    });

    return res.redirect('application-details');
  } catch (err) {
    return res.render('partials/name-application.njk', {
      errors: err,
    });
  }
};

export {
  nameApplication,
  createApplication,
};
