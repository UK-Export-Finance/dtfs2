import { isDealCancelled } from './is-deal-cancelled';
import { MappedDealTfm } from '../types';
import { TFM_DEAL_STAGE, TFM_DEAL_CANCELLATION_STATUS } from '../constants';

describe('isDealCancelled', () => {
  it('should return true if the deal stage is CANCELLED', () => {
    const tfmDealObject = {
      stage: TFM_DEAL_STAGE.CANCELLED,
    } as MappedDealTfm;

    const result = isDealCancelled(tfmDealObject);

    expect(result).toEqual(true);
  });

  it('should return true if the deal cancellation status is PENDING', () => {
    const tfmDealObject = {
      stage: TFM_DEAL_STAGE.CANCELLED,
      cancellation: {
        status: TFM_DEAL_CANCELLATION_STATUS.PENDING,
      },
    } as MappedDealTfm;

    const result = isDealCancelled(tfmDealObject);

    expect(result).toEqual(true);
  });

  it('should return false if the deal stage is not CANCELLED and there is no cancellation status', () => {
    const tfmDealObject = {
      stage: TFM_DEAL_STAGE.CONFIRMED,
    } as MappedDealTfm;

    const result = isDealCancelled(tfmDealObject);

    expect(result).toEqual(false);
  });

  it('should return false if the deal stage is not CANCELLED and the cancellation status is DRAFT', () => {
    const tfmDealObject = {
      stage: TFM_DEAL_STAGE.CONFIRMED,
      cancellation: {
        status: TFM_DEAL_CANCELLATION_STATUS.DRAFT,
      },
    } as MappedDealTfm;

    const result = isDealCancelled(tfmDealObject);

    expect(result).toEqual(false);
  });
});
