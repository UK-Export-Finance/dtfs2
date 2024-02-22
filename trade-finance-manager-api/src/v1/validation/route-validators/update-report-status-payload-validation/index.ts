import { body, checkSchema } from 'express-validator';
import { UTILISATION_REPORT_RECONCILIATION_STATUS } from '../../../../constants';
import { isValidMongoId } from '../../validateIds';

const VALID_UPDATE_PAYLOAD_STATUSES = [
  UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED,
  UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION,
] as const;

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
  body('reportsWithStatus.*.reportId', "'reportsWithStatus' array does not match any expected format")
    .exists()
    .isString()
    .custom((value: string) => {
      if (!isValidMongoId(value)) {
        throw new Error('Report id must be a valid mongo id string');
      }
      return true;
    }),
];
