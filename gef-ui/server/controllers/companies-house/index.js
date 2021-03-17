import _isEmpty from 'lodash/isEmpty';
import * as api from '../../services/api';
import { validationErrorHandler } from '../../utils/helpers';

const companiesHouse = async (req, res) => {
  const { params } = req;
  const { applicationId } = params;

  try {
    const { exporterId } = await api.getApplication(applicationId);
    const { details } = await api.getExporter(exporterId);
    const { companiesHouseRegistrationNumber } = details;

    return res.render('partials/companies-house.njk', {
      regNumber: companiesHouseRegistrationNumber,
      applicationId,
    });
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

const validateCompaniesHouse = async (req, res) => {
  const { params, body } = req;
  const { regNumber } = body;
  const { applicationId } = params;

  try {
    const { exporterId } = await api.getApplication(applicationId);

    if (_isEmpty(regNumber)) {
      const regNumberError = {
        errRef: 'regNumber',
        errMsg: 'Enter a Companies House registration number',
      };

      return res.render('partials/companies-house.njk', {
        errors: validationErrorHandler(regNumberError),
        regNumber,
        applicationId,
      });
    }

    await api.getCompaniesHouseDetails(regNumber, exporterId);

    return res.redirect('exporters-address');
  } catch (err) {
    // Validation errors
    if (err.status === 422) {
      return res.render('partials/companies-house.njk', {
        errors: validationErrorHandler(err.data),
        regNumber,
        applicationId,
      });
    }

    return res.render('partials/problem-with-service.njk');
  }
};

export {
  companiesHouse,
  validateCompaniesHouse,
};
