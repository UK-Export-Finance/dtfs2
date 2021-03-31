/* eslint-disable consistent-return */
const companiesHouseError = (err) => {
  let errMsg;
  switch (err.response.data.errors[0].error) {
    case 'company-profile-not-found':
      errMsg = 'Invalid Companies House registration number';
      break;
    default:
      errMsg = 'There was a problem getting the Companies House registration number';
      break;
  }
  return [{
    errCode: err.response.data.errors[0].error,
    errRef: 'regNumber',
    errMsg,
  }];
};

module.exports = {
  companiesHouseError,
};
