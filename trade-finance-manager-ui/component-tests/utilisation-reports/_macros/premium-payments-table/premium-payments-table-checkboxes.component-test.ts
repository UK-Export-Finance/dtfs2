import { FEE_RECORD_STATUS } from '@ukef/dtfs2-common';
import { componentRenderer } from '../../../componentRenderer';
import { aPremiumPaymentsViewModelItem, aFeeRecordViewModelItem } from '../../../../test-helpers';
import { PremiumPaymentsViewModelItem } from '../../../../server/types/view-models';
import { PremiumPaymentsTableCheckboxId } from '../../../../server/types/premium-payments-table-checkbox-id';
import { aPremiumPaymentsTableDefaultRendererParams, PremiumPaymentsTableComponentRendererParams } from './helpers';

const component = '../templates/utilisation-reports/_macros/premium-payments-table.njk';

const render = componentRenderer<PremiumPaymentsTableComponentRendererParams>(component);

describe(component, () => {
  it('should render the checkbox when userCanEdit and hasSelectableRows are true, and the fee record status is selectable', () => {
    const checkboxId: PremiumPaymentsTableCheckboxId = `feeRecordIds-1-reportedPaymentsCurrency-GBP-status-TO_DO`;
    const feeRecordPaymentGroups: PremiumPaymentsViewModelItem[] = [
      {
        ...aPremiumPaymentsViewModelItem(),
        isSelectable: true,
        checkboxId,
      },
    ];

    const wrapper = render({
      ...aPremiumPaymentsTableDefaultRendererParams(),
      userCanEdit: true,
      hasSelectableRows: true,
      feeRecordPaymentGroups,
    });

    wrapper.expectElement(`input#${checkboxId}[type="checkbox"]`).toExist();
  });

  it('should not render the checkbox when userCanEdit and hasSelectableRows are true, and the fee record is not selectable', () => {
    const checkboxId = 'feeRecordIds-1,2,3-reportedPaymentsCurrency-GBP-status-TO_DO';
    const feeRecordPaymentGroups: PremiumPaymentsViewModelItem[] = [
      {
        ...aPremiumPaymentsViewModelItem(),
        isSelectable: false,
        checkboxId,
      },
    ];

    const wrapper = render({
      ...aPremiumPaymentsTableDefaultRendererParams(),
      userCanEdit: true,
      hasSelectableRows: true,
      feeRecordPaymentGroups,
    });

    wrapper.expectElement(`input#${checkboxId}[type="checkbox"]`).notToExist();
  });

  it('should not render any checkboxes when userCanEdit is false', () => {
    const feeRecordPaymentGroups: PremiumPaymentsViewModelItem[] = Object.values(FEE_RECORD_STATUS).map((status) => ({
      ...aPremiumPaymentsViewModelItem(),
      status,
      checkboxId: `feeRecordIds-1,2,3-reportedPaymentsCurrency-GBP-status-${status}`,
    }));
    const wrapper = render({
      ...aPremiumPaymentsTableDefaultRendererParams(),
      userCanEdit: false,
      hasSelectableRows: true,
      feeRecordPaymentGroups,
    });

    feeRecordPaymentGroups.forEach((group) => {
      wrapper.expectElement(`input#${group.checkboxId}[type="checkbox"]`).notToExist();
    });
  });

  it('should not render any checkboxes when hasSelectableRows is false', () => {
    const feeRecordPaymentGroups: PremiumPaymentsViewModelItem[] = Object.values(FEE_RECORD_STATUS).map((status) => ({
      ...aPremiumPaymentsViewModelItem(),
      status,
      checkboxId: `feeRecordIds-1,2,3-reportedPaymentsCurrency-GBP-status-${status}`,
    }));
    const wrapper = render({
      ...aPremiumPaymentsTableDefaultRendererParams(),
      userCanEdit: true,
      hasSelectableRows: false,
      feeRecordPaymentGroups,
    });

    feeRecordPaymentGroups.forEach((group) => {
      wrapper.expectElement(`input#${group.checkboxId}[type="checkbox"]`).notToExist();
    });
  });

  it('should render a checkbox with the checkbox id specified in the group only in the first row of the group', () => {
    const feeRecordIds = [1, 2, 3];
    const feeRecordItems = feeRecordIds.map((id) => ({ ...aFeeRecordViewModelItem(), id }));

    const checkboxId: PremiumPaymentsTableCheckboxId = 'feeRecordIds-1,2,3-reportedPaymentsCurrency-GBP-status-TO_DO';
    const feeRecordPaymentGroups: PremiumPaymentsViewModelItem[] = [
      {
        ...aPremiumPaymentsViewModelItem(),
        feeRecords: feeRecordItems,
        checkboxId,
      },
    ];

    const wrapper = render({ ...aPremiumPaymentsTableDefaultRendererParams(), userCanEdit: true, feeRecordPaymentGroups });

    const [firstRowId, ...otherIds] = feeRecordIds;

    const firstRowSelector = `[data-cy*="premium-payments-table-row--feeRecordId-${firstRowId}"]`;
    wrapper.expectElement(`${firstRowSelector} td input[id="${checkboxId}"][type="checkbox"]`).toExist();

    otherIds.forEach((id) => {
      const rowSelector = `[data-cy*="premium-payments-table-row--feeRecordId-${id}"]`;
      wrapper.expectElement(`${rowSelector}`).toExist();
      wrapper.expectElement(`${rowSelector} td input[id="${checkboxId}"][type="checkbox"]`).notToExist();
    });
  });

  it("should render a checked checkbox id when the 'isChecked' property is set to true", () => {
    const checkboxId = 'feeRecordIds-1,2,3-reportedPaymentsCurrency-GBP-status-TO_DO';
    const feeRecordPaymentGroups: PremiumPaymentsViewModelItem[] = [
      {
        ...aPremiumPaymentsViewModelItem(),
        status: FEE_RECORD_STATUS.TO_DO,
        checkboxId,
        isChecked: true,
      },
    ];
    const wrapper = render({ ...aPremiumPaymentsTableDefaultRendererParams(), userCanEdit: true, feeRecordPaymentGroups });

    const checkboxElement = wrapper.expectElement(`input[id="${checkboxId}"][type="checkbox"]`);

    checkboxElement.toExist();
    checkboxElement.toHaveAttribute('checked', 'checked');
  });

  it("should render an unchecked checkbox id when the 'isChecked' property is set to false", () => {
    const checkboxId = 'feeRecordIds-1,2,3-reportedPaymentsCurrency-GBP-status-TO_DO';
    const feeRecordPaymentGroups: PremiumPaymentsViewModelItem[] = [
      {
        ...aPremiumPaymentsViewModelItem(),
        status: FEE_RECORD_STATUS.TO_DO,
        checkboxId,
        isChecked: false,
      },
    ];
    const wrapper = render({ ...aPremiumPaymentsTableDefaultRendererParams(), userCanEdit: true, feeRecordPaymentGroups });

    const checkboxElement = wrapper.expectElement(`input[id="${checkboxId}"][type="checkbox"]`);

    checkboxElement.toExist();
    checkboxElement.notToHaveAttribute('checked');
  });

  it('should set aria-labels for checkboxes', () => {
    const checkboxId = 'feeRecordIds-1,2,3-reportedPaymentsCurrency-GBP-status-TO_DO';
    const feeRecordPaymentGroups: PremiumPaymentsViewModelItem[] = [
      {
        ...aPremiumPaymentsViewModelItem(),
        status: FEE_RECORD_STATUS.TO_DO,
        checkboxAriaLabel: 'select me!',
        checkboxId,
      },
    ];
    const wrapper = render({ ...aPremiumPaymentsTableDefaultRendererParams(), userCanEdit: true, feeRecordPaymentGroups });

    wrapper.expectElement(`input[id="${checkboxId}"][type="checkbox"]`).toHaveAttribute('aria-label', 'select me!');
  });
});
