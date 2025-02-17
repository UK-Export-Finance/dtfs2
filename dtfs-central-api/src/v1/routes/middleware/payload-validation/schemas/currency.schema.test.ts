import { CURRENCY, Currency } from '@ukef/dtfs2-common';
import { CurrencySchema } from './currency.schema';

describe('currency.schema', () => {
  describe('CurrencySchema', () => {
    it.each(Object.values(CURRENCY))("sets the 'success' property to true when the currency is '%s'", (currency) => {
      // Act
      const { success } = CurrencySchema.safeParse(currency);

      // Assert
      expect(success).toEqual(true);
    });

    it("sets the 'success' property to false when the currency is invalid", () => {
      // Arrange
      const invalidCurrency = 'An invalid currency';

      // Act
      const { success } = CurrencySchema.safeParse(invalidCurrency);

      // Assert
      expect(success).toEqual(false);
    });

    it("sets the 'data' property to the parsed currency", () => {
      // Arrange
      const currency: Currency = CURRENCY.GBP;

      // Act
      const { data } = CurrencySchema.safeParse(currency);

      // Assert
      expect(data).toEqual(currency);
    });
  });
});
