import _isEmpty from 'lodash/isEmpty';
import * as api from '../../services/api';
import { validationErrorHandler } from '../../utils/helpers';

function registeredAddressHandler(registeredAddress) {
  const items = [];

  if (registeredAddress) {
    Object.values(registeredAddress).forEach((address) => {
      items.push(`<p class="govuk-body">${address}</p>`);
    });
  }

  return items.join('');
}

const exportersAddress = async (req, res) => {
  try {
    const { params } = req;
    const { applicationId } = params;
    const { exporterId } = await api.getApplication(applicationId);
    const { details } = await api.getExporter(exporterId);
    const { registeredAddress } = details;

    return res.render('partials/exporters-address.njk', {
      companyName: details.companyName,
      registeredAddress: registeredAddressHandler(registeredAddress),
      applicationId,
    });
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

const validateExportersAddress = async (req, res) => {
  try {
    const { params, body } = req;
    const { correspondence, postcode } = body;
    const { applicationId } = params;
    const { exporterId } = await api.getApplication(applicationId);
    const { details } = await api.getExporter(exporterId);
    const { registeredAddress } = details;
    let correspondenceError;

    if (_isEmpty(correspondence)) {
      correspondenceError = {
        errRef: 'correspondence',
        errMsg: 'Select whether there’s a separate correspondence address for the exporter',
      };
    }

    // User has selected No so take them to about exporters page
    if (correspondence === 'false') {
      return res.redirect('about-exporter');
    }

    if (correspondence === 'true' && _isEmpty(postcode)) {
      correspondenceError = {
        errRef: 'postcode',
        errMsg: 'Enter a postcode',
      };
    }

    return res.render('partials/exporters-address.njk', {
      errors: validationErrorHandler(correspondenceError),
      companyName: details.companyName,
      registeredAddress: registeredAddressHandler(registeredAddress),
      applicationId,
      correspondence,
    });

    // return res.redirect('exporters-address');
  } catch (err) {
    // Validation errors
    if (err.status === 422) {
      return res.render('partials/companies-house.njk', {
        errors: validationErrorHandler(err.data),
      });
    }

    return res.render('partials/problem-with-service.njk');
  }
};

export {
  exportersAddress,
  validateExportersAddress,
};
