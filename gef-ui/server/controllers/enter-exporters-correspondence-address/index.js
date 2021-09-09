const api = require('../../services/api');
const { validationErrorHandler, isTrueSet } = require('../../utils/helpers');
const { DEFAULT_COUNTRY } = require('../../../constants');

const enterExportersCorrespondenceAddress = async (req, res) => {
  const { params, session, query } = req;
  const { applicationId } = params;
  const { address } = session;
  const parseAddress = address ? JSON.parse(address) : null;
  const { status } = query;
  const backUrl = req.get('Referrer');

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

    return res.render('partials/enter-exporters-correspondence-address.njk', {
      addressForm: mappedAddress || correspondenceAddress,
      applicationId,
      status,
      backUrl,
    });
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

const validateEnterExportersCorrespondenceAddress = async (req, res) => {
  const { params, body, query } = req;
  const { saveAndReturn, status } = query;
  const { applicationId } = params;
  const addressErrors = [];

  if (!isTrueSet(saveAndReturn)) {
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
  }

  // always default to UK (this is not entered in the UI)
  // https://ukef-dtfs.atlassian.net/browse/DTFS2-4456?focusedCommentId=15031
  body.country = DEFAULT_COUNTRY;

  try {
    const { exporterId } = await api.getApplication(applicationId);
    await api.updateExporter(exporterId, { correspondenceAddress: body });
    req.session.address = null;
    if (isTrueSet(saveAndReturn) || status === 'change') {
      return res.redirect(`/gef/application-details/${applicationId}`);
    }
    return res.redirect(`/gef/application-details/${applicationId}/about-exporter`);
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

module.exports = {
  enterExportersCorrespondenceAddress,
  validateEnterExportersCorrespondenceAddress,
};
