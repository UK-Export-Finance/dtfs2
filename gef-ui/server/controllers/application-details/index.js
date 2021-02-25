import * as api from '../../services/api';
import { mapSummaryList } from '../../utils/helpers';

const applicationDetails = async (req, res) => {
  try {
    const { params, url } = req;
    const { applicationId } = params;
    // const application = await api.getApplication(applicationId);
    // eslint-disable-next-line no-underscore-dangle
    const exporterId = '1223'; // application.exporterId;
    // const exporter = await api.getExporter(exporterId);
    // const facilities = await api.getFacilities(applicationId);
    const exporterUri = `gef${url}/exporter/${exporterId}`;
    // const facilityUri = `gef${url}/facility/${facilityId}`;

    const mockedExporterDetails = {
      status: 'NOT_STARTED',
      details: {
        companiesHouseRegistrationNumber: 123456,
        companyName: null,
        registeredAddress: null,
        industrySectorId: 1234,
        industryClassId: 5444,
        smeType: 'Medium',
        probabilityOfDefault: null,
        isFinanceIncreasing: null,
        isInDraft: false,
      },
      validation: {
        required: ['companyName', 'registeredAddress'],
      },
    };

    const displayItems = [
      {
        label: 'Companies House registration number',
        id: 'companiesHouseRegistrationNumber',
      },
      {
        label: 'Company name',
        id: 'companyName',
        href: `${exporterUri}/address`,
      },
      {
        label: 'Address',
        id: 'registeredAddress',
      },
    ];

    return res.render('partials/application-details.njk', {
      exporterRows: mapSummaryList(mockedExporterDetails, displayItems),
      // facilityRows: [],
      // exporterUri,
      // facilityUri,
    });
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

export default applicationDetails;
