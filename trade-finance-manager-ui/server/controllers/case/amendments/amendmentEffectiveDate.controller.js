const { format, fromUnixTime } = require('date-fns');
const api = require('../../../api');
const { amendmentEffectiveDateValidation } = require('./validation/amendmentEffectiveDate.validate');
const { AMENDMENT_STATUS } = require('../../../constants/amendments');

const getAmendmentEffectiveDate = async (req, res) => {
  try {
    const { facilityId, amendmentId } = req.params;
    let amendmentEffectiveDateDay = '';
    let amendmentEffectiveDateMonth = '';
    let amendmentEffectiveDateYear = '';

    const amendment = await api.getAmendmentById(facilityId, amendmentId);
    if (!amendment) {
      return res.redirect('/not-found');
    }
    const { dealId } = amendment;

    const isEditable = amendment.status === AMENDMENT_STATUS.IN_PROGRESS;
    if (amendment.amendmentEffectiveDate) {
      amendmentEffectiveDateDay = format(fromUnixTime(amendment.amendmentEffectiveDate), 'dd');
      amendmentEffectiveDateMonth = format(fromUnixTime(amendment.amendmentEffectiveDate), 'M');
      amendmentEffectiveDateYear = format(fromUnixTime(amendment.amendmentEffectiveDate), 'yyyy');
    }

    return res.render('case/amendments/amendment-effective-date.njk', {
      dealId,
      facilityId,
      isEditable,
      amendmentEffectiveDateDay,
      amendmentEffectiveDateMonth,
      amendmentEffectiveDateYear,
    });
  } catch (err) {
    console.error('Unable to get the amendment effective date page', { err });
    return res.redirect('/not-found');
  }
};
const postAmendmentEffectiveDate = async (req, res) => {
  const { facilityId, amendmentId } = req.params;
  const { dealId, status } = await api.getAmendmentById(facilityId, amendmentId);
  const { amendmentEffectiveDate, errorsObject, amendmentEffectiveDateErrors } = await amendmentEffectiveDateValidation(req.body);

  if (amendmentEffectiveDateErrors.length > 0) {
    const isEditable = status === AMENDMENT_STATUS.IN_PROGRESS;
    return res.render('case/amendments/amendment-effective-date.njk', {
      dealId,
      facilityId,
      isEditable,
      amendmentEffectiveDateDay: errorsObject.amendmentEffectiveDateDay,
      amendmentEffectiveDateMonth: errorsObject.amendmentEffectiveDateMonth,
      amendmentEffectiveDateYear: errorsObject.amendmentEffectiveDateYear,
      errors: errorsObject.errors,
    });
  }

  try {
    const payload = { amendmentEffectiveDate };
    const update = await api.updateAmendment(facilityId, amendmentId, payload);

    if (update) {
      return res.redirect(`/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}/amendment-options`);
    }
    return res.redirect(`/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}/amendment-effective-date`);
  } catch (err) {
    console.error('There was a problem adding the amendment effective date %O', { response: err?.response?.data });
  }
  return res.redirect(`/case/${dealId}/facility/${facilityId}#amendments`);
};

module.exports = { getAmendmentEffectiveDate, postAmendmentEffectiveDate };
