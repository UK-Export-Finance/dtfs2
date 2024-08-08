const companiesHouseError = (error) => {
  let errMsg;
  let errCode;

  let { status } = error.response;

  if (error.response?.data?.data === 'Invalid company registration number') {
    errMsg = 'Invalid Companies House registration number';
  } else {
    switch (error.response?.data?.errors?.length > 0 && error.response?.data?.errors[0]?.error) {
      case 'company-profile-not-found':
        status = 422;
        errMsg = 'Invalid Companies House registration number';
        errCode = error.response?.data?.errors?.[0]?.error;
        break;
      default:
        errMsg = 'There was a problem getting the Companies House registration number';
        errCode = error.response?.data?.errors?.[0]?.error;
        break;
    }
  }

  return {
    status,
    response: [
      {
        status,
        errCode,
        errRef: 'regNumber',
        errMsg,
      },
    ],
  };
};

module.exports = {
  companiesHouseError,
};
