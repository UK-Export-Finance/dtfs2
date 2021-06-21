/* eslint-disable no-underscore-dangle */
const componentRenderer = require('../../../component-tests/componentRenderer');

const component = '../templates/deals/_macros/deals-table-heading.njk';

const renderTableContainer = true;
const render = componentRenderer(component, renderTableContainer);

describe(component, () => {
  let wrapper;
  let params;

  describe('when params.activeSortByOrder does not match params.buttonValue', () => {
    it('should render aria-sort label with default `ascending` value', () => {
      params = {
        buttonText: 'test',
        activeSortByField: 'dealSnapshot.details.someOtherField',
        activeSortByOrder: 'descending',
        buttonValue: 'dealSnapshot.details.ukefDealId',
      };

      wrapper = render(params);
      wrapper.expectAriaSort('[data-cy="deals-table-heading-deal-id"]').toEqual('ascending');
    });
  });

  describe('when params.activeSortByOrder matches params.buttonValue', () => {
    it('should render aria-sort label with params.activeSortByOrder value', () => {
      params = {
        buttonText: 'test',
        activeSortByField: 'dealSnapshot.details.ukefDealId',
        activeSortByOrder: 'descending',
        buttonValue: 'dealSnapshot.details.ukefDealId',
      };

      wrapper = render(params);
      wrapper.expectAriaSort('[data-cy="deals-table-heading-deal-id"]').toEqual(params.activeSortByOrder);
    });
  });

  describe('button', () => {
    it('should render text from params', () => {
      params = {
        buttonText: 'Test',
      };

      wrapper = render(params);
      wrapper.expectText('[data-cy="deals-table-heading-deal-id"]').toRead(params.buttonText);
    });

    it('should render value attribute from params', () => {
      params = {
        buttonValue: 'dealSnapshot.details.ukefDealId',
      };

      wrapper = render(params);
      wrapper.expectInput('[data-cy="deals-table-heading-deal-id-button"]').toHaveValue(params.buttonValue);
    });

    it('should render default name attribute', () => {
      params = {};

      wrapper = render(params);
      wrapper.expectElement('[data-cy="deals-table-heading-deal-id-button"]').toHaveAttribute('name', 'ascending');
    });

    describe('when fieldHasActiveSortBy and when params.activeSortByOrder equals default `ascending`', () => {
      it('should render `descending` name attribute`', () => {
        params = {
          activeSortByField: 'dealSnapshot.details.ukefDealId',
          buttonValue: 'dealSnapshot.details.ukefDealId',
          activeSortByOrder: 'ascending',
        };

        wrapper = render(params);
        wrapper.expectElement('[data-cy="deals-table-heading-deal-id-button"]').toHaveAttribute('name', 'descending');
      });
    });
  });
});
