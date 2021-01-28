const api = require('../api');

const getPartyUrn = async ({ companyRegNo }) => {
  console.log(`getPartyUrn for ${companyRegNo}`);
  if (!companyRegNo) {
    return '';
  }

  const partyDbInfo = await api.getPartyDbInfo({ companyRegNo });
  console.log('getPartyUrn', { partyDbInfo });
  if (!partyDbInfo) {
    return '';
  }

  return partyDbInfo[0].partyUrn;
};

const addPartyUrns = async (deal) => {
  if (!deal) {
    return false;
  }

  const tfmSubmissionDetails = deal.tfm && deal.tfm.submissionDetails;

  const dealUpdate = {
    tfm: {
      ...deal.tfm,
      submissionDetails: {
        ...tfmSubmissionDetails,
        supplierPartyUrn: await getPartyUrn({ companyRegNo: deal.submissionDetails['supplier-companies-house-registration-number'] }),
      },
    },
  };
  console.log('addPartyUrn', { dealUpdate });
  // eslint-disable-next-line no-underscore-dangle
  const updatedDeal = await api.updateDeal(deal._id, dealUpdate);
  return updatedDeal;
};
exports.addPartyUrns = addPartyUrns;
