const { validationErrorHandler, isTrueSet, isEmpty } = require('../../utils/helpers');
const api = require('../../services/api');

exports.cloneDealCreateApplication = async (req, res, next) => {
  const { body, session } = req;
  const { _id: userId, bank } = session.user;
  const { dealId } = req.params;

  try {
    const application = await api.cloneApplication({
      dealId,
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

    req.flash('successMessage', {
      text: 'GEF Deal cloned successfully.',
      href: `/gef/application-details/${application.dealId}`,
      hrefText: 'View GEF Deal',
    });

    return res.redirect('/dashboard');
  } catch (err) {
    // check if the user has access to the resource
    if (err.status === 404) {
      // redirect to the dashboard
      return res.redirect('/not-found');
    }
    return next(err);
  }
};

exports.cloneDealValidateMandatoryCriteria = async (req, res) => {
  const { body } = req;
  const { mandatoryCriteria } = body;

  try {
    const criteria = await api.getMandatoryCriteria();

    if (isEmpty(mandatoryCriteria)) {
      const mandatoryError = {
        errRef: 'confirm',
        errMsg: 'Select if the mandatory criteria will be true or false on the date that cover starts',
      };

      return res.render('partials/mandatory-criteria.njk', {
        errors: validationErrorHandler(mandatoryError),
        criteria,
      });
    }

    if (isTrueSet(mandatoryCriteria)) {
      return res.redirect('clone/name-application');
    }

    return res.redirect('/gef/ineligible-gef');
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

exports.cloneDealNameApplication = async (req, res) => {
  const { params } = req;
  const dealId = params?.dealId;

  const deal = await api.getApplication(dealId);

  const viewProps = {
    cloneDeal: true,
    dealName: deal.bankInternalRefName,
  };

  return res.render('partials/name-application.njk', viewProps);
};
