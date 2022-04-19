const {
  getUnixTime,
} = require('date-fns');

const api = require('../../../api');
const { amendmentRequestDateValidation } = require('./requestDateValidation');

// const CONSTANTS = require('../../../constants');

const getAmendmentRequest = async (req, res) => {
  const { facilityId } = req.params;
  const facility = await api.getFacility(facilityId);

  if (!facility) {
    return res.redirect('/not-found');
  }

  const { dealId } = facility.facilitySnapshot;

  return res.render('case/amendments/amendment-request.njk', {
    dealId,
    facility,
    facilityId,
    user: req.session.user,
  });
};

const postAmendmentRequest = async (req, res) => {
  const { facilityId } = req.params;
  const facility = await api.getFacility(facilityId);

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
      user: req.session.user,
    });
  }

  try {
    console.log('I AM HEREEE NOW', facilityId);
    const amendmentObj = {
      requestDate: amendmentRequestDate,
      timestamp: getUnixTime(new Date()),
    };
    console.log(typeof amendmentObj.requestDate, typeof amendmentObj.timestamp);
    await api.createAmendment(facilityId, amendmentObj);
  } catch (err) {
    console.error('Problem creating amendment request date', { err });
  }
  return res.redirect(`/case/${dealId}/facility/${facilityId}#amendments`);
};

module.exports = { getAmendmentRequest, postAmendmentRequest };
