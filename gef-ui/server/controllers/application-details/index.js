import * as api from '../../services/api';
import { mapSummaryList } from '../../utils/helpers';

const applicationDetails = async (req, res) => {
  try {
    const { params, url } = req;
    const { applicationId } = params;
    const application = await api.getApplication(applicationId);
    console.log('applications', application);
    const { exporterId, facilityIds } = application;
    const exporter = await api.getExporter(exporterId);
    const facilities = await api.getFacilities(applicationId);
    const exporterUri = `${url}/exporter/${exporterId}`;
    // const facilityUri = `gef${url}/facility/${facilityId}`;

    console.log('facilties', facilities);


    const displayItems = [
      {
        label: 'Companies House registration number',
        id: 'companiesHouseRegistrationNumber',
        href: `${exporterUri}/`,
      },
      {
        label: 'Company name',
        id: 'companyName',
        href: `${exporterUri}/`,
      },
      {
        label: 'Registered Address',
        id: 'registeredAddress',
      },
      {
        label: 'Correspondence address, if different',
        id: 'correspondenceAddress',
      },
      {
        label: 'Industry sector',
        id: 'industrySectorId',
      },
      {
        label: 'Industry class',
        id: 'industryClassId',
      },
      {
        label: 'SME type',
        id: 'smeTypeId',
        href: `${exporterUri}/`,
      },
      {
        label: 'Probability of default',
        id: 'probabilityOfDefault',
        href: `${exporterUri}/`,
      },
      {
        label: 'Is finance for this exporter increasing?',
        id: 'isFinanceIncreasing',
        href: `${exporterUri}/`,
      },
    ];

    return res.render('partials/application-details.njk', {
      exporterRows: mapSummaryList(exporter, displayItems),
      facilityRows: [],
      // exporterUri,
      // facilityUri,
    });
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

export default applicationDetails;
