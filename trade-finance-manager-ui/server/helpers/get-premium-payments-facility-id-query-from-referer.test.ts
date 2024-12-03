import { getPremiumPaymentsFacilityIdQueryFromReferer } from './get-premium-payments-facility-id-query-from-referer';

describe('get-premium-payments-facility-id-query-from-referer', () => {
  describe('getPremiumPaymentsFacilityIdQueryFromReferer', () => {
    it('should return undefined if the referer is not defined', () => {
      // Act
      const query = getPremiumPaymentsFacilityIdQueryFromReferer();

      // Assert
      expect(query).toBeUndefined();
    });

    it('should return undefined if the referer does not contain a facility id query', () => {
      // Arrange
      const referer = 'utilisation-report/123';

      // Act
      const query = getPremiumPaymentsFacilityIdQueryFromReferer(referer);

      // Assert
      expect(query).toBeUndefined();
    });

    it('should return the facility id query from the referer if it has one', () => {
      // Arrange
      const referer = 'utilisation-report/123?premiumPaymentsFacilityId=12345';

      // Act
      const query = getPremiumPaymentsFacilityIdQueryFromReferer(referer);

      // Assert
      expect(query).toEqual('12345');
    });
  });
});
