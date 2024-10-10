import { CURRENCY } from '@ukef/dtfs2-common';
import { aCurrencyRadioItem } from '../../test-helpers/currency-radio-item';
import { mapCurrenciesToRadioItems } from './map-currencies-to-radio-items';

describe('map currencies to radio items helper', () => {
  describe('mapCurrenciesToRadioItems', () => {
    describe('when called without a checked currency', () => {
      it('should return an array of RadioItem objects for all currencies', () => {
        // Act
        const currencyRadioItems = mapCurrenciesToRadioItems();

        // Assert
        expect(currencyRadioItems.length).toEqual(Object.values(CURRENCY).length);
        expect(currencyRadioItems).toEqual([
          aCurrencyRadioItem({ currency: CURRENCY.GBP, checked: false }),
          aCurrencyRadioItem({ currency: CURRENCY.EUR, checked: false }),
          aCurrencyRadioItem({ currency: CURRENCY.USD, checked: false }),
          aCurrencyRadioItem({ currency: CURRENCY.JPY, checked: false }),
        ]);
      });
    });

    describe('when called with a checked currency', () => {
      it('should return an array of RadioItem objects with only the specified currency checked', () => {
        // Arrange
        const checkedCurrency = CURRENCY.GBP;

        // Act
        const currencyRadioItems = mapCurrenciesToRadioItems(checkedCurrency);

        // Assert
        expect(currencyRadioItems).toEqual([
          aCurrencyRadioItem({ currency: CURRENCY.GBP, checked: true }),
          aCurrencyRadioItem({ currency: CURRENCY.EUR, checked: false }),
          aCurrencyRadioItem({ currency: CURRENCY.USD, checked: false }),
          aCurrencyRadioItem({ currency: CURRENCY.JPY, checked: false }),
        ]);
      });
    });

    describe('when called with an invalid checked currency', () => {
      it('should return an array of RadioItem objects with no currency checked', () => {
        // Arrange
        const checkedCurrency = 'INVALID_CURRENCY';

        // Act
        const currencyRadioItems = mapCurrenciesToRadioItems(checkedCurrency);

        // Assert
        expect(currencyRadioItems.every((currency) => !currency.checked)).toEqual(true);
      });
    });
  });
});
