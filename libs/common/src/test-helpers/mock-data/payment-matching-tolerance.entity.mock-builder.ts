import { DbRequestSource, PaymentMatchingToleranceEntity } from '../../sql-db-entities';
import { Currency } from '../../types';

export class PaymentMatchingToleranceEntityMockBuilder {
  private readonly tolerance: PaymentMatchingToleranceEntity;

  private constructor(tolerance: PaymentMatchingToleranceEntity) {
    this.tolerance = tolerance;
  }

  public static forCurrency(currency: Currency): PaymentMatchingToleranceEntityMockBuilder {
    const data = new PaymentMatchingToleranceEntity();
    const userId = '5ce819935e539c343f141ece';
    const requestSource: DbRequestSource = {
      platform: 'PORTAL',
      userId,
    };

    data.id = 1;
    data.currency = currency;
    data.isActive = true;
    data.threshold = 13;
    data.updateLastUpdatedBy(requestSource);
    return new PaymentMatchingToleranceEntityMockBuilder(data);
  }

  public withId(id: number): PaymentMatchingToleranceEntityMockBuilder {
    this.tolerance.id = id;
    return this;
  }

  public withThreshold(threshold: number): PaymentMatchingToleranceEntityMockBuilder {
    this.tolerance.threshold = threshold;
    return this;
  }

  public withIsActive(isActive: boolean): PaymentMatchingToleranceEntityMockBuilder {
    this.tolerance.isActive = isActive;
    return this;
  }

  public withLastUpdatedByIsSystemUser(isSystemUser: boolean): PaymentMatchingToleranceEntityMockBuilder {
    this.tolerance.lastUpdatedByIsSystemUser = isSystemUser;
    return this;
  }

  public withLastUpdatedByPortalUserId(userId: string | null): PaymentMatchingToleranceEntityMockBuilder {
    this.tolerance.lastUpdatedByPortalUserId = userId;
    return this;
  }

  public withLastUpdatedByTfmUserId(userId: string | null): PaymentMatchingToleranceEntityMockBuilder {
    this.tolerance.lastUpdatedByTfmUserId = userId;
    return this;
  }

  public build(): PaymentMatchingToleranceEntity {
    return this.tolerance;
  }
}
