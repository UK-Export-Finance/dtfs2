const externalApi = require('../../external-api/api');

const getCompanyByRegistrationNumber = async (req, res) => {
  const { registrationNumber } = req.params;

  const { status, data } = await externalApi.companies.getCompanyByRegistrationNumber(registrationNumber);

  res.status(status).send(data);
};

module.exports = {
  getCompanyByRegistrationNumber,
};
