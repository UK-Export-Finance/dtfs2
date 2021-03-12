import * as api from '../../services/api';

const exportersAddress = async (req, res) => {
  try {
    const { params } = req;
    const { applicationId } = params;
    const { exporterId } = await api.getApplication(applicationId);
    const { details } = await api.getExporter(exporterId);
    const { registeredAddress } = details;
    const items = [];

    if (registeredAddress) {
      Object.values(details.registeredAddress).forEach((address) => {
        items.push(`<p class="govuk-body">${address}</p>`);
      });
    }


    return res.render('partials/exporters-address.njk', {
      companyName: details.companyName,
      registeredAddress: items.join(''),
      applicationId,
    });
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

export {
  exportersAddress,
};
