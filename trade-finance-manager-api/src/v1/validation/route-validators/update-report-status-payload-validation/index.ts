import { body, checkSchema } from 'express-validator';
import { PENDING_RECONCILIATION, RECONCILIATION_COMPLETED } from '@ukef/dtfs2-common';

const VALID_UPDATE_PAYLOAD_STATUSES = [RECONCILIATION_COMPLETED, PENDING_RECONCILIATION] as const;

export const updateReportStatusPayloadValidation = [
  body('user', "Expected body to contain 'user' object").exists().isObject(),
  body('reportsWithStatus', "Expected body to contain non-empty 'reportsWithStatus' array").exists().isArray({ min: 1 }),
  checkSchema({
    'reportsWithStatus.*.status': {
      isIn: {
        options: [VALID_UPDATE_PAYLOAD_STATUSES],
        errorMessage: `Report status must be one of the following: ${VALID_UPDATE_PAYLOAD_STATUSES.join(', ')}`,
      },
    },
  }),
  body('reportsWithStatus.*.reportId', 'Report id must be an integer').exists().isInt({ gt: 0 }),
];
