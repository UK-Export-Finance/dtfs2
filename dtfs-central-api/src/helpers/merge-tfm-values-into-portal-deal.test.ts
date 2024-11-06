import { Deal, DEAL_STATUS, TFM_DEAL_STAGE, TfmDeal } from '@ukef/dtfs2-common';
import { mergeTfmValuesIntoPortalDeal } from './merge-tfm-values-into-portal-deal';

const portalDeal = {
  status: DEAL_STATUS.UKEF_ACKNOWLEDGED,
} as Deal;

describe('mergeTfmValuesIntoPortalDeal', () => {
  it('returns the portal deal if there is no tfm deal', () => {
    // Arrange
    const tfmDeal = null;

    // Act
    const result = mergeTfmValuesIntoPortalDeal(portalDeal, tfmDeal);

    // Assert
    expect(result).toEqual(portalDeal);
  });

  it('keeps the portal deal status if the tfm deal has not been cancelled', () => {
    // Arrange
    const tfmDeal = {
      tfm: {
        stage: TFM_DEAL_STAGE.AMENDMENT_IN_PROGRESS,
      },
    } as TfmDeal;

    // Act
    const result = mergeTfmValuesIntoPortalDeal(portalDeal, tfmDeal);

    // Assert
    expect(result).toEqual(
      expect.objectContaining({
        status: portalDeal.status,
      }),
    );
  });

  it('replaces the portal deal status if the tfm deal has been cancelled', () => {
    // Arrange
    const tfmDeal = {
      tfm: {
        stage: TFM_DEAL_STAGE.AMENDMENT_IN_PROGRESS,
      },
    } as TfmDeal;

    // Act
    const result = mergeTfmValuesIntoPortalDeal(portalDeal, tfmDeal);

    // Assert
    expect(result).toEqual(
      expect.objectContaining({
        status: DEAL_STATUS.CANCELLED,
      }),
    );
  });
});
