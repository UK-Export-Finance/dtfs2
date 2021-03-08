import _isEmpty from 'lodash/isEmpty';
import * as api from '../../services/api';
import { validationErrorHandler, isEmpty } from '../../utils/helpers';

const companiesRegNumber = async (req, res) => {
  try {
    const { params } = req;
    const { applicationId } = params;
    const { exporterId } = await api.getApplication(applicationId);
    const { details } = await api.getExporter(exporterId);
    const { companiesHouseRegistrationNumber } = details;

    return res.render('partials/companies-reg-number.njk', {
      regNumber: companiesHouseRegistrationNumber,
    });
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

const validateCompaniesRegNumber = async (req, res) => {
  try {
    const { params, body } = req;
    const { regNumber } = body;
    const { applicationId } = params;
    const { exporterId } = await api.getApplication(applicationId);
    const { details } = await api.getExporter(exporterId);
    const { companiesHouseRegistrationNumber } = details;
    let regNumberError;

    if (_isEmpty(regNumber)) {
      regNumberError = {
        errRef: 'regNumber',
        errMsg: 'Enter a Companies House registration number',
      };
    }


    return res.render('partials/companies-reg-number.njk', {
      errors: validationErrorHandler(regNumberError),
      regNumber: regNumber || companiesHouseRegistrationNumber,
    });
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

export {
  companiesRegNumber,
  validateCompaniesRegNumber,
};
