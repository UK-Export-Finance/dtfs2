const { validationErrorHandler, isTrueSet, isEmpty } = require('../../utils/helpers');
const api = require('../../services/api');

exports.cloneDealCreateApplication = async (req, res, next) => {
  const { body, session } = req;
  const { userToken } = req.session;
  const { _id: userId, bank } = session.user;
  const { dealId } = req.params;

  try {
    const application = await api.cloneApplication({
      payload: {
        dealId,
        ...body,
        userId,
        bank,
      },
      userToken,
    });

    // Validation errors
    if (application.status === 422) {
      return res.render('_partials/name-application.njk', {
        bankInternalRefName: body.bankInternalRefName,
        additionalRefName: body.additionalRefName,
        errors: validationErrorHandler(application.data),
      });
    }

    req.flash('successMessage', {
      text: 'GEF Deal cloned successfully.',
      href: `/gef/application-details/${application.dealId}`,
      hrefText: 'View GEF Deal',
    });

    return res.redirect('/dashboard');
  } catch (error) {
    // check if the user has access to the resource
    if (error.status === 404) {
      // redirect to the dashboard
      return res.redirect('/not-found');
    }
    return next(error);
  }
};

exports.cloneDealValidateMandatoryCriteria = async (req, res) => {
  const { userToken } = req.session;
  const { mandatoryCriteria } = req.body;

  try {
    const criteria = await api.getMandatoryCriteria({ userToken });

    if (isEmpty(mandatoryCriteria)) {
      const mandatoryError = {
        errRef: 'confirm',
        errMsg: 'Select if the mandatory criteria will be true or false on the date that cover starts',
      };

      return res.render('_partials/mandatory-criteria.njk', {
        errors: validationErrorHandler(mandatoryError),
        criteria,
      });
    }

    if (isTrueSet(mandatoryCriteria)) {
      return res.redirect('clone/name-application');
    }

    return res.redirect('/gef/ineligible-gef');
  } catch (error) {
    return res.render('_partials/problem-with-service.njk');
  }
};

exports.cloneDealNameApplication = async (req, res) => {
  const { params } = req;
  const dealId = params?.dealId;
  const { userToken } = req.session;

  const deal = await api.getApplication({ dealId, userToken });

  const viewProps = {
    cloneDeal: true,
    dealName: deal.bankInternalRefName,
  };

  return res.render('_partials/name-application.njk', viewProps);
};
