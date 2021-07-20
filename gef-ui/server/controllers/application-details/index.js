/* eslint-disable no-underscore-dangle */
import _startCase from 'lodash/startCase';
import * as api from '../../services/api';
import { mapSummaryList, status } from '../../utils/helpers';
import { exporterItems, coverItems, facilityItems } from '../../utils/display-items';
import { PROGRESS, FACILITY_TYPE } from '../../../constants';

export const applicationDetails = async (req, res) => {
  const { params } = req;
  const { applicationId } = params;

  try {
    const {
      bankInternalRefName,
      exporterId,
      coverTermsId,
    } = await api.getApplication(applicationId);
    const exporter = await api.getExporter(exporterId);
    const coverTerms = await api.getCoverTerms(coverTermsId);
    const facilities = await api.getFacilities(applicationId);
    const exporterUrl = `/gef/application-details/${applicationId}`;
    const coverUrl = `/gef/application-details/${applicationId}/automatic-cover`;
    const facilityUrl = `/gef/application-details/${applicationId}/facilities`;
    const exporterStatus = status[exporter.status || PROGRESS.NOT_STARTED]; // if null, set status to Not started
    const coverStatus = status[coverTerms.status || PROGRESS.NOT_STARTED]; // if null, set status to Not started
    const facilitiesStatus = status[facilities.status || PROGRESS.NOT_STARTED]; // if null, set status to Not started
    const canSubmit = exporterStatus.code === PROGRESS.COMPLETED
      && coverStatus.code === PROGRESS.COMPLETED
      && facilitiesStatus.code === PROGRESS.COMPLETED; // All statuses are set to complete

    return res.render('partials/application-details.njk', {
      isAutomaticCover: coverTerms.isAutomaticCover,
      exporter: {
        status: exporterStatus,
        rows: mapSummaryList(exporter, exporterItems(exporterUrl, {
          showIndustryChangeLink: exporter.details.industries && exporter.details.industries.length > 1,
        })),
      },
      coverTerms: {
        status: coverStatus,
        rows: mapSummaryList(coverTerms, coverItems(coverUrl)),
      },
      facilities: {
        status: facilitiesStatus,
        data: facilities.items.map((item) => ({
          heading: _startCase(FACILITY_TYPE[item.details.type].toLowerCase()),
          rows: mapSummaryList(item, facilityItems(`${facilityUrl}/${item.details._id}`, item.details)),
          createdAt: item.details.createdAt,
          facilityId: item.details._id,
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

export const postApplicationDetails = (req, res) => {
  const { params } = req;
  const { applicationId } = params;
  return res.redirect(`/gef/application-details/${applicationId}/submit`);
};

export default {
  applicationDetails,
  postApplicationDetails,
};
