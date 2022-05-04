const { format, fromUnixTime } = require('date-fns');
const api = require('../../../api');
const { amendmentRequestDateValidation } = require('./validation/amendmentRequestDate.validate');
const { AMENDMENT_STATUS } = require('../../../constants/amendments');

// when add an amendment button clicked, renders amendment request date page
const getAmendmentRequestDate = async (req, res) => {
  try {
    const { facilityId, amendmentId } = req.params;
    let amendmentRequestDateDay = '';
    let amendmentRequestDateMonth = '';
    let amendmentRequestDateYear = '';

    const amendment = await api.getAmendmentById(facilityId, amendmentId);
    if (!amendment) {
      return res.redirect('/not-found');
    }
    const { dealId } = amendment;

    const isEditable = amendment.status === AMENDMENT_STATUS.IN_PROGRESS;
    if (amendment.requestDate) {
      amendmentRequestDateDay = format(fromUnixTime(amendment.requestDate), 'dd');
      amendmentRequestDateMonth = format(fromUnixTime(amendment.requestDate), 'M');
      amendmentRequestDateYear = format(fromUnixTime(amendment.requestDate), 'yyyy');
    }

    return res.render('case/amendments/amendment-request-date.njk', {
      dealId,
      facilityId,
      isEditable,
      amendmentRequestDateDay,
      amendmentRequestDateMonth,
      amendmentRequestDateYear,
    });
  } catch (err) {
    console.error('getAmendmentRequest - error getting facility', { err });
    return res.redirect('/not-found');
  }
};

/**
 * posts amendment request date when continue button clicked
 * includes request date, user, creation timestamp and changes status
 */
const postAmendmentRequestDate = async (req, res) => {
  const { facilityId, amendmentId } = req.params;
  const facility = await api.getFacility(facilityId);
  const { user } = req.session;

  const { dealId, status } = await api.getAmendmentById(facilityId, amendmentId);

  const { amendmentRequestDate, errorsObject, amendmentRequestDateErrors } = await amendmentRequestDateValidation(req.body, facility);

  if (amendmentRequestDateErrors.length > 0) {
    const isEditable = status === AMENDMENT_STATUS.IN_PROGRESS;
    return res.render('case/amendments/amendment-request-date.njk', {
      dealId,
      facilityId,
      isEditable,
      amendmentRequestDateDay: errorsObject.amendmentRequestDateDay,
      amendmentRequestDateMonth: errorsObject.amendmentRequestDateMonth,
      amendmentRequestDateYear: errorsObject.amendmentRequestDateYear,
      errors: errorsObject.errors,
    });
  }

  try {
    const payload = {
      requestDate: amendmentRequestDate,
      createdBy: {
        username: user.username,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        team: user.teams,
      },
    };

    const update = await api.updateAmendment(facilityId, amendmentId, payload);

    if (update) {
      return res.redirect(`/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}/request-approval`);
    }
    return res.redirect(`/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}/request-date`);
  } catch (err) {
    console.error('There was a problem creating the amendment request date %O', { response: err?.response?.data });
  }
  return res.redirect(`/case/${dealId}/facility/${facilityId}#amendments`);
};

module.exports = { getAmendmentRequestDate, postAmendmentRequestDate };
