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


    const exporterStatus = status[exporter.status || 0]; // if null, set status to Not started
    const facilitiesStatus = status[facilities.status || 0]; // if null, set status to Not started
    const canSubmit = exporterStatus.code + facilitiesStatus.code === 4; // Both statuses are set to complete
    return res.render('partials/application-details.njk', {
      exporter: {
        status: exporterStatus,
        rows: mapSummaryList(exporter, exporterItems(exporterUrl)),
      },
      facilities: {
        status: facilitiesStatus,
        items: facilities.data.map((item) => ({
          heading: facilityType[item.details.type],
          rows: mapSummaryList(item, facilityItems(exporterUrl)),
        })),
      },
      submit: canSubmit,
    });
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

export default applicationDetails;
