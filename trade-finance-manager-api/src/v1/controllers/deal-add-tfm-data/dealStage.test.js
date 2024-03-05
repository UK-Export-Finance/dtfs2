import dealStage from './dealStage';
import CONSTANTS from '../../../constants';

describe('dealStage', () => {
  it('should return DEAL_STAGE_TFM.APPLICATION when status is not PORTAL_DEAL_STATUS.UKEF_ACKNOWLEDGED and submissionType is not AIN or MIN', () => {
    const status = CONSTANTS.DEALS.PORTAL_DEAL_STATUS.UKEF_ACKNOWLEDGED;
    const submissionType = 'SOME_SUBMISSION_TYPE';

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
    const submissionType = 'SOME_SUBMISSION_TYPE';

    const result = dealStage(status, submissionType);

    expect(result).toBe(CONSTANTS.DEALS.DEAL_STAGE_TFM.APPLICATION);
  });

  it('should return false when status is not PORTAL_DEAL_STATUS.UKEF_ACKNOWLEDGED and submissionType is not AIN or MIN', () => {
    const status = 'SOME_STATUS';
    const submissionType = 'SOME_SUBMISSION_TYPE';

    console.info = jest.fn();

    const result = dealStage(status, submissionType);

    expect(result).toBe(false);
    expect(console.info).toHaveBeenCalledWith('Invalid deal stage with status %s and submission type %s', status, submissionType);
  });

  it('should return false when status is null', () => {
    const status = null;
    const submissionType = 'SOME_SUBMISSION_TYPE';

    const result = dealStage(status, submissionType);

    expect(result).toBe(false);
  });

  it('should return false when submissionType is null', () => {
    const status = 'SOME_STATUS';
    const submissionType = null;

    const result = dealStage(status, submissionType);

    expect(result).toBe(false);
  });

  it('should return false when status is not a string', () => {
    const status = 123;
    const submissionType = 'SOME_SUBMISSION_TYPE';

    const result = dealStage(status, submissionType);

    expect(result).toBe(false);
  });

  it('should return false when submissionType is not a string', () => {
    const status = 'SOME_STATUS';
    const submissionType = 123;

    const result = dealStage(status, submissionType);

    expect(result).toBe(false);
  });

  it('should return false when status is an empty string', () => {
    const status = '';
    const submissionType = 'SOME_SUBMISSION_TYPE';

    const result = dealStage(status, submissionType);

    expect(result).toBe(false);
  });
});
