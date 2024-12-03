const { format, fromUnixTime } = require('date-fns');
const { AMENDMENT_STATUS } = require('@ukef/dtfs2-common');
const api = require('../../../api');
const { amendmentRequestDateValidation } = require('./validation/amendmentRequestDate.validate');

// when add an amendment button clicked, renders amendment request date page
const getAmendmentRequestDate = async (req, res) => {
  try {
    const { facilityId, amendmentId } = req.params;
    const { userToken } = req.session;

    const { data: amendment, status } = await api.getAmendmentById(facilityId, amendmentId, userToken);
    if (status !== 200) {
      return res.redirect('/not-found');
    }
    const { dealId } = amendment;
    let amendmentRequestDateDay = '';
    let amendmentRequestDateMonth = '';
    let amendmentRequestDateYear = '';

    const isEditable = amendment.status !== AMENDMENT_STATUS.COMPLETED;
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
      user: req.session.user,
    });
  } catch (error) {
    console.error('Unable to get the amendment request date page %o', error);
    return res.redirect('/not-found');
  }
};

/**
 * posts amendment request date when continue button clicked
 * includes request date, user, creation timestamp and changes status
 */
const postAmendmentRequestDate = async (req, res) => {
  const { facilityId, amendmentId } = req.params;
  const { user, userToken } = req.session;
  const facility = await api.getFacility(facilityId, userToken);

  const { data: amendment } = await api.getAmendmentById(facilityId, amendmentId, userToken);
  const { amendmentRequestDate, errorsObject, amendmentRequestDateErrors } = amendmentRequestDateValidation(req.body, facility);
  const { dealId } = amendment;

  if (amendmentRequestDateErrors.length) {
    const isEditable = amendment.status !== AMENDMENT_STATUS.COMPLETED;
    return res.render('case/amendments/amendment-request-date.njk', {
      dealId,
      facilityId,
      isEditable,
      amendmentRequestDateDay: errorsObject.amendmentRequestDateDay,
      amendmentRequestDateMonth: errorsObject.amendmentRequestDateMonth,
      amendmentRequestDateYear: errorsObject.amendmentRequestDateYear,
      errors: errorsObject.errors,
      user: req.session.user,
    });
  }

  try {
    const payload = {
      requestDate: amendmentRequestDate,
      status: AMENDMENT_STATUS.IN_PROGRESS,
      createdBy: {
        username: user.username,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
      },
    };

    const { status } = await api.updateAmendment(facilityId, amendmentId, payload, userToken);

    if (status === 200) {
      return res.redirect(`/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}/request-approval`);
    }
    console.error('Unable to update the amendment request date');
    return res.redirect(`/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}/request-date`);
  } catch (error) {
    console.error('There was a problem creating the amendment request date %o', error);
    return res.redirect(`/case/${dealId}/facility/${facilityId}#amendments`);
  }
};

module.exports = { getAmendmentRequestDate, postAmendmentRequestDate };
