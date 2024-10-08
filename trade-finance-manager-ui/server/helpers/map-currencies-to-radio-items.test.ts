import { CURRENCY } from '@ukef/dtfs2-common';
import { mapCurrenciesToRadioItems } from './map-currencies-to-radio-items';

describe('map currencies to radio items helper', () => {
  describe('mapCurrenciesToRadioItems', () => {
    describe('when called without a checked currency', () => {
      it('should return an array of RadioItem objects for all currencies', () => {
        // Act
        const currencyRadioItems = mapCurrenciesToRadioItems();

        // Assert
        expect(currencyRadioItems.length).toBe(Object.values(CURRENCY).length);
        expect(currencyRadioItems).toEqual([
          {
            text: CURRENCY.GBP,
            value: CURRENCY.GBP,
            checked: false,
            attributes: {
              'data-cy': 'currency-GBP',
            },
          },
          {
            text: CURRENCY.EUR,
            value: CURRENCY.EUR,
            checked: false,
            attributes: {
              'data-cy': 'currency-EUR',
            },
          },
          {
            text: CURRENCY.USD,
            value: CURRENCY.USD,
            checked: false,
            attributes: {
              'data-cy': 'currency-USD',
            },
          },
          {
            text: CURRENCY.JPY,
            value: CURRENCY.JPY,
            checked: false,
            attributes: {
              'data-cy': 'currency-JPY',
            },
          },
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
          {
            text: CURRENCY.GBP,
            value: CURRENCY.GBP,
            checked: true,
            attributes: {
              'data-cy': 'currency-GBP',
            },
          },
          {
            text: CURRENCY.EUR,
            value: CURRENCY.EUR,
            checked: false,
            attributes: {
              'data-cy': 'currency-EUR',
            },
          },
          {
            text: CURRENCY.USD,
            value: CURRENCY.USD,
            checked: false,
            attributes: {
              'data-cy': 'currency-USD',
            },
          },
          {
            text: CURRENCY.JPY,
            value: CURRENCY.JPY,
            checked: false,
            attributes: {
              'data-cy': 'currency-JPY',
            },
          },
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
