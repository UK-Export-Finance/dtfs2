import api from '../../../api';

const updateSubmissionDetails = async (deal, postedSubmissionDetails, userToken) => {
  const submissionDetails = {
    // ...deal.submissionDetails,
    ...postedSubmissionDetails,
  };

  // fix currency
  if (submissionDetails.supplyContractCurrency === '') {
    delete submissionDetails.supplyContractCurrency;
  }

  if (submissionDetails.supplyContractCurrency && !submissionDetails.supplyContractCurrency.id) {
    submissionDetails.supplyContractCurrency = {
      id: submissionDetails.supplyContractCurrency,
    };
  }

  await api.updateSubmissionDetails(deal, submissionDetails, userToken);
};

export default updateSubmissionDetails;
