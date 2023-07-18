/* eslint-disable consistent-return */
const companiesHouseError = (error) => {
  let errMsg;
  switch (error.response.data.errors[0].error) {
    case 'company-profile-not-found':
      errMsg = 'Invalid Companies House registration number';
      break;
    default:
      errMsg = 'There was a problem getting the Companies House registration number';
      break;
  }
  return [{
    errCode: error.response.data.errors[0].error,
    errRef: 'regNumber',
    errMsg,
  }];
};

module.exports = {
  companiesHouseError,
};
