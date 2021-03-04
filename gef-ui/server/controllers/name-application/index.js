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
    const application = await api.createApplication({
      ...body,
      userId,
    });

    // eslint-disable-next-line no-underscore-dangle
    return res.redirect(`application-details/${application._id}`);
  } catch (err) {
    // Show validation errors from server
    if (err.status === 422) {
      return res.render('partials/name-application.njk', {
        errors: validationErrorHandler(err.data, 'name-application'),
      });
    }

    return res.render('partials/problem-with-service.njk');
  }
};

export {
  nameApplication,
  createApplication,
};
