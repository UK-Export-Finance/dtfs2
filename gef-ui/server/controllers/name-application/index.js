import * as api from '../../services/api';
import { validationErrorHandler } from '../../utils/helpers';

const nameApplication = async (req, res) => res.render('partials/name-application.njk');

const createApplication = async (req, res) => {
  const { body, session } = req;
  const { _id: userId, bank: { id: bankId } } = session.user;

  try {
    const application = await api.createApplication({
      ...body,
      userId,
      bankId,
    });

    // Validation errors
    if (application.status === 422) {
      return res.render('partials/name-application.njk', {
        errors: validationErrorHandler(application.data),
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
