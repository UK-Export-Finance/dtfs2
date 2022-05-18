const api = require('../../../api');
const { requestApprovalValidation } = require('./validation/amendmentRequestApproval.validate');
const { AMENDMENT_STATUS } = require('../../../constants/amendments');

const getAmendmentRequestApproval = async (req, res) => {
  try {
    const { facilityId, amendmentId } = req.params;
    const { data: amendment, status } = await api.getAmendmentById(facilityId, amendmentId);
    if (status !== 200) {
      return res.redirect('/not-found');
    }

    const { dealId } = amendment;
    const requireUkefApproval = amendment.requireUkefApproval ?? '';
    const isEditable = amendment.status === AMENDMENT_STATUS.IN_PROGRESS;

    return res.render('case/amendments/amendment-request-approval.njk', {
      dealId,
      facilityId,
      isEditable,
      requireUkefApproval,
      user: req.session.user,
    });
  } catch (err) {
    console.error('Unable to get the amendment approval page %O', { err });
    return res.redirect('/not-found');
  }
};

const postAmendmentRequestApproval = async (req, res) => {
  const { facilityId, amendmentId } = req.params;
  const { requireUkefApproval } = req.body;
  const approval = requireUkefApproval === 'Yes';

  const { errorsObject, amendmentRequestApprovalErrors } = requestApprovalValidation(requireUkefApproval);
  const { data: amendment } = await api.getAmendmentById(facilityId, amendmentId);
  const { dealId } = amendment;

  if (amendmentRequestApprovalErrors.length) {
    const isEditable = amendment.status === AMENDMENT_STATUS.IN_PROGRESS;
    return res.render('case/amendments/amendment-request-approval.njk', {
      errors: errorsObject.errors,
      dealId,
      facilityId,
      isEditable,
      requireUkefApproval,
      user: req.session.user,
    });
  }

  try {
    let payload = { requireUkefApproval: approval };

    // reset the cover end date and facility value options if the amendment does not require approval
    if (!approval) {
      payload = { ...payload, changeFacilityValue: false, changeCoverEndDate: false };
    }
    const { status } = await api.updateAmendment(facilityId, amendmentId, payload);

    if (status === 200) {
      if (approval) {
        return res.redirect(`/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}/amendment-options`);
      }
      return res.redirect(`/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}/amendment-effective-date`);
    }
    console.error('Unable to update the amendment request approval');
    return res.redirect(`/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}/request-approval`);
  } catch (err) {
    console.error('There was a problem creating the amendment approval %O', { response: err?.response?.data });
    return res.redirect(`/case/${dealId}/facility/${facilityId}#amendments`);
  }
};

module.exports = { getAmendmentRequestApproval, postAmendmentRequestApproval };
