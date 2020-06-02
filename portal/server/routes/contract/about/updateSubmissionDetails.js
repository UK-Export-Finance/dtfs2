import api from '../../../api';

const updateSubmissionDetails = async (deal, postedSubmissionDetails, userToken) => {
  const submissionDetails = { ...postedSubmissionDetails };

  // fix currency
  if (submissionDetails.supplyContractCurrency && !submissionDetails.supplyContractCurrency.id) {
    submissionDetails.supplyContractCurrency = {
      id: submissionDetails.supplyContractCurrency,
    };
  } else {
    submissionDetails.supplyContractCurrency = {
      id: '',
    };
  }

  await api.updateSubmissionDetails(deal, submissionDetails, userToken);
};

export default updateSubmissionDetails;
