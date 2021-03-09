import _isEmpty from 'lodash/isEmpty';
import * as api from '../../services/api';
import { validationErrorHandler } from '../../utils/helpers';

const companiesHouse = async (req, res) => {
  try {
    const { params } = req;
    const { applicationId } = params;
    const { exporterId } = await api.getApplication(applicationId);
    const { details } = await api.getExporter(exporterId);
    const { companiesHouseRegistrationNumber } = details;

    return res.render('partials/companies-house.njk', {
      regNumber: companiesHouseRegistrationNumber,
    });
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

const validateCompaniesHouse = async (req, res) => {
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

    const companiesHouse = await api.getCompaniesHouseDetails(regNumber);

    if (regNumberError) {
      return res.render('partials/companies-house.njk', {
        errors: validationErrorHandler(regNumberError),
        regNumber: regNumber || companiesHouseRegistrationNumber,
      });
    }

    return res.redirect('exporters-address');
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

export {
  companiesHouse,
  validateCompaniesHouse,
};
