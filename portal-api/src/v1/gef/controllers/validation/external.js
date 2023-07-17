/* eslint-disable consistent-return */
const companiesHouseError = (err) => {
  let errMsg;
  let errCode = undefined;
  if (err.response?.data?.data === 'Invalid company registration number') {
    errMsg = 'Invalid Companies House registration number';
  } else {
    switch (err.response?.data?.errors?.length > 0 && err.response?.data?.errors[0]?.error) {
      case 'company-profile-not-found':
        errMsg = 'Invalid Companies House registration number';
        errCode = err.response?.data?.errors[0]?.error;
        break;
      default:
        errMsg = 'There was a problem getting the Companies House registration number';
        errCode = err.response?.data?.errors[0]?.error;
        break;
    }
  }

  return [
    {
      errCode,
      errRef: 'regNumber',
      errMsg,
    },
  ];
};

module.exports = {
  companiesHouseError,
};
