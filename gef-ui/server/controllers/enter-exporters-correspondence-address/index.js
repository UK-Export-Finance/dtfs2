import * as api from '../../services/api';
import { validationErrorHandler } from '../../utils/helpers';

const enterExportersCorrespondenceAddress = async (req, res) => {
  const { params, session } = req;
  const { applicationId } = params;
  const { address } = session;
  const parseAddress = address ? JSON.parse(address) : null;

  try {
    const { exporterId } = await api.getApplication(applicationId);
    const { details } = await api.getExporter(exporterId);
    const { correspondenceAddress } = details;
    let mappedAddress;

    if (parseAddress) {
      mappedAddress = {
        organisationName: parseAddress.organisation_name,
        addressLine1: parseAddress.addressLine1,
        addressLine2: parseAddress.addressLine2,
        addressLine3: parseAddress.addressLine3,
        locality: parseAddress.locality,
        postalCode: parseAddress.postalCode,
      };
    }

    req.session.address = null;

    return res.render('partials/enter-exporters-correspondence-address.njk', {
      addressForm: mappedAddress || correspondenceAddress,
      applicationId,
    });
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

const validateEnterExportersCorrespondenceAddress = async (req, res) => {
  const { params, body } = req;
  const { applicationId } = params;
  const addressErrors = [];

  if (!body.addressLine1) {
    addressErrors.push({
      errRef: 'addressLine1',
      errMsg: 'Enter address',
    });
  }

  if (!body.postalCode) {
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
