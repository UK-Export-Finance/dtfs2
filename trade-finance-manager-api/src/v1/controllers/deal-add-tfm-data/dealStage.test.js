import dealStage from './dealStage';
import CONSTANTS from '../../../constants';

describe('dealStage', () => {
  it('should return DEAL_STAGE_TFM.APPLICATION when status is not PORTAL_DEAL_STATUS.UKEF_ACKNOWLEDGED and submissionType is not AIN or MIN', () => {
    const status = CONSTANTS.DEALS.PORTAL_DEAL_STATUS.UKEF_ACKNOWLEDGED;
    const submissionType = 'INVALID';

    const result = dealStage(status, submissionType);

    expect(result).toBe(CONSTANTS.DEALS.DEAL_STAGE_TFM.APPLICATION);
  });

  it('should return DEAL_STAGE_TFM.CONFIRMED when status is PORTAL_DEAL_STATUS.UKEF_ACKNOWLEDGED and submissionType is AIN', () => {
    const status = CONSTANTS.DEALS.PORTAL_DEAL_STATUS.UKEF_ACKNOWLEDGED;
    const submissionType = CONSTANTS.DEALS.SUBMISSION_TYPE.AIN;

    const result = dealStage(status, submissionType);

    expect(result).toBe(CONSTANTS.DEALS.DEAL_STAGE_TFM.CONFIRMED);
  });

  it('should return DEAL_STAGE_TFM.CONFIRMED when status is PORTAL_DEAL_STATUS.UKEF_ACKNOWLEDGED and submissionType is MIN', () => {
    const status = CONSTANTS.DEALS.PORTAL_DEAL_STATUS.UKEF_ACKNOWLEDGED;
    const submissionType = CONSTANTS.DEALS.SUBMISSION_TYPE.MIN;

    const result = dealStage(status, submissionType);

    expect(result).toBe(CONSTANTS.DEALS.DEAL_STAGE_TFM.CONFIRMED);
  });

  it('should return DEAL_STAGE_TFM.APPLICATION when status is PORTAL_DEAL_STATUS.UKEF_ACKNOWLEDGED and submissionType is not AIN or MIN', () => {
    const status = CONSTANTS.DEALS.PORTAL_DEAL_STATUS.UKEF_ACKNOWLEDGED;
    const submissionType = 'INVALID';

    const result = dealStage(status, submissionType);

    expect(result).toBe(CONSTANTS.DEALS.DEAL_STAGE_TFM.APPLICATION);
  });

  it('should return `Application` when status is not PORTAL_DEAL_STATUS.UKEF_ACKNOWLEDGED and submissionType is not AIN or MIN', () => {
    const status = 'INVALID';
    const submissionType = 'INVALID';

    console.info = jest.fn();

    const result = dealStage(status, submissionType);

    expect(result).toBe(CONSTANTS.DEALS.DEAL_STAGE_TFM.APPLICATION);
    expect(console.info).toHaveBeenCalledWith(
      'Invalid deal stage with status %s and submission type %s, setting status to Application',
      status,
      submissionType,
    );
  });

  it('should return `Application` when status is null', () => {
    const status = null;
    const submissionType = 'INVALID';

    const result = dealStage(status, submissionType);

    expect(result).toBe(CONSTANTS.DEALS.DEAL_STAGE_TFM.APPLICATION);
  });

  it('should return `Application` when submissionType is null', () => {
    const status = 'INVALID';
    const submissionType = null;

    const result = dealStage(status, submissionType);

    expect(result).toBe(CONSTANTS.DEALS.DEAL_STAGE_TFM.APPLICATION);
  });

  it('should return `Application` when status is not a string', () => {
    const status = 123;
    const submissionType = 'INVALID';

    const result = dealStage(status, submissionType);

    expect(result).toBe(CONSTANTS.DEALS.DEAL_STAGE_TFM.APPLICATION);
  });

  it('should return `Application` when submissionType is not a string', () => {
    const status = 'INVALID';
    const submissionType = 123;

    const result = dealStage(status, submissionType);

    expect(result).toBe(CONSTANTS.DEALS.DEAL_STAGE_TFM.APPLICATION);
  });

  it('should return `Application` when status is an empty string', () => {
    const status = '';
    const submissionType = 'INVALID';

    const result = dealStage(status, submissionType);

    expect(result).toBe(CONSTANTS.DEALS.DEAL_STAGE_TFM.APPLICATION);
  });
});
