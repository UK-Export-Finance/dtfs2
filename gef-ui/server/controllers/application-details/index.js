import _startCase from 'lodash/startCase';
import * as api from '../../services/api';
import { mapSummaryList, status } from '../../utils/helpers';
import { exporterItems, facilityItems } from '../../utils/display-items';
import { PROGRESS, FACILITY_TYPE } from '../../../constants';

const applicationDetails = async (req, res) => {
  const { params, query } = req;
  const { applicationId } = params;
  const { manual } = query;

  try {
    const { bankInternalRefName, exporterId } = await api.getApplication(applicationId);
    const exporter = await api.getExporter(exporterId);
    const facilities = await api.getFacilities(applicationId);
    const exporterUrl = `/gef/application-details/${applicationId}`;
    const facilityUrl = `/gef/application-details/${applicationId}/facilities`;
    const exporterStatus = status[exporter.status || PROGRESS.NOT_STARTED]; // if null, set status to Not started
    const facilitiesStatus = status[facilities.status || PROGRESS.NOT_STARTED]; // if null, set status to Not started
    const canSubmit = exporterStatus.code === PROGRESS.COMPLETED
    && facilitiesStatus.code === PROGRESS.COMPLETED; // Both statuses are set to complete

    return res.render('partials/application-details.njk', {
      isManual: manual,
      exporter: {
        status: exporterStatus,
        rows: mapSummaryList(exporter, exporterItems(exporterUrl, {
          showIndustryChangeLink: exporter.details.industries && exporter.details.industries.length > 1,
        })),
      },
      facilities: {
        status: facilitiesStatus,
        data: facilities.items.map((item) => ({
          heading: _startCase(FACILITY_TYPE[item.details.type].toLowerCase()),
          // eslint-disable-next-line no-underscore-dangle
          rows: mapSummaryList(item, facilityItems(`${facilityUrl}/${item.details._id}`, item.details)),
          createdAt: item.details.createdAt,
        })).sort((a, b) => b.createdAt - a.createdAt), // latest facility appears at top
      },
      submit: canSubmit,
      bankInternalRefName,
      applicationId,
    });
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

export default applicationDetails;
