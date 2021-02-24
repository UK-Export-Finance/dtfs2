import * as api from '../../services/api';
import { mapSummaryList } from '../../utils/helpers';

const applicationDetails = async (req, res) => {
  try {
    const { params, url } = req;
    const { applicationId } = params;
    // const application = await api.getApplication(applicationId);
    // eslint-disable-next-line no-underscore-dangle
    const exporterId = '1223'; // application.exporterDetails._id;
    const facilityId = 'xyz'; // application.facilityDetails._id;
    // const exporter = await api.getExporter(exporterId);
    // const facility = await api.getFacility(facilityId);
    const exporterUri = `gef${url}/exporter/${exporterId}`;
    // const facilityUri = `gef${url}/facility/${facilityId}`;

    const mockedExporterDetails = {
      details: {
        companiesHouseRegistrationNumber: 123456,
        companyName: null,
        registeredAddress: {
          line1: 'Addres line 1',
          line2: 'Address line 2',
          city: 'City',
          postcode: 'Postcode',
          country: 'GB',
        },
        industrySectorId: 1234,
        industryClassId: 5444,
        smeType: 'Medium',
        probabilityOfDefault: null,
        isFinanceIncreasing: null,
        isInDraft: false,
      },
      required: ['companyName', 'registeredAddress.line2'],
    };

    const displayItems = [
      {
        label: 'Companies House registration number',
        id: 'companiesHouseRegistrationNumber',
        // href: exporterUri,
      },
      {
        label: 'Company name',
        id: 'companyName',
        href: `${exporterUri}/address`,
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
