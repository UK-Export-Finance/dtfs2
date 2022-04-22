const {
  getUnixTime,
} = require('date-fns');

const api = require('../../../api');
const { amendmentRequestDateValidation } = require('./requestDateValidation');

const CONSTANTS = require('../../../constants');

// when add an amendment button clicked, renders amendment request date page
const getAmendmentRequest = async (req, res) => {
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
const postAmendmentRequest = async (req, res) => {
  const { facilityId } = req.params;
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
    const update = {
      _id: facilityId,
      amendmentObj: {
        requestDate: amendmentRequestDate,
        creationTimestamp: getUnixTime(new Date()),
        createdBy: {
          userName: user.username,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          team: user.teams,
        },
        status: CONSTANTS.AMENDMENTS.AMENDMENT_STATUS.IN_PROGRESS,
      },
    };

    const createdAmendment = await api.createAmendment(update);

    const amendmentId = createdAmendment.createdAmendment.amendments._id;
    return res.redirect(`/case/${dealId}/facility/${facilityId}#amendments/${amendmentId}`);
  } catch (err) {
    console.error('Problem creating amendment request date', { err });
  }
  return res.redirect(`/case/${dealId}/facility/${facilityId}#amendments`);
};

module.exports = { getAmendmentRequest, postAmendmentRequest };
