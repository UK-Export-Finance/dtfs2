import * as api from '../../services/api';
import { validationErrorHandler } from '../../utils/helpers';

const nameApplication = async (req, res) => res.render('partials/name-application.njk');

const createApplication = async (req, res) => {
  const { body, session } = req;
  const { bankInternalRefName } = body;
  const { _id: userId } = session.user;
  const mandatoryError = [];
  let application;

  if (!bankInternalRefName) {
    mandatoryError.push({
      errRef: 'bankInternalRefName',
      errMsg: 'You must enter a bank reference or name',
    });
  }

  try {
    if (mandatoryError.length < 1) {
      application = await api.createApplication({
        ...body,
        userId,
      });
    }

    if (application && application.status === 422) {
      application.data.forEach((error) => {
        mandatoryError.push(error);
      });
    }

    console.log('errors', validationErrorHandler(mandatoryError));

    if (mandatoryError.length > 0) {
      return res.render('partials/name-application.njk', {
        errors: validationErrorHandler(mandatoryError),
      });
    }

    // eslint-disable-next-line no-underscore-dangle
    return res.redirect(`application-details/${application._id}`);
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

export {
  nameApplication,
  createApplication,
};
