
import _isEmpty from 'lodash/isEmpty';
import * as api from '../../services/api';
import { validationErrorHandler } from '../../utils/helpers';

const enterExportersCorrespondenceAddress = (req, res) => {
  const { params, session } = req;
  const { applicationId } = params;
  const { address } = session;
  const parseAddress = JSON.parse(address);
  let mappedAddress;

  if (parseAddress) {
    mappedAddress = {
      organisationName: parseAddress.organisation_name,
      addressLine1: parseAddress.address_line_1,
      addressLine2: parseAddress.address_line_2,
      addressLine3: parseAddress.address_line_3,
      locality: parseAddress.locality,
      postalCode: parseAddress.postal_code,
    };
  }

  return res.render('partials/enter-exporters-correspondence-address.njk', {
    addressForm: mappedAddress, // parseAddress ? mappedAddress : null,
    applicationId,
  });
};

const validateEnterExportersCorrespondenceAddress = async (req, res) => {
  const { params, body } = req;
  const { applicationId } = params;
  const addressErrors = [];

  if (_isEmpty(body.addressLine1)) {
    addressErrors.push({
      errRef: 'addressLine1',
      errMsg: 'Enter address',
    });
  }

  if (_isEmpty(body.postalCode)) {
    addressErrors.push({
      errRef: 'postalCode',
      errMsg: 'Enter postcode',
    });
  }

  if (addressErrors.length > 0) {
    return res.render('partials/enter-exporters-correspondence-address.njk', {
      errors: validationErrorHandler(addressErrors),
      addressForm: body,
      applicationId,
    });
  }

  try {
    const { exporterId } = await api.getApplication(applicationId);
    await api.updateExporter(exporterId, { correspondenceAddress: body });
    return res.redirect(`/gef/application-details/${applicationId}/about-exporter`);
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

export {
  enterExportersCorrespondenceAddress,
  validateEnterExportersCorrespondenceAddress,
};
