/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { PDC_TEAM_IDS, validateFeeRecordCorrectionFeatureFlagIsEnabled, setNoStoreCacheControl } from '@ukef/dtfs2-common';
import { getUtilisationReports } from '../../controllers/utilisation-reports';
import { validateSqlId, validateUserTeam, validatePostAddPaymentRequestBody, validatePostRemoveFeesFromPaymentRequestBody } from '../../middleware';
import { getReportDownload } from '../../controllers/utilisation-reports/report-download';
import { getUtilisationReportReconciliationByReportId } from '../../controllers/utilisation-reports/utilisation-report-reconciliation-for-report';
import { getFindReportsByYear } from '../../controllers/utilisation-reports/find-reports-by-year';
import { addPayment } from '../../controllers/utilisation-reports/add-payment';
import { postKeyingData, postKeyingDataMarkAsDone, postKeyingDataMarkAsToDo } from '../../controllers/utilisation-reports/keying-data';
import { postCheckKeyingData } from '../../controllers/utilisation-reports/check-keying-data';
import { getEditPayment, postEditPayment } from '../../controllers/utilisation-reports/edit-payment';
import { getConfirmDeletePayment, postConfirmDeletePayment } from '../../controllers/utilisation-reports/confirm-delete-payment';
import { postRemoveFeesFromPayment } from '../../controllers/utilisation-reports/remove-fees-from-payment';
import { addToAnExistingPayment } from '../../controllers/utilisation-reports/add-to-an-existing-payment';
import {
  getCreateRecordCorrectionRequest,
  postCreateRecordCorrectionRequest,
} from '../../controllers/utilisation-reports/record-corrections/create-record-correction-request';
import {
  getRecordCorrectionRequestInformation,
  postRecordCorrectionRequestInformation,
} from '../../controllers/utilisation-reports/record-corrections/check-the-information';
import { postInitiateRecordCorrectionRequest } from '../../controllers/utilisation-reports/record-corrections/initiate-record-correction-request';
import { getRecordCorrectionRequestSent } from '../../controllers/utilisation-reports/record-corrections/request-sent';
import { getCancelRecordCorrectionRequest } from '../../controllers/utilisation-reports/record-corrections/cancel-record-correction-request';
import { getRecordCorrectionLogDetails } from '../../controllers/utilisation-reports/record-corrections/record-correction-log-details';

export const utilisationReportsRoutes = express.Router();

