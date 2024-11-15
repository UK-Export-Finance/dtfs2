const api = require('../../services/api');
const { validationErrorHandler, isTrueSet } = require('../../utils/helpers');
const { DEFAULT_COUNTRY } = require('../../constants');
const constructPayload = require('../../utils/constructPayload');

const enterExportersCorrespondenceAddress = async (req, res) => {
  const { params, session, query } = req;
  const { dealId } = params;
  const { address, userToken } = session;
  const parseAddress = address ? JSON.parse(address) : null;
  const { status } = query;
  const backUrl = `/gef/application-details/${dealId}`;

  try {
    const { exporter } = await api.getApplication({ dealId, userToken });
    const { correspondenceAddress } = exporter;

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

    let addressForm = {};
    if (mappedAddress) {
      addressForm = mappedAddress;
    }

    if (correspondenceAddress) {
      addressForm = correspondenceAddress;
    }

    return res.render('_partials/enter-exporters-correspondence-address.njk', {
      addressForm,
      dealId,
      status,
      backUrl,
    });
  } catch (error) {
    console.error("GEF-UI - Error getting exporter's correspondence address page %o", error);
    return res.render('_partials/problem-with-service.njk');
  }
};

const validateEnterExportersCorrespondenceAddress = async (req, res) => {
  delete req.body._csrf;

  const { params, body, query, session } = req;
  const { saveAndReturn, status } = query;
  const { dealId } = params;
  const { user, userToken } = session;
  const { _id: editorId } = user;

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
      return res.render('_partials/enter-exporters-correspondence-address.njk', {
        errors: validationErrorHandler(addressErrors),
        addressForm: body,
        dealId,
      });
    }
  }

  // always default to UK (this is not entered in the UI)
  // https://ukef-dtfs.atlassian.net/browse/DTFS2-4456?focusedCommentId=15031
  if (body.addressLine1 && body.postalCode) {
    body.country = DEFAULT_COUNTRY;
  } else {
    delete body.country;
  }

  try {
    const { exporter } = await api.getApplication({ dealId, userToken });

    const correspondenceAddressFields = ['addressLine1', 'addressLine2', 'addressLine3', 'locality', 'postalCode', 'country'];
    const sanitizedBody = constructPayload(body, correspondenceAddressFields);

    const applicationExporterUpdate = {
      exporter: {
        ...exporter,
        correspondenceAddress: sanitizedBody,
      },
      editorId,
    };

    await api.updateApplication({ dealId, application: applicationExporterUpdate, userToken });

    req.session.address = null;
    if (isTrueSet(saveAndReturn) || status === 'change') {
      return res.redirect(`/gef/application-details/${dealId}`);
    }
    return res.redirect(`/gef/application-details/${dealId}/about-exporter`);
  } catch (error) {
    console.error("Error validating exporter's correspondence address %o", error);
    return res.render('_partials/problem-with-service.njk');
  }
};

module.exports = {
  enterExportersCorrespondenceAddress,
  validateEnterExportersCorrespondenceAddress,
};
