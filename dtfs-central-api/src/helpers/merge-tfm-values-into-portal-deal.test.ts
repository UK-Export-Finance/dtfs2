import { Deal, DEAL_STATUS, TFM_DEAL_STAGE, TfmDeal } from '@ukef/dtfs2-common';
import { mergeTfmValuesIntoPortalDeal } from './merge-tfm-values-into-portal-deal';

const mockPortalDeal = {
  status: DEAL_STATUS.UKEF_ACKNOWLEDGED,
} as Deal;

describe('mergeTfmValuesIntoPortalDeal', () => {
  it('returns the portal deal if there is no tfm deal', () => {
    // Arrange
    const tfmDeal = null;

    // Act
    const result = mergeTfmValuesIntoPortalDeal(mockPortalDeal, tfmDeal);

    // Assert
    expect(result).toEqual(mockPortalDeal);
  });

  it(`keeps the portal deal status if the tfm deal stage is not ${TFM_DEAL_STAGE.CANCELLED}`, () => {
    // Arrange
    const tfmDeal = {
      tfm: {
        stage: TFM_DEAL_STAGE.AMENDMENT_IN_PROGRESS,
      },
    } as TfmDeal;

    // Act
    const result = mergeTfmValuesIntoPortalDeal(mockPortalDeal, tfmDeal);

    // Assert
    expect(result).toEqual(mockPortalDeal);
  });

  it(`sets status to ${DEAL_STATUS.CANCELLED} if the tfm deal stage is ${TFM_DEAL_STAGE.CANCELLED}`, () => {
    // Arrange
    const tfmDeal = {
      tfm: {
        stage: TFM_DEAL_STAGE.CANCELLED,
      },
    } as TfmDeal;

    // Act
    const result = mergeTfmValuesIntoPortalDeal(mockPortalDeal, tfmDeal);

    // Assert
    expect(result).toEqual({
      ...mockPortalDeal,
      status: DEAL_STATUS.CANCELLED,
    });
  });
});
