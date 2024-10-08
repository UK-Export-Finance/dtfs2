const difference = require('lodash/difference');
const { FEE_RECORD_STATUS } = require('@ukef/dtfs2-common');
const { componentRenderer } = require('../../componentRenderer');
const { aFeeRecordPaymentGroup, aFeeRecordViewModelItem } = require('../../../test-helpers');

jest.mock('../../../server/api');

const component = '../templates/utilisation-reports/_macros/premium-payments-table.njk';
const tableSelector = '[data-cy="premium-payments-table"]';

const render = componentRenderer(component);

describe(component, () => {
  /**
   * @type {() => import('../../../server/types/view-models').FeeRecordPaymentGroupViewModelItem[]}
   */
  const aFeeRecordPaymentGroupList = () => [
    {
      ...aFeeRecordPaymentGroup(),
      feeRecords: [
        {
          ...aFeeRecordViewModelItem(),
          id: 1,
          facilityId: '12345678',
          exporter: 'Test exporter 1',
        },
        {
          ...aFeeRecordViewModelItem(),
          id: 2,
          facilityId: '87654321',
          exporter: 'Test exporter 2',
        },
      ],
      paymentsReceived: undefined,
      totalPaymentsReceived: {
        formattedCurrencyAndAmount: undefined,
        dataSortValue: 0,
      },
      status: FEE_RECORD_STATUS.TO_DO,
      displayStatus: 'TO DO',
    },
  ];

  const getWrapper = () =>
    render({ userCanEdit: true, reportId: 1, feeRecordPaymentGroups: aFeeRecordPaymentGroupList(), enablePaymentsReceivedSorting: true });

  const numericCellClass = 'govuk-table__cell--numeric';

  it('should render all table headings when userCanEdit is true', () => {
    const wrapper = getWrapper();
    wrapper.expectElement(`${tableSelector} thead th`).toHaveCount(8);
    wrapper.expectElement(`${tableSelector} thead td:contains("")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Facility ID")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Exporter")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Reported fees")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Reported payments")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Total reported payments")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Payments received")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Total payments received")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Status")`).toExist();
  });

  it('should render table headings without the checkbox column when userCanEdit is false', () => {
    const wrapper = render({ userCanEdit: false, feeRecordPaymentGroups: aFeeRecordPaymentGroupList() });

    wrapper.expectElement(`${tableSelector} thead th`).toHaveCount(8);
    wrapper.expectElement(`${tableSelector} thead th:contains("Facility ID")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Exporter")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Reported fees")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Reported payments")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Total reported payments")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Payments received")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Total payments received")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Status")`).toExist();
  });

  it("should use the 'govuk-table__header--numeric' class for numeric columns", () => {
    const wrapper = getWrapper();
    const numericHeaderClass = 'govuk-table__header--numeric';
    wrapper.expectElement(`${tableSelector} thead th:contains("Reported fees")`).hasClass(numericHeaderClass);
    wrapper.expectElement(`${tableSelector} thead th:contains("Reported payments")`).hasClass(numericHeaderClass);
    wrapper.expectElement(`${tableSelector} thead th:contains("Total reported payments")`).hasClass(numericHeaderClass);
    wrapper.expectElement(`${tableSelector} thead th:contains("Payments received")`).hasClass(numericHeaderClass);
    wrapper.expectElement(`${tableSelector} thead th:contains("Total payments received")`).hasClass(numericHeaderClass);
  });

  it.each(['Reported fees', 'Reported payments', 'Payments received'])("should not make the '%s' column header sortable", (tableHeader) => {
    const wrapper = getWrapper();

    wrapper.expectElement(`${tableSelector} thead th:contains("${tableHeader}")`).toHaveAttribute('aria-sort', undefined);
  });

  it("should set the 'Total reported payments' column to sortable with 'aria-sort' set to 'ascending'", () => {
    const wrapper = getWrapper();

    wrapper.expectElement(`${tableSelector} thead th:contains("Total reported payments")`).toHaveAttribute('aria-sort', 'ascending');
  });

  it("should set the 'Status' column to sortable with 'aria-sort' set to 'none'", () => {
    const wrapper = getWrapper();

    wrapper.expectElement(`${tableSelector} thead th:contains("Status")`).toHaveAttribute('aria-sort', 'none');
  });

  it("should set the 'Total payments received' column header to sortable if 'enablePaymentsReceivedSorting' is set to true", () => {
    const wrapper = render({ feeRecordPaymentGroups: aFeeRecordPaymentGroupList(), enablePaymentsReceivedSorting: true });

    wrapper.expectElement(`${tableSelector} thead th:contains("Total payments received")`).toHaveAttribute('aria-sort', 'none');
  });

  it("should not set the total payments received column header to sortable if 'enablePaymentsReceivedSorting' is set to false", () => {
    const wrapper = render({ feeRecordPaymentGroups: aFeeRecordPaymentGroupList(), enablePaymentsReceivedSorting: false });

    wrapper.expectElement(`${tableSelector} thead th:contains("Total payments received")`).toHaveAttribute('aria-sort', undefined);
  });

  it('should render the select all checkbox in the table headings row when userCanEdit is true', () => {
    const wrapper = getWrapper();
    wrapper.expectElement(`${tableSelector} thead td input[type="checkbox"]#select-all-checkbox`).toExist();
  });

  it('should not render the select all checkbox in the table headings row when userCanEdit is false', () => {
    const wrapper = render({ userCanEdit: false });
    wrapper.expectElement(`${tableSelector} thead th input[type="checkbox"]#select-all-checkbox`).notToExist();
  });

  it('should render message informing there are no matched records when no fee record groups', () => {
    const feeRecordPaymentGroups = [];

    const wrapper = render({ feeRecordPaymentGroups });

    wrapper.expectElement('[data-cy="no-matched-facilities-message"]').toExist();
    wrapper.expectText('[data-cy="no-matched-facilities-message"]').toContain('Your search matched no facilities');
    wrapper.expectText('[data-cy="no-matched-facilities-message"]').toContain('There are no results for the facility ID you entered');
  });

  it('should not render message informing there are no matched records when at least one fee record group is returned', () => {
    const feeRecordPaymentGroups = [
      {
        ...aFeeRecordPaymentGroup(),
        feeRecords: [aFeeRecordViewModelItem()],
      },
    ];

    const wrapper = render({ feeRecordPaymentGroups });

    wrapper.expectElement('[data-cy="no-matched-facilities-message"]').notToExist();
    wrapper.expectText('html').notToContain('Your search matched no facilities');
    wrapper.expectText('html').notToContain('There are no results for the facility ID you entered');
  });

  it('should render a row for each fee record defined in each fee record payment group', () => {
    const feeRecordIds = [1, 2, 3];
    const feeRecordItems = feeRecordIds.map((id) => ({ ...aFeeRecordViewModelItem(), id }));
    const feeRecordPaymentGroups = [
      {
        ...aFeeRecordPaymentGroup(),
        feeRecords: [feeRecordItems[0], feeRecordItems[1]],
      },
      {
        ...aFeeRecordPaymentGroup(),
        feeRecords: [feeRecordItems[2]],
      },
    ];

    const wrapper = render({ feeRecordPaymentGroups });

    wrapper.expectElement(`tr`).toHaveCount(feeRecordIds.length + 1); // including table header
    feeRecordIds.forEach((id) => {
      const rowSelector = `[data-cy="premium-payments-table-row--feeRecordId-${id}"]`;
      wrapper.expectElement(rowSelector).toExist();
    });
  });

  it('should render the fee record facility id in the table row with the matching fee record id', () => {
    const feeRecordId = 1;
    const facilityId = '31459265';
    const feeRecordItem = { ...aFeeRecordViewModelItem(), id: feeRecordId, facilityId };
    const feeRecordPaymentGroups = [
      {
        ...aFeeRecordPaymentGroup(),
        feeRecords: [feeRecordItem],
      },
    ];

    const wrapper = render({ feeRecordPaymentGroups });

    const rowSelector = `[data-cy="premium-payments-table-row--feeRecordId-${feeRecordId}"]`;
    wrapper.expectElement(`${rowSelector} th:contains("${facilityId}")`).toExist();
  });

  it('should render the fee record exporter in the table row with the matching fee record id', () => {
    const feeRecordId = 1;
    const exporter = 'Some exporter';
    const feeRecordItem = { ...aFeeRecordViewModelItem(), id: feeRecordId, exporter };
    const feeRecordPaymentGroups = [
      {
        ...aFeeRecordPaymentGroup(),
        feeRecords: [feeRecordItem],
      },
    ];

    const wrapper = render({ feeRecordPaymentGroups });

    const rowSelector = `[data-cy="premium-payments-table-row--feeRecordId-${feeRecordId}"]`;
    wrapper.expectElement(`${rowSelector} td:contains("${exporter}")`).toExist();
  });

  it('should render the fee record reported fees in the table row with the matching fee record id with the numeric cell class', () => {
    const feeRecordId = 1;
    const reportedFees = 'EUR 12345.67';
    const feeRecordItem = { ...aFeeRecordViewModelItem(), id: feeRecordId, reportedFees };
    const feeRecordPaymentGroups = [
      {
        ...aFeeRecordPaymentGroup(),
        feeRecords: [feeRecordItem],
      },
    ];

    const wrapper = render({ feeRecordPaymentGroups });

    const rowSelector = `[data-cy="premium-payments-table-row--feeRecordId-${feeRecordId}"]`;
    wrapper.expectElement(`${rowSelector} td:contains("${reportedFees}")`).toExist();
    wrapper.expectElement(`${rowSelector} td:contains("${reportedFees}")`).hasClass(numericCellClass);
  });

  it('should render the fee record reported payments in the table row with the matching fee record id with the numeric cell class', () => {
    const feeRecordId = 1;
    const reportedPayments = 'GBP 76543.21';
    const feeRecordItem = { ...aFeeRecordViewModelItem(), id: feeRecordId, reportedPayments };
    const feeRecordPaymentGroups = [
      {
        ...aFeeRecordPaymentGroup(),
        feeRecords: [feeRecordItem],
      },
    ];

    const wrapper = render({ feeRecordPaymentGroups });

    const rowSelector = `[data-cy="premium-payments-table-row--feeRecordId-${feeRecordId}"]`;
    wrapper.expectElement(`${rowSelector} td:contains("${reportedPayments}")`).toExist();
    wrapper.expectElement(`${rowSelector} td:contains("${reportedPayments}")`).hasClass(numericCellClass);
  });

  it('should only render the total reported payments in the first row of the fee record payment group with the numeric cell class and the data sort value', () => {
    const feeRecordIds = [1, 2, 3];
    const feeRecordItems = feeRecordIds.map((id) => ({ ...aFeeRecordViewModelItem(), id }));

    const totalReportedPayments = {
      formattedCurrencyAndAmount: 'EUR 123.45',
      dataSortValue: 0,
    };
    const feeRecordPaymentGroups = [
      {
        ...aFeeRecordPaymentGroup(),
        feeRecords: feeRecordItems,
        totalReportedPayments,
      },
    ];

    const wrapper = render({ feeRecordPaymentGroups });

    const [firstRowId, ...otherIds] = feeRecordIds;

    const firstRowSelector = `[data-cy="premium-payments-table-row--feeRecordId-${firstRowId}"]`;
    wrapper.expectElement(`${firstRowSelector} td:contains("${totalReportedPayments.formattedCurrencyAndAmount}")`).toExist();
    wrapper.expectElement(`${firstRowSelector} td:contains("${totalReportedPayments.formattedCurrencyAndAmount}")`).hasClass(numericCellClass);
    wrapper
      .expectElement(`${firstRowSelector} td:contains("${totalReportedPayments.formattedCurrencyAndAmount}")`)
      .toHaveAttribute('data-sort-value', totalReportedPayments.dataSortValue.toString());

    otherIds.forEach((id) => {
      const rowSelector = `[data-cy="premium-payments-table-row--feeRecordId-${id}"]`;
      wrapper.expectElement(`${rowSelector}`).toExist();
      wrapper.expectElement(`${rowSelector} td:contains("${totalReportedPayments.formattedCurrencyAndAmount}")`).notToExist();
    });
  });

  it('should only render the payments received list in the first row of the fee record payment group with the numeric cell class', () => {
    const feeRecordIds = [1, 2, 3];
    const feeRecordItems = feeRecordIds.map((id) => ({ ...aFeeRecordViewModelItem(), id }));

    const paymentsReceived = ['GBP 100.00'];
    const feeRecordPaymentGroups = [
      {
        ...aFeeRecordPaymentGroup(),
        feeRecords: feeRecordItems,
        paymentsReceived,
      },
    ];

    const wrapper = render({ feeRecordPaymentGroups });

    const [firstRowId, ...otherIds] = feeRecordIds;

    const firstRowSelector = `[data-cy="premium-payments-table-row--feeRecordId-${firstRowId}"]`;
    wrapper.expectElement(`${firstRowSelector} td:has(ul.payments-list)`).toExist();
    wrapper.expectElement(`${firstRowSelector} td:has(ul.payments-list)`).hasClass(numericCellClass);
    wrapper.expectElement(`${firstRowSelector} td > ul.payments-list > li`).toHaveCount(paymentsReceived.length);

    otherIds.forEach((id) => {
      const rowSelector = `[data-cy="premium-payments-table-row--feeRecordId-${id}"]`;
      wrapper.expectElement(`${rowSelector}`).toExist();
      wrapper.expectElement(`${rowSelector} td:has(ul.payments-list)`).notToExist();
    });
  });

  it('should render a list item for each item in the group payments received list', () => {
    const feeRecordId = 1;
    const feeRecordItems = [{ ...aFeeRecordViewModelItem(), id: feeRecordId }];

    const paymentsReceived = ['GBP 100.00', 'GBP 200.00', 'GBP 300.00'];
    const feeRecordPaymentGroups = [
      {
        ...aFeeRecordPaymentGroup(),
        feeRecords: feeRecordItems,
        paymentsReceived,
      },
    ];

    const wrapper = render({ feeRecordPaymentGroups });

    const rowSelector = `[data-cy="premium-payments-table-row--feeRecordId-${feeRecordId}"]`;
    wrapper.expectElement(`${rowSelector} td > ul.payments-list > li`).toHaveCount(paymentsReceived.length);
  });

  const FEE_RECORD_STATUSES_WHERE_PAYMENTS_RECEIVED_SHOULD_BE_LINKS = [FEE_RECORD_STATUS.MATCH, FEE_RECORD_STATUS.DOES_NOT_MATCH];

  it.each(FEE_RECORD_STATUSES_WHERE_PAYMENTS_RECEIVED_SHOULD_BE_LINKS)(
    "should render the payments received as links to the edit payment page when userCanEdit is true and the fee record status is '%s'",
    (status) => {
      const feeRecordId = 1;
      const feeRecordItems = [{ ...aFeeRecordViewModelItem(), id: feeRecordId }];

      const paymentsReceived = [
        { id: 1, formattedCurrencyAndAmount: 'GBP 100.00' },
        { id: 2, formattedCurrencyAndAmount: 'GBP 200.00' },
      ];

      const feeRecordPaymentGroups = [
        {
          ...aFeeRecordPaymentGroup(),
          feeRecords: feeRecordItems,
          status,
          paymentsReceived,
        },
      ];

      const reportId = 12;

      const wrapper = render({ userCanEdit: true, reportId, feeRecordPaymentGroups });

      const rowSelector = `[data-cy="premium-payments-table-row--feeRecordId-${feeRecordId}"]`;
      paymentsReceived.forEach((payment) => {
        wrapper
          .expectLink(`${rowSelector} td a:contains(${payment.formattedCurrencyAndAmount})`)
          .toLinkTo(`/utilisation-reports/${reportId}/edit-payment/${payment.id}`, payment.formattedCurrencyAndAmount);
      });
    },
  );

  it.each(difference(Object.values(FEE_RECORD_STATUS), FEE_RECORD_STATUSES_WHERE_PAYMENTS_RECEIVED_SHOULD_BE_LINKS))(
    "should render the payments received as plain text when userCanEdit is true and the status is '%s'",
    (status) => {
      const feeRecordId = 1;
      const feeRecordItems = [{ ...aFeeRecordViewModelItem(), id: feeRecordId }];

      const paymentsReceived = [
        { formattedCurrencyAndAmount: 'GBP 100.00', id: 1 },
        { formattedCurrencyAndAmount: 'GBP 200.00', id: 2 },
      ];

      const feeRecordPaymentGroups = [
        {
          ...aFeeRecordPaymentGroup(),
          feeRecords: feeRecordItems,
          status,
          paymentsReceived,
        },
      ];

      const wrapper = render({ feeRecordPaymentGroups });

      const rowSelector = `[data-cy="premium-payments-table-row--feeRecordId-${feeRecordId}"]`;
      paymentsReceived.forEach((payment) => {
        wrapper.expectElement(`${rowSelector} td li:contains(${payment.formattedCurrencyAndAmount})`).toExist();
        wrapper.expectElement(`${rowSelector} td a:contains(${payment.formattedCurrencyAndAmount})`).notToExist();
      });
    },
  );

  it.each(Object.values(FEE_RECORD_STATUS))(
    "should render all payments received as plain text when userCanEdit is false, regardless of fee record status '%s'",
    (status) => {
      const feeRecordId = 1;
      const feeRecordItems = [{ ...aFeeRecordViewModelItem(), id: feeRecordId }];

      const paymentsReceived = [
        { formattedCurrencyAndAmount: 'GBP 100.00', id: 1 },
        { formattedCurrencyAndAmount: 'GBP 200.00', id: 2 },
      ];

      const feeRecordPaymentGroups = [
        {
          ...aFeeRecordPaymentGroup(),
          feeRecords: feeRecordItems,
          status,
          paymentsReceived,
        },
      ];

      const reportId = 12;

      const wrapper = render({ userCanEdit: false, reportId, feeRecordPaymentGroups });

      const rowSelector = `[data-cy="premium-payments-table-row--feeRecordId-${feeRecordId}"]`;
      paymentsReceived.forEach((payment) => {
        wrapper.expectElement(`${rowSelector} td li:contains(${payment.formattedCurrencyAndAmount})`).toExist();
        wrapper.expectElement(`${rowSelector} td a:contains(${payment.formattedCurrencyAndAmount})`).notToExist();
      });
    },
  );

  it('should not render the payments received list when the group payments received is undefined', () => {
    const feeRecordId = 1;
    const feeRecordItems = [{ ...aFeeRecordViewModelItem(), id: feeRecordId }];

    const paymentsReceived = undefined;
    const feeRecordPaymentGroups = [
      {
        ...aFeeRecordPaymentGroup(),
        feeRecords: feeRecordItems,
        paymentsReceived,
      },
    ];

    const wrapper = render({ feeRecordPaymentGroups });

    const rowSelector = `[data-cy="premium-payments-table-row--feeRecordId-${feeRecordId}"]`;
    wrapper.expectElement(`${rowSelector} td:has(ul.payments-list)`).notToExist();
  });

  it('should only render the total payments received in the first row of the fee record payment group with the numeric cell class and the data sort value', () => {
    const feeRecordIds = [1, 2, 3];
    const feeRecordItems = feeRecordIds.map((id) => ({ ...aFeeRecordViewModelItem(), id }));

    const totalPaymentsReceived = {
      formattedCurrencyAndAmount: 'EUR 123.45',
      dataSortValue: 0,
    };
    const feeRecordPaymentGroups = [
      {
        ...aFeeRecordPaymentGroup(),
        feeRecords: feeRecordItems,
        totalPaymentsReceived,
      },
    ];

    const wrapper = render({ feeRecordPaymentGroups });

    const [firstRowId, ...otherIds] = feeRecordIds;

    const firstRowSelector = `[data-cy="premium-payments-table-row--feeRecordId-${firstRowId}"]`;
    wrapper.expectElement(`${firstRowSelector} td:contains("${totalPaymentsReceived.formattedCurrencyAndAmount}")`).toExist();
    wrapper.expectElement(`${firstRowSelector} td:contains("${totalPaymentsReceived.formattedCurrencyAndAmount}")`).hasClass(numericCellClass);
    wrapper
      .expectElement(`${firstRowSelector} td:contains("${totalPaymentsReceived.formattedCurrencyAndAmount}")`)
      .toHaveAttribute('data-sort-value', totalPaymentsReceived.dataSortValue.toString());

    otherIds.forEach((id) => {
      const rowSelector = `[data-cy="premium-payments-table-row--feeRecordId-${id}"]`;
      wrapper.expectElement(`${rowSelector}`).toExist();
      wrapper.expectElement(`${rowSelector} td:contains("${totalPaymentsReceived.formattedCurrencyAndAmount}")`).notToExist();
    });
  });

  const FEE_RECORD_STATUSES_WHERE_CHECKBOX_SHOULD_EXIST = [FEE_RECORD_STATUS.TO_DO, FEE_RECORD_STATUS.DOES_NOT_MATCH];

  it.each(FEE_RECORD_STATUSES_WHERE_CHECKBOX_SHOULD_EXIST)(
    'should render the checkbox when userCanEdit is true and the fee record status is %s',
    (feeRecordStatus) => {
      const checkboxId = 'some-checkbox-id';
      const feeRecordPaymentGroups = [
        {
          ...aFeeRecordPaymentGroup(),
          status: feeRecordStatus,
          checkboxId,
        },
      ];
      const wrapper = render({ userCanEdit: true, feeRecordPaymentGroups });

      wrapper.expectElement(`input#${checkboxId}[type="checkbox"]`).toExist();
    },
  );

  it.each(difference(Object.values(FEE_RECORD_STATUS), FEE_RECORD_STATUSES_WHERE_CHECKBOX_SHOULD_EXIST))(
    'should not render the checkbox when userCanEdit is true and the fee record status is %s',
    (feeRecordStatus) => {
      const checkboxId = 'some-checkbox-id';
      const feeRecordPaymentGroups = [
        {
          ...aFeeRecordPaymentGroup(),
          status: feeRecordStatus,
          checkboxId,
        },
      ];
      const wrapper = render({ userCanEdit: true, feeRecordPaymentGroups });

      wrapper.expectElement(`input#${checkboxId}[type="checkbox"]`).notToExist();
    },
  );

  it('should not render any checkboxes when userCanEdit is false', () => {
    const feeRecordPaymentGroups = Object.values(FEE_RECORD_STATUS).map((status) => ({
      ...aFeeRecordPaymentGroup(),
      status,
      checkboxId: `checkbox-${status}`,
    }));
    const wrapper = render({ userCanEdit: false, feeRecordPaymentGroups });

    feeRecordPaymentGroups.forEach((group) => {
      wrapper.expectElement(`input#${group.checkboxId}[type="checkbox"]`).notToExist();
    });
  });

  it('should render a checkbox with the checkbox id specified in the group only in the first row of the group', () => {
    const feeRecordIds = [1, 2, 3];
    const feeRecordItems = feeRecordIds.map((id) => ({ ...aFeeRecordViewModelItem(), id }));

    const checkboxId = 'some-checkbox-id';
    const feeRecordPaymentGroups = [
      {
        ...aFeeRecordPaymentGroup(),
        feeRecords: feeRecordItems,
        checkboxId,
      },
    ];

    const wrapper = render({ userCanEdit: true, feeRecordPaymentGroups });

    const [firstRowId, ...otherIds] = feeRecordIds;

    const firstRowSelector = `[data-cy="premium-payments-table-row--feeRecordId-${firstRowId}"]`;
    wrapper.expectElement(`${firstRowSelector} td input#${checkboxId}[type="checkbox"]`).toExist();

    otherIds.forEach((id) => {
      const rowSelector = `[data-cy="premium-payments-table-row--feeRecordId-${id}"]`;
      wrapper.expectElement(`${rowSelector}`).toExist();
      wrapper.expectElement(`${rowSelector} td input#${checkboxId}[type="checkbox"]`).notToExist();
    });
  });

  it("should render a checked checkbox id when the 'isChecked' property is set to true", () => {
    const checkboxId = 'some-checkbox-id';
    const feeRecordPaymentGroups = [
      {
        ...aFeeRecordPaymentGroup(),
        status: FEE_RECORD_STATUS.TO_DO,
        checkboxId,
        isChecked: true,
      },
    ];
    const wrapper = render({ userCanEdit: true, feeRecordPaymentGroups });

    const checkboxElement = wrapper.expectElement(`input#${checkboxId}[type="checkbox"]`);

    checkboxElement.toExist();
    checkboxElement.toHaveAttribute('checked', 'checked');
  });

  it("should render an unchecked checkbox id when the 'isChecked' property is set to false", () => {
    const checkboxId = 'some-checkbox-id';
    const feeRecordPaymentGroups = [
      {
        ...aFeeRecordPaymentGroup(),
        status: FEE_RECORD_STATUS.TO_DO,
        checkboxId,
        isChecked: false,
      },
    ];
    const wrapper = render({ userCanEdit: true, feeRecordPaymentGroups });

    const checkboxElement = wrapper.expectElement(`input#${checkboxId}[type="checkbox"]`);

    checkboxElement.toExist();
    checkboxElement.toHaveAttribute('checked', undefined);
  });

  it('should set aria-labels for checkboxes', () => {
    const checkboxId = 'some-checkbox-id';
    const feeRecordPaymentGroups = [
      {
        ...aFeeRecordPaymentGroup(),
        status: FEE_RECORD_STATUS.TO_DO,
        checkboxAriaLabel: 'select me!',
        checkboxId,
      },
    ];
    const wrapper = render({ userCanEdit: true, feeRecordPaymentGroups });

    wrapper.expectElement(`input#${checkboxId}[type="checkbox"]`).toHaveAttribute('aria-label', 'select me!');
  });
});
