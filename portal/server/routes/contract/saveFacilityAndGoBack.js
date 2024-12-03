const { requestParams, errorHref, postToApi } = require('../../helpers');
const api = require('../../api');
const { formDataMatchesOriginalData } = require('./formDataMatchesOriginalData');

const saveFacilityAndGoBackToDeal = async (req, res, sanitizedBody) => {
  const { _id: dealId, bondId, loanId, userToken } = requestParams(req);
  const facility = req.apiData?.bond?.bond ?? req.apiData?.loan?.loan;
  const facilityId = bondId || loanId;

  // UI form submit only has the currency code. API has a currency object.
  // to check if something has changed, only use the currency code.
  const mappedOriginalData = facility;

  if (facility?.currency && facility?.currency?.id) {
    mappedOriginalData.currency = facility.currency.id;
  }
  delete mappedOriginalData._id;
  delete mappedOriginalData.status;

  if (!formDataMatchesOriginalData(sanitizedBody, mappedOriginalData)) {
    const update = req.apiData?.bond ? api.updateBond : api.updateLoan;
    await postToApi(update(dealId, facilityId, sanitizedBody, userToken), errorHref);
  }

  const redirectUrl = `/contract/${req.params._id}`;
  return res.redirect(redirectUrl);
};

module.exports = saveFacilityAndGoBackToDeal;
