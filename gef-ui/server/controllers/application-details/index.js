import * as api from '../../services/api';
import { mapSummaryList, status, facilityType } from '../../utils/helpers';
import { exporterItems, facilityItems } from '../../utils/displayItems';

const applicationDetails = async (req, res) => {
  try {
    const { params } = req;
    const { applicationId } = params;
    const { exporterId } = await api.getApplication(applicationId);
    const exporter = await api.getExporter(exporterId);
    const facilities = await api.getFacilities(applicationId);
    const exporterUrl = `/gef/application-details/${applicationId}`;

    return res.render('partials/application-details.njk', {
      exporter: {
        status: status[exporter.status],
        rows: mapSummaryList(exporter, exporterItems(exporterUrl)),
      },
      facilities: {
        status: status[facilities.status],
        items: facilities.items.map((item) => ({
          heading: facilityType[item.details.type],
          rows: mapSummaryList(item, facilityItems(exporterUrl)),
        })),
      },
      submit: false,
    });
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

export default applicationDetails;
