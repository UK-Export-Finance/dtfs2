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
  const companiesHouseErrors = [];
  let companiesHouseDetails;

  try {
    const { exporterId } = await api.getApplication(applicationId);

    if (_isEmpty(regNumber)) {
      companiesHouseErrors.push({
        errRef: 'regNumber',
        errMsg: 'Enter a Companies House registration number',
      });
    }

    if (companiesHouseErrors.length < 1) {
      companiesHouseDetails = await api.getCompaniesHouseDetails(regNumber, exporterId);
    }

    if (companiesHouseDetails && companiesHouseDetails.status === 422) {
      companiesHouseErrors.push(companiesHouseDetails.data);
    }

    if (companiesHouseErrors.length > 0) {
      return res.render('partials/companies-house.njk', {
        errors: validationErrorHandler(companiesHouseErrors),
        regNumber,
        applicationId,
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
