import * as api from '../../services/api';
import {
  mapSummaryList, status, facilityType,
} from '../../utils/helpers';
import { exporterItems, facilityItems } from '../../utils/displayItems';

const applicationDetails = async (req, res) => {
  try {
    const NOT_STARTED = 'NOT_STARTED';
    const COMPLETED = 'COMPLETED';
    const { params, query } = req;
    const { applicationId } = params;
    const { manual } = query;
    const { exporterId } = await api.getApplication(applicationId);
    const exporter = await api.getExporter(exporterId);
    const facilities = await api.getFacilities(applicationId);
    const exporterUrl = `/gef/application-details/${applicationId}`;
    const exporterStatus = status[exporter.status || NOT_STARTED]; // if null, set status to Not started
    const facilitiesStatus = status[facilities.status || NOT_STARTED]; // if null, set status to Not started
    const canSubmit = exporterStatus.code === COMPLETED && facilitiesStatus.code === COMPLETED; // Both statuses are set to complete

    return res.render('partials/application-details.njk', {
      isManual: manual,
      exporter: {
        status: exporterStatus,
        rows: mapSummaryList(exporter, exporterItems(exporterUrl)),
      },
      facilities: {
        status: facilitiesStatus,
        data: facilities.items.map((item) => ({
          heading: facilityType[item.details.type],
          rows: mapSummaryList(item, facilityItems(exporterUrl, item.details.type)),
        })),
      },
      submit: canSubmit,
    });
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

export default applicationDetails;
