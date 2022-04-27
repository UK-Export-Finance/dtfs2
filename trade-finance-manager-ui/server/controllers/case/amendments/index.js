const api = require('../../../api');
const { amendmentRequestDateValidation } = require('./requestDateValidation');

// when add an amendment button clicked, renders amendment request date page
const getAmendmentRequestDate = async (req, res) => {
  const { facilityId } = req.params;
  const { user } = req.session;

  try {
    const facility = await api.getFacility(facilityId);
    if (!facility) {
      return res.redirect('/not-found');
    }

    const { dealId } = facility.facilitySnapshot;

    return res.render('case/amendments/amendment-request.njk', {
      dealId,
      facility,
      facilityId,
      user,
    });
  } catch (err) {
    console.error('getAmendmentRequest - error getting facility', { err });
    return res.redirect('/not-found');
  }
};

/**
 * posts amendment request date when continue button clicked
 * as first stage of amendment, creates a new amendment object
 * includes request date, user, creation timestamp and changes status
 * TODO: when changing request date, need to update amendment instead of creating new object
 */
const postAmendmentRequestDate = async (req, res) => {
  const { facilityId, amendmentId } = req.params;
  const facility = await api.getFacility(facilityId);
  const { user } = req.session;

  const { dealId } = facility.facilitySnapshot;

  const {
    amendmentRequestDate,
    errorsObject,
    amendmentRequestDateErrors,
  } = await amendmentRequestDateValidation(req.body, facility);

  if (amendmentRequestDateErrors.length > 0) {
    return res.render('case/amendments/amendment-request.njk', {
      errors: errorsObject.errors,
      amendmentRequestDateDay: errorsObject.amendmentRequestDateDay,
      amendmentRequestDateMonth: errorsObject.amendmentRequestDateMonth,
      amendmentRequestDateYear: errorsObject.amendmentRequestDateYear,
      dealId,
      facility,
      facilityId,
      user,
    });
  }

  try {
    const payload = {
      requestDate: amendmentRequestDate,
      createdBy: {
        userName: user.username,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        team: user.teams,
      },
    };

    await api.createAmendmentRequestDate(facilityId, amendmentId, payload);

    return res.redirect(`/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}/request-date`);
  } catch (err) {
    console.error('There was a problem creating the amendment request date %O', { response: err?.response?.data });
  }
  return res.redirect(`/case/${dealId}/facility/${facilityId}#amendments`);
};

module.exports = { getAmendmentRequestDate, postAmendmentRequestDate };
