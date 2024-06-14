const { isValidCompanyRegistrationNumber } = require('@ukef/dtfs2-common');
const { HttpStatusCode } = require('axios');
const externalApi = require('../../external-api/api');

const getCompanyByRegistrationNumber = async (req, res) => {
  try {
    const { registrationNumber } = req.params;

    if (!isValidCompanyRegistrationNumber(registrationNumber)) {
      console.error('Invalid company registration number provided: %s', registrationNumber);

      return res.status(HttpStatusCode.BadRequest).send({
        error: 'Bad Request',
        statusCode: HttpStatusCode.BadRequest,
      });
    }

    const { status, data } = await externalApi.companies.getCompanyByRegistrationNumber(registrationNumber);

    return res.status(status).send(data);
  } catch (error) {
    console.error('Error getting company by registration number: %o', error);
    const status = error?.response?.status || HttpStatusCode.InternalServerError;
    const data = error?.response?.data || 'Error getting the company from External API';

    return res.status(status).send(data);
  }
};

module.exports = {
  getCompanyByRegistrationNumber,
};