/**
 * @openapi
 * /:
 *   get:
 *     summary: Get utilisation reports page
 *     tags: [TFM]
 *     description: Get utilisation reports page
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
utilisationReportsRoutes.get('/', validateUserTeam(Object.values(PDC_TEAM_IDS)), getUtilisationReports);

/**
 * @openapi
 * /:id/download:
 *   get:
 *     summary: Download utilisation reports
 *     tags: [TFM]
 *     description: Download utilisation reports
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: the utilisation report ID
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
utilisationReportsRoutes.get('/:id/download', validateUserTeam(Object.values(PDC_TEAM_IDS)), validateSqlId('id'), getReportDownload);

/**
 * @openapi
 * /find-reports-by-year:
 *   get:
 *     summary: Get find reports by year route
 *     tags: [TFM]
 *     description: Get find reports by year route
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
utilisationReportsRoutes.get('/find-reports-by-year', validateUserTeam(Object.values(PDC_TEAM_IDS)), getFindReportsByYear);

/**
 * @openapi
 * /:reportId:
 *   get:
 *     summary: Get utilisation report reconciliation for report route
 *     tags: [TFM]
 *     description: Get utilisation report reconciliation for report route
 *     parameters:
 *       - in: path
 *         name: reportId
 *         schema:
 *           type: string
 *         required: true
 *         description: the utilisation report ID
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
utilisationReportsRoutes.get(
  '/:reportId',
  validateUserTeam(Object.values(PDC_TEAM_IDS)),
  validateSqlId('reportId'),
  getUtilisationReportReconciliationByReportId,
);

/**
 * @openapi
 * /:reportId/add-payment:
 *   post:
 *     summary: Post add payment
 *     tags: [TFM]
 *     description: Post add payment
 *     parameters:
 *       - in: path
 *         name: reportId
 *         schema:
 *           type: string
 *         required: true
 *         description: the utilisation report ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
utilisationReportsRoutes.post(
  '/:reportId/add-payment',
  validateUserTeam([PDC_TEAM_IDS.PDC_RECONCILE]),
  validateSqlId('reportId'),
  validatePostAddPaymentRequestBody,
  addPayment,
);

/**
 * @openapi
 * /:reportId/add-to-an-existing-payment:
 *   post:
 *     summary: Post to add to an existing payment
 *     tags: [TFM]
 *     description: Post to add to an existing payment
 *     parameters:
 *       - in: path
 *         name: reportId
 *         schema:
 *           type: string
 *         required: true
 *         description: the utilisation report ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
utilisationReportsRoutes.post(
  '/:reportId/add-to-an-existing-payment',
  validateUserTeam([PDC_TEAM_IDS.PDC_RECONCILE]),
  validateSqlId('reportId'),
  addToAnExistingPayment,
);

/**
 * @openapi
 * /:reportId/check-keying-data:
 *   post:
 *     summary: Post to check keying data
 *     tags: [TFM]
 *     description: Post to check keying data
 *     parameters:
 *       - in: path
 *         name: reportId
 *         schema:
 *           type: string
 *         required: true
 *         description: the utilisation report ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
utilisationReportsRoutes.post('/:reportId/check-keying-data', validateUserTeam([PDC_TEAM_IDS.PDC_RECONCILE]), validateSqlId('reportId'), postCheckKeyingData);

/**
 * @openapi
 * /:reportId/keying-data/mark-as-done:
 *   post:
 *     summary: Post keying data mark as done
 *     tags: [TFM]
 *     description: Post keying data mark as done
 *     parameters:
 *       - in: path
 *         name: reportId
 *         schema:
 *           type: string
 *         required: true
 *         description: the utilisation report ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
utilisationReportsRoutes.post(
  '/:reportId/keying-data/mark-as-done',
  validateUserTeam([PDC_TEAM_IDS.PDC_RECONCILE]),
  validateSqlId('reportId'),
  postKeyingDataMarkAsDone,
);

/**
 * @openapi
 * /:reportId/keying-data/mark-as-to-do:
 *   post:
 *     summary: Post keying data mark as to do
 *     tags: [TFM]
 *     description: Post keying data mark as to do
 *     parameters:
 *       - in: path
 *         name: reportId
 *         schema:
 *           type: string
 *         required: true
 *         description: the utilisation report ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
utilisationReportsRoutes.post(
  '/:reportId/keying-data/mark-as-to-do',
  validateUserTeam([PDC_TEAM_IDS.PDC_RECONCILE]),
  validateSqlId('reportId'),
  postKeyingDataMarkAsToDo,
);

/**
 * @openapi
 * /:reportId/keying-data:
 *   post:
 *     summary: Post keying data
 *     tags: [TFM]
 *     description: Post keying data
 *     parameters:
 *       - in: path
 *         name: reportId
 *         schema:
 *           type: string
 *         required: true
 *         description: the utilisation report ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
utilisationReportsRoutes.post('/:reportId/keying-data', validateUserTeam([PDC_TEAM_IDS.PDC_RECONCILE]), validateSqlId('reportId'), postKeyingData);

/**
 * @openapi
 * /:reportId/edit-payment/:paymentId:
 *   get:
 *     summary: Get edit payment page
 *     tags: [TFM]
 *     description: Get edit payment page
 *     parameters:
 *       - in: path
 *         name: reportId, paymentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the utilisation report ID and the payment ID
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
utilisationReportsRoutes.get(
  '/:reportId/edit-payment/:paymentId',
  validateUserTeam([PDC_TEAM_IDS.PDC_RECONCILE]),
  validateSqlId('reportId'),
  validateSqlId('paymentId'),
  getEditPayment,
);

/**
 * @openapi
 * /:reportId/edit-payment/:paymentId:
 *   post:
 *     summary: Get edit payment page
 *     tags: [TFM]
 *     description: Get edit payment page
 *     parameters:
 *       - in: path
 *         name: reportId, paymentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the utilisation report ID and the payment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
utilisationReportsRoutes.post(
  '/:reportId/edit-payment/:paymentId',
  validateUserTeam([PDC_TEAM_IDS.PDC_RECONCILE]),
  validateSqlId('reportId'),
  validateSqlId('paymentId'),
  postEditPayment,
);

/**
 * @openapi
 * /:reportId/edit-payment/:paymentId/confirm-delete:
 *   get:
 *     summary: Get confirm delete payment page
 *     tags: [TFM]
 *     description: Get confirm delete payment page
 *     parameters:
 *       - in: path
 *         name: reportId, paymentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the utilisation report ID and the payment ID
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
utilisationReportsRoutes.get(
  '/:reportId/edit-payment/:paymentId/confirm-delete',
  validateUserTeam([PDC_TEAM_IDS.PDC_RECONCILE]),
  validateSqlId('reportId'),
  validateSqlId('paymentId'),
  getConfirmDeletePayment,
);

/**
 * @openapi
 * /:reportId/edit-payment/:paymentId/confirm-delete:
 *   post:
 *     summary: Post confirm delete payment
 *     tags: [TFM]
 *     description: Post confirm delete payment page
 *     parameters:
 *       - in: path
 *         name: reportId, paymentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the utilisation report ID and the payment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
utilisationReportsRoutes.post(
  '/:reportId/edit-payment/:paymentId/confirm-delete',
  validateUserTeam([PDC_TEAM_IDS.PDC_RECONCILE]),
  validateSqlId('reportId'),
  validateSqlId('paymentId'),
  postConfirmDeletePayment,
);

/**
 * @openapi
 * /:reportId/edit-payment/:paymentId/remove-selected-fees:
 *   post:
 *     summary: Post remove fees from payment
 *     tags: [TFM]
 *     description: Post remove fees from payment
 *     parameters:
 *       - in: path
 *         name: reportId, paymentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the utilisation report ID and the payment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
utilisationReportsRoutes.post(
  '/:reportId/edit-payment/:paymentId/remove-selected-fees',
  validateUserTeam([PDC_TEAM_IDS.PDC_RECONCILE]),
  validateSqlId('reportId'),
  validateSqlId('paymentId'),
  validatePostRemoveFeesFromPaymentRequestBody,
  postRemoveFeesFromPayment,
);

/**
 * @openapi
 * /:reportId/create-record-correction-request:
 *   post:
 *     summary: Post initiate record correction request route
 *     tags: [TFM]
 *     description: Post initiate record correction request route
 *     parameters:
 *       - in: path
 *         name: reportId
 *         schema:
 *           type: string
 *         required: true
 *         description: the utilisation report ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
utilisationReportsRoutes.post(
  '/:reportId/create-record-correction-request',
  validateFeeRecordCorrectionFeatureFlagIsEnabled,
  validateUserTeam([PDC_TEAM_IDS.PDC_RECONCILE]),
  validateSqlId('reportId'),
  postInitiateRecordCorrectionRequest,
);

/**
 * @openapi
 * /:reportId/create-record-correction-request/:feeRecordId:
 *   get:
 *     summary: Get create record correction request route
 *     tags: [TFM]
 *     description: Get create record correction request route
 *     parameters:
 *       - in: path
 *         name: reportId, feeRecordId
 *         schema:
 *           type: string
 *         required: true
 *         description: the utilisation report ID and feeRecordId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
utilisationReportsRoutes.get(
  '/:reportId/create-record-correction-request/:feeRecordId',
  validateFeeRecordCorrectionFeatureFlagIsEnabled,
  setNoStoreCacheControl,
  validateUserTeam([PDC_TEAM_IDS.PDC_RECONCILE]),
  validateSqlId('reportId'),
  validateSqlId('feeRecordId'),
  getCreateRecordCorrectionRequest,
);

/**
 * @openapi
 * /:reportId/create-record-correction-request/:feeRecordId:
 *   post:
 *     summary: Post create record correction request route
 *     tags: [TFM]
 *     description: Post create record correction request route
 *     parameters:
 *       - in: path
 *         name: reportId, feeRecordId
 *         schema:
 *           type: string
 *         required: true
 *         description: the utilisation report ID and the feeRecord ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
utilisationReportsRoutes.post(
  '/:reportId/create-record-correction-request/:feeRecordId',
  validateFeeRecordCorrectionFeatureFlagIsEnabled,
  validateUserTeam([PDC_TEAM_IDS.PDC_RECONCILE]),
  validateSqlId('reportId'),
  validateSqlId('feeRecordId'),
  postCreateRecordCorrectionRequest,
);

/**
 * @openapi
 * /:reportId/create-record-correction-request/:feeRecordId/check-the-information:
 *   get:
 *     summary: Get the "check the information" page for a record correction request
 *     tags: [TFM]
 *     description: Get the "check the information" page for a record correction request
 *     parameters:
 *       - in: path
 *         name: reportId, feeRecordId
 *         schema:
 *           type: string
 *         required: true
 *         description: the utilisation report ID and the feeRecord ID
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
utilisationReportsRoutes.get(
  '/:reportId/create-record-correction-request/:feeRecordId/check-the-information',
  setNoStoreCacheControl,
  validateFeeRecordCorrectionFeatureFlagIsEnabled,
  validateUserTeam([PDC_TEAM_IDS.PDC_RECONCILE]),
  validateSqlId('reportId'),
  validateSqlId('feeRecordId'),
  getRecordCorrectionRequestInformation,
);

/**
 * @openapi
 * /:reportId/create-record-correction-request/:feeRecordId/check-the-information:
 *   post:
 *     summary: Post record correction request check the info route.
 *     tags: [TFM]
 *     description: Post record correction request check the info route.
 *     parameters:
 *       - in: path
 *         name: reportId, feeRecordId
 *         schema:
 *           type: string
 *         required: true
 *         description: the utilisation report ID and the feeRecord ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
utilisationReportsRoutes.post(
  '/:reportId/create-record-correction-request/:feeRecordId/check-the-information',
  validateFeeRecordCorrectionFeatureFlagIsEnabled,
  validateUserTeam([PDC_TEAM_IDS.PDC_RECONCILE]),
  validateSqlId('reportId'),
  validateSqlId('feeRecordId'),
  postRecordCorrectionRequestInformation,
);

/**
 * @openapi
 * /:reportId/create-record-correction-request/:feeRecordId/request-sent:
 *   get:
 *     summary: Get the "request sent" page for a record correction request.
 *     tags: [TFM]
 *     description: Get the "request sent" page for a record correction request.
 *     parameters:
 *       - in: path
 *         name: reportId, feeRecordId
 *         schema:
 *           type: string
 *         required: true
 *         description: the utilisation report ID and the feeRecord ID
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
utilisationReportsRoutes.get(
  '/:reportId/create-record-correction-request/:feeRecordId/request-sent',
  validateFeeRecordCorrectionFeatureFlagIsEnabled,
  validateUserTeam([PDC_TEAM_IDS.PDC_RECONCILE]),
  validateSqlId('reportId'),
  validateSqlId('feeRecordId'),
  getRecordCorrectionRequestSent,
);

/**
 * @openapi
 * /:reportId/create-record-correction-request/:feeRecordId/cancel:
 *   get:
 *     summary: Get cancel record correction request route.
 *     tags: [TFM]
 *     description: Get cancel record correction request route.
 *     parameters:
 *       - in: path
 *         name: reportId, feeRecordId
 *         schema:
 *           type: string
 *         required: true
 *         description: the utilisation report ID and the feeRecord ID
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
utilisationReportsRoutes.get(
  '/:reportId/create-record-correction-request/:feeRecordId/cancel',
  validateFeeRecordCorrectionFeatureFlagIsEnabled,
  validateUserTeam([PDC_TEAM_IDS.PDC_RECONCILE]),
  validateSqlId('reportId'),
  validateSqlId('feeRecordId'),
  getCancelRecordCorrectionRequest,
);

/**
 * @openapi
 * /record-correction-log-details/:correctionId:
 *   get:
 *     summary: Get the "get record correction log details" page for a record correction log entry
 *     tags: [TFM]
 *     description: Get  the "get record correction log details" page for a record correction log entry
 *     parameters:
 *       - in: path
 *         name: correctionId
 *         schema:
 *           type: string
 *         required: true
 *         description: the correction ID
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
utilisationReportsRoutes.get(
  '/record-correction-log-details/:correctionId',
  validateFeeRecordCorrectionFeatureFlagIsEnabled,
  validateUserTeam(Object.values(PDC_TEAM_IDS)),
  validateSqlId('correctionId'),
  getRecordCorrectionLogDetails,
);
