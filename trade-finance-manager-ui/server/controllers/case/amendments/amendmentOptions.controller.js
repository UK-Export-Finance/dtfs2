const api = require('../../../api');
const { amendmentOptionsValidation } = require('./validation/amendmentOptions.validate');
const { AMENDMENT_STATUS } = require('../../../constants/amendments');

const getAmendmentOptions = async (req, res) => {
  try {
    const { facilityId, amendmentId } = req.params;
    const amendment = await api.getAmendmentById(facilityId, amendmentId);
    if (!amendment) {
      return res.redirect('/not-found');
    }

    const { dealId } = amendment;
    const changeCoverEndDate = amendment.changeCoverEndDate ?? '';
    const changeFacilityValue = amendment.changeFacilityValue ?? '';
    const isEditable = amendment.status === AMENDMENT_STATUS.IN_PROGRESS;
    return res.render('case/amendments/amendment-options.njk', {
      dealId,
      facilityId,
      isEditable,
      changeCoverEndDate,
      changeFacilityValue,
    });
  } catch (err) {
    console.error('Unable to get the amendment options page', { err });
    return res.redirect('/not-found');
  }
};

const postAmendmentOptions = async (req, res) => {
  const { facilityId, amendmentId } = req.params;
  const { amendmentOptions } = req.body;
  const { errorsObject, amendmentOptionsValidationErrors } = amendmentOptionsValidation(amendmentOptions);

  const amendment = await api.getAmendmentById(facilityId, amendmentId);

  if (amendmentOptionsValidationErrors.length > 0) {
    const isEditable = amendment.status === AMENDMENT_STATUS.IN_PROGRESS;
    return res.render('case/amendments/amendment-options.njk', {
      errors: errorsObject.errors,
      dealId: amendment.dealId,
      facilityId,
      isEditable,
      amendmentOptionsValidationErrors,
    });
  }
  let changeFacilityValue;
  let changeCoverEndDate;

  if (Array.isArray(amendmentOptions)) {
    changeFacilityValue = !!amendmentOptions.includes('facilityValue');
    changeCoverEndDate = !!amendmentOptions.includes('coverEndDate');
  } else {
    changeFacilityValue = amendmentOptions === 'facilityValue';
    changeCoverEndDate = amendmentOptions === 'coverEndDate';
  }

  try {
    const payload = { changeFacilityValue, changeCoverEndDate };
    await api.updateAmendment(facilityId, amendmentId, payload);

    if (changeCoverEndDate) {
      return res.redirect(`/case/${amendment.dealId}/facility/${facilityId}/amendment/${amendmentId}/amendment-options`);
    }
    return res.redirect(`/case/${amendment.dealId}/facility/${facilityId}/amendment/${amendmentId}/amendment-options`);
  } catch (err) {
    console.error('There was a problem creating the amendment approval %O', { response: err?.response?.data });
  }

  return res.redirect(`/case/${amendment.dealId}/facility/${facilityId}#amendments`);
};

module.exports = { getAmendmentOptions, postAmendmentOptions };
