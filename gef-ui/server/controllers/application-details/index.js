/* eslint-disable no-underscore-dangle */
import _startCase from 'lodash/startCase';
import * as api from '../../services/api';
import { mapSummaryList, status, validationErrorHandler } from '../../utils/helpers';
import { exporterItems, coverItems, facilityItems } from '../../utils/display-items';
import { PROGRESS, FACILITY_TYPE } from '../../../constants';

const maxCommentLength = 400;

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

export const getApplicationSubmission = (req, res) => {
  const { params } = req;
  const { applicationId } = params;
  return res.render('application-details-comments.njk', { applicationId, maxCommentLength });
};

export const postApplicationSubmission = async (req, res, next) => {
  const { params, body } = req;
  const { userToken } = req.session;
  const { applicationId } = params;
  const { comment } = body;
  const application = await api.getApplication(applicationId);
  const maker = await api.getMakerUser(application.userId, userToken);

  // TODO : Add some validation here to make sure that the whole application is valid
  try {
    if (comment.length > maxCommentLength) {
      const errors = validationErrorHandler({
        errRef: 'comment',
        errMsg: `You have entered more than ${maxCommentLength} characters`,
      });

      return res.render('application-details-comments.njk', {
        applicationId, maxCommentLength, errors, comment,
      });
    }

    const commentObj = {
      role: 'maker', userName: maker.username, createdAt: Date.now(), comment,
    };
    const comments = application.comments || [];
    comments.push(commentObj);

    application.comments = comments;
    application.status = PROGRESS.BANK_CHECK;

    await api.updateApplication(applicationId, application);
  } catch (err) {
    return next(err);
  }

  return res.render('application-details-submitted.njk', { applicationId });
};


export default {
  applicationDetails,
  postApplicationDetails,
  getApplicationSubmission,
  postApplicationSubmission,
};
