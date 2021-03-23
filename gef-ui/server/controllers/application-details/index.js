import * as api from '../../services/api';
import {
  mapSummaryList, status, facilityType,
} from '../../utils/helpers';
import { exporterItems, facilityItems } from '../../utils/displayItems';
import { PROGRESS } from '../../../constants';

const applicationDetails = async (req, res) => {
  const { params, query } = req;
  const { applicationId } = params;
  const { manual } = query;

  try {
    const { exporterId } = await api.getApplication(applicationId);
    const exporter = await api.getExporter(exporterId);
    const facilities = await api.getFacilities(applicationId);
    const exporterUrl = `/gef/application-details/${applicationId}`;
    const exporterStatus = status[exporter.status || PROGRESS.NOT_STARTED]; // if null, set status to Not started
    const facilitiesStatus = status[facilities.status || PROGRESS.NOT_STARTED]; // if null, set status to Not started
    const canSubmit = exporterStatus.code === PROGRESS.COMPLETED
    && facilitiesStatus.code === PROGRESS.COMPLETED; // Both statuses are set to complete

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
      applicationId,
    });
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

export default applicationDetails;
