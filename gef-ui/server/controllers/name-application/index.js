const { validationErrorHandler } = require('../../utils/helpers');
const api = require('../../services/api');

const nameApplication = async (req, res) => res.render('partials/name-application.njk');

const createApplication = async (req, res, next) => {
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
        bankInternalRefName: body.bankInternalRefName,
        additionalRefName: body.additionalRefName,
        errors: validationErrorHandler(application.data),
      });
    }

    // eslint-disable-next-line no-underscore-dangle
    return res.redirect(`application-details/${application._id}`);
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  nameApplication,
  createApplication,
};
