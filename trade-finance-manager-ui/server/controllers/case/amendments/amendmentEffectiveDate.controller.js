const { format, fromUnixTime } = require('date-fns');
const api = require('../../../api');
const { effectiveDateValidation } = require('./validation/amendmentEffectiveDate.validate');
const { AMENDMENT_STATUS } = require('../../../constants/amendments');

const getAmendmentEffectiveDate = async (req, res) => {
  const { facilityId, amendmentId } = req.params;
  const { data: amendment, status } = await api.getAmendmentById(facilityId, amendmentId);

  if (status !== 200) {
    return res.redirect('/not-found');
  }

  const { dealId } = amendment;
  let effectiveDateDay = '';
  let effectiveDateMonth = '';
  let effectiveDateYear = '';

  const isEditable = amendment.status === AMENDMENT_STATUS.IN_PROGRESS;
  if (amendment.effectiveDate) {
    effectiveDateDay = format(fromUnixTime(amendment.effectiveDate), 'dd');
    effectiveDateMonth = format(fromUnixTime(amendment.effectiveDate), 'M');
    effectiveDateYear = format(fromUnixTime(amendment.effectiveDate), 'yyyy');
  }

  return res.render('case/amendments/amendment-effective-date.njk', {
    dealId,
    facilityId,
    isEditable,
    effectiveDateDay,
    effectiveDateMonth,
    effectiveDateYear,
    user: req.session.user,
  });
};

const postAmendmentEffectiveDate = async (req, res) => {
  const { facilityId, amendmentId } = req.params;
  const { data: amendment } = await api.getAmendmentById(facilityId, amendmentId);
  const { effectiveDate, errorsObject, effectiveDateErrors } = await effectiveDateValidation(req.body);
  const { dealId } = amendment;

  if (effectiveDateErrors.length) {
    const isEditable = amendment.status === AMENDMENT_STATUS.IN_PROGRESS;
    return res.render('case/amendments/amendment-effective-date.njk', {
      dealId: amendment.dealId,
      facilityId,
      isEditable,
      effectiveDateDay: errorsObject.effectiveDateDay,
      effectiveDateMonth: errorsObject.effectiveDateMonth,
      effectiveDateYear: errorsObject.effectiveDateYear,
      errors: errorsObject.errors,
      user: req.session.user,
    });
  }

  try {
    const payload = { effectiveDate };
    const { status } = await api.updateAmendment(facilityId, amendmentId, payload);

    if (status === 200) {
      return res.redirect(`/case/${amendment.dealId}/facility/${facilityId}/amendment/${amendmentId}/amendment-options`);
    }
    console.error('Unable to update the amendment effective date');
    return res.redirect(`/case/${amendment.dealId}/facility/${facilityId}/amendment/${amendmentId}/amendment-effective-date`);
  } catch (err) {
    console.error('There was a problem adding the amendment effective date %O', { response: err?.response?.data });
    return res.redirect(`/case/${dealId}/facility/${facilityId}#amendments`);
  }
};

module.exports = { getAmendmentEffectiveDate, postAmendmentEffectiveDate };
