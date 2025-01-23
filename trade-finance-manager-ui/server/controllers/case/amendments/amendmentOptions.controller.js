const { TFM_AMENDMENT_STATUS } = require('@ukef/dtfs2-common');
const api = require('../../../api');
const { amendmentOptionsValidation } = require('./validation/amendmentOptions.validate');

const getAmendmentOptions = async (req, res) => {
  const { facilityId, amendmentId } = req.params;
  const { userToken } = req.session;
  const { data: amendment, status } = await api.getAmendmentById(facilityId, amendmentId, userToken);
  if (status !== 200) {
    return res.redirect('/not-found');
  }

  const facility = await api.getFacility(facilityId, userToken);

  const changeCoverEndDate = amendment.changeCoverEndDate ?? '';
  const changeFacilityValue = amendment.changeFacilityValue ?? '';
  const isEditable = amendment.status === TFM_AMENDMENT_STATUS.IN_PROGRESS;
  const { hasBeenIssued } = facility.facilitySnapshot;
  const { dealId } = amendment;
  return res.render('case/amendments/amendment-options.njk', {
    dealId,
    facilityId,
    isEditable,
    changeCoverEndDate,
    changeFacilityValue,
    hasBeenIssued,
    user: req.session.user,
  });
};

const postAmendmentOptions = async (req, res) => {
  const { facilityId, amendmentId } = req.params;
  const { userToken } = req.session;
  const { amendmentOptions } = req.body;

  const facility = await api.getFacility(facilityId, userToken);
  const { hasBeenIssued } = facility.facilitySnapshot;
  const { errorsObject, amendmentOptionsValidationErrors } = amendmentOptionsValidation(amendmentOptions, hasBeenIssued);

  const { data: amendment } = await api.getAmendmentById(facilityId, amendmentId, userToken);
  const { dealId } = amendment;

  if (amendmentOptionsValidationErrors.length) {
    const isEditable = amendment.status === TFM_AMENDMENT_STATUS.IN_PROGRESS;
    return res.render('case/amendments/amendment-options.njk', {
      dealId,
      facilityId,
      isEditable,
      changeCoverEndDate: amendment.changeCoverEndDate ?? '',
      changeFacilityValue: amendment.changeFacilityValue ?? '',
      hasBeenIssued,
      errors: errorsObject.errors,
      amendmentOptionsValidationErrors,
      user: req.session.user,
    });
  }

  let changeFacilityValue;
  let changeCoverEndDate;

  // check if both checkboxes are checked
  if (Array.isArray(amendmentOptions)) {
    changeFacilityValue = !!amendmentOptions.includes('facilityValue');
    changeCoverEndDate = !!amendmentOptions.includes('coverEndDate');
  } else {
    changeFacilityValue = amendmentOptions === 'facilityValue';
    changeCoverEndDate = amendmentOptions === 'coverEndDate';
  }

  try {
    const payload = { changeFacilityValue, changeCoverEndDate };
    const { status } = await api.updateAmendment(facilityId, amendmentId, payload, userToken);

    if (status === 200) {
      if (changeCoverEndDate) {
        return res.redirect(`/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}/cover-end-date`);
      }
      return res.redirect(`/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}/facility-value`);
    }
    console.error('Unable to update the amendment options');
    return res.redirect(`/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}/amendment-options`);
  } catch (error) {
    console.error('There was a problem creating the amendment approval %o', error);
    return res.redirect(`/case/${dealId}/facility/${facilityId}#amendments`);
  }
};

module.exports = { getAmendmentOptions, postAmendmentOptions };
