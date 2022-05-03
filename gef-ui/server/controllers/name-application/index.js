const { validationErrorHandler } = require('../../utils/helpers');
const api = require('../../services/api');

const nameApplication = async (req, res, next) => {
  const { params } = req;
  const dealId = params?.dealId;
  const viewProps = {};

  try {
    if (dealId) {
      const application = await api.getApplication(dealId);
      viewProps.bankInternalRefName = application.bankInternalRefName;
      viewProps.additionalRefName = application.additionalRefName;
    }
  } catch (err) {
    return next(err);
  }
  return res.render('partials/name-application.njk', viewProps);
};

const createApplication = async (req, res, next) => {
  const { body, session } = req;
  const { _id: userId, bank } = session.user;

  try {
    const application = await api.createApplication({
      ...body,
      userId,
      bank,
    });

    // Validation errors
    if (application.status === 422) {
      return res.render('partials/name-application.njk', {
        bankInternalRefName: body.bankInternalRefName,
        additionalRefName: body.additionalRefName,
        errors: validationErrorHandler(application.data),
      });
    }

    return res.redirect(`/gef/application-details/${application._id}`);
  } catch (err) {
    return next(err);
  }
};

const updateApplicationReferences = async (req, res, next) => {
  const { body, params } = req;
  const { dealId } = params;

  body.bankInternalRefName = body.bankInternalRefName ?? '';
  body.additionalRefName = body.additionalRefName ?? '';
  try {
    const application = await api.updateApplication(dealId, body);

    if (application.status === 422) {
      return res.render('partials/name-application.njk', {
        bankInternalRefName: body.bankInternalRefName,
        additionalRefName: body.additionalRefName,
        errors: validationErrorHandler(application.data),
      });
    }

    return res.redirect(`/gef/application-details/${application._id}`);
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  nameApplication,
  createApplication,
  updateApplicationReferences,
};
