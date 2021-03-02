import * as api from '../../services/api';
import { mapSummaryList, status, facilityType } from '../../utils/helpers';
import { exporterItems, facilityItems } from '../../utils/displayItems';

const applicationDetails = async (req, res) => {
  try {
    const { params } = req;
    const { applicationId } = params;
    const application = await api.getApplication(applicationId);
    const { exporterId } = application;
    const exporter = await api.getExporter(exporterId);
    // const facilities = await api.getFacilities(applicationId);
    const exporterUrl = `/gef/application-details/${applicationId}`;

    const mockedFacilities = {
      status: 2,
      items: [{
        details: {
          applicationId: '123',
          type: 1,
          hasBeenIssued: true,
          name: 'My test',
          startOnDayOfNotice: true,
          coverStartDate: null,
          coverEndDate: 1614682309534,
          monthsOfCover: 7,
          details: ['term-basis', 'committed-basis', 'other'],
          detailsOther: null,
          currency: 'GBP',
          value: 2000,
          coverPercentage: 20,
          riskMarginPercentage: 14,
          paymentType: Number,
          createdAt: 1614682309534,
          updatedAt: null,
        },
        validation: {
          required: [],
        },
      },
      {
        details: {
          applicationId: '123',
          type: 2,
          hasBeenIssued: true,
          name: 'MONKEY',
          startOnDayOfNotice: true,
          banksMaximumLiability: 400000,
          ukefMaximumLiability: 1600000,
          coverStartDate: null,
          coverEndDate: 1614682309534,
          monthsOfCover: 7,
          details: ['term-basis', 'committed-basis', 'other'],
          detailsOther: null,
          currency: 'GBP',
          value: 2000,
          coverPercentage: 20,
          interestPercentage: 2.5,
          paymentType: Number,
          createdAt: 1614682309534,
          updatedAt: null,
        },
        validation: {
          required: [],
        },
      }],
    };

    if (!application) {
      return res.render('partials/page-not-found');
    }

    return res.render('partials/application-details.njk', {
      exporter: {
        status: status[exporter.status],
        rows: mapSummaryList(exporter, exporterItems(exporterUrl)),
      },
      facilities: {
        status: status[mockedFacilities.status],
        items: mockedFacilities.items.map((item) => ({
          heading: facilityType[item.details.type],
          rows: mapSummaryList(item, facilityItems(exporterUrl)),
        })),
      },
    });
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

export default applicationDetails;
