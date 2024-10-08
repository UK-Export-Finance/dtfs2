/* eslint-disable no-underscore-dangle */
const { componentRenderer } = require('../componentRenderer');

const component = '../templates/_macros/table-heading.njk';

const renderTableContainer = true;
const render = componentRenderer(component, renderTableContainer);

describe(component, () => {
  let wrapper;
  let params;

  it('should base data-cy attributes off of the tableName', () => {
    params = {
      tableName: 'tableName',
      fieldName: 'testing',
    };

    wrapper = render(params);
    wrapper.expectElement(`[data-cy="${params.tableName}-table-heading-${params.fieldName}"]`).toExist();
    wrapper.expectElement(`[data-cy="${params.tableName}-table-heading-${params.fieldName}-button"]`).toExist();
  });

  describe('when params.activeSortByOrder does not match params.buttonValue', () => {
    it('should render aria-sort label with default `none` value', () => {
      params = {
        tableName: 'deals',
        fieldName: 'testing',
        buttonText: 'test',
        activeSortByField: 'dealSnapshot.details.someOtherField',
        activeSortByOrder: 'descending',
        buttonValue: 'dealSnapshot.details.ukefDealId',
      };

      wrapper = render(params);
      wrapper.expectAriaSort(`[data-cy="deals-table-heading-${params.fieldName}"]`).toEqual('none');
    });
  });

  describe('when params.activeSortByOrder matches params.buttonValue', () => {
    it('should render aria-sort label with params.activeSortByOrder value', () => {
      params = {
        tableName: 'deals',
        fieldName: 'testing',
        buttonText: 'test',
        activeSortByField: 'dealSnapshot.details.ukefDealId',
        activeSortByOrder: 'descending',
        buttonValue: 'dealSnapshot.details.ukefDealId',
      };

      wrapper = render(params);
      wrapper.expectAriaSort(`[data-cy="deals-table-heading-${params.fieldName}"]`).toEqual(params.activeSortByOrder);
    });
  });

  describe('button', () => {
    it('should render text from params', () => {
      params = {
        tableName: 'deals',
        fieldName: 'testing',
        buttonText: 'Test',
      };

      wrapper = render(params);
      wrapper.expectText(`[data-cy="deals-table-heading-${params.fieldName}"]`).toRead(params.buttonText);
    });

    it('should render value attribute from params', () => {
      params = {
        tableName: 'deals',
        fieldName: 'testing',
        buttonValue: 'dealSnapshot.details.ukefDealId',
      };

      wrapper = render(params);
      wrapper.expectInput(`[data-cy="deals-table-heading-${params.fieldName}-button"]`).toHaveValue(params.buttonValue);
    });

    it('should render default name attribute', () => {
      params = {
        tableName: 'deals',
        fieldName: 'testing',
      };

      wrapper = render(params);
      wrapper.expectElement(`[data-cy="deals-table-heading-${params.fieldName}-button"]`).toHaveAttribute('name', 'ascending');
    });

    describe('when fieldHasActiveSortBy and when params.activeSortByOrder equals default `ascending`', () => {
      it('should render `descending` name attribute`', () => {
        params = {
          tableName: 'deals',
          fieldName: 'testing',
          activeSortByField: 'dealSnapshot.details.ukefDealId',
          buttonValue: 'dealSnapshot.details.ukefDealId',
          activeSortByOrder: 'ascending',
        };

        wrapper = render(params);
        wrapper.expectElement(`[data-cy="deals-table-heading-${params.fieldName}-button"]`).toHaveAttribute('name', 'descending');
      });
    });
  });

  describe('button autofocus', () => {
    it('autofocus not set if different column is sorted', () => {
      params = {
        tableName: 'deals',
        fieldName: 'testing',
        activeSortByField: 'dealSnapshot.details.other',
        buttonValue: 'dealSnapshot.details.ukefDealId',
        sortButtonWasClicked: true,
        activeSortByOrder: 'ascending',
      };

      wrapper = render(params);
      wrapper.expectElement(`[data-cy="deals-table-heading-${params.fieldName}-button"]`).toHaveAttribute('autofocus', undefined);
    });

    it('autofocus not set if this column is sorted, but this was not the last action', () => {
      params = {
        tableName: 'deals',
        fieldName: 'testing',
        activeSortByField: 'dealSnapshot.details.ukefDealId',
        buttonValue: 'dealSnapshot.details.ukefDealId',
        sortButtonWasClicked: false,
        activeSortByOrder: 'ascending',
      };

      wrapper = render(params);
      wrapper.expectElement(`[data-cy="deals-table-heading-${params.fieldName}-button"]`).toHaveAttribute('autofocus', undefined);
    });

    it('autofocus not set if this column is sorted, but no activeSortByField is passed', () => {
      params = {
        tableName: 'deals',
        fieldName: 'testing',
        activeSortByField: 'dealSnapshot.details.ukefDealId',
        buttonValue: 'dealSnapshot.details.ukefDealId',
        activeSortByOrder: 'ascending',
      };

      wrapper = render(params);
      wrapper.expectElement(`[data-cy="deals-table-heading-${params.fieldName}-button"]`).toHaveAttribute('autofocus', undefined);
    });

    it('autofocus set if this column is sorted and this was last action', () => {
      params = {
        tableName: 'deals',
        fieldName: 'testing',
        activeSortByField: 'dealSnapshot.details.ukefDealId',
        buttonValue: 'dealSnapshot.details.ukefDealId',
        sortButtonWasClicked: true,
        activeSortByOrder: 'ascending',
      };

      wrapper = render(params);
      wrapper.expectElement(`[data-cy="deals-table-heading-${params.fieldName}-button"]`).toHaveAttribute('autofocus', 'autofocus');
    });
  });
});
