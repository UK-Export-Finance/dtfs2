import { RECORD_CORRECTION_REQUEST_REASON } from '@ukef/dtfs2-common';
import { aCreateRecordCorrectionRequestViewModel } from '../../../test-helpers/test-data/view-models';
import { pageRenderer } from '../../pageRenderer';
import { CreateRecordCorrectionRequestErrorsViewModel, CreateRecordCorrectionRequestViewModel } from '../../../server/types/view-models';

const page = '../templates/utilisation-reports/record-corrections/create-record-correction-request.njk';
const render = pageRenderer(page);

describe(page, () => {
  it('should render the main heading', () => {
    // Arrange
    const viewModel = aCreateRecordCorrectionRequestViewModel();
    viewModel.bank.name = 'My bank';
    viewModel.formattedReportPeriod = 'January 2024';

    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectText('h1[data-cy="main-heading"]').toRead('Record correction request');
    wrapper.expectText('span[data-cy="heading-caption"]').toRead('My bank, January 2024');
  });

  it('should render the fee record summary block header with the provided fee record details', () => {
    // Arrange
    const feeRecord = {
      facilityId: '0012345678',
      exporter: 'Sample Company Ltd',
    };

    const viewModel = aCreateRecordCorrectionRequestViewModel();
    viewModel.user.firstName = 'Jay';
    viewModel.user.lastName = 'Doe';
    viewModel.feeRecord = feeRecord;

    // Act
    const wrapper = render(viewModel);

    // Assert
    const feeRecordSummarySelector = '[data-cy="fee-record-summary-block-header"]';
    wrapper.expectText(`${feeRecordSummarySelector} [data-cy="facility-id"]`).toRead(feeRecord.facilityId);
    wrapper.expectText(`${feeRecordSummarySelector} [data-cy="exporter"]`).toRead(feeRecord.exporter);
    wrapper.expectText(`${feeRecordSummarySelector} [data-cy="requested-by"]`).toRead('Jay Doe');
  });

  describe('when there are errors', () => {
    it('should add error prefix to page title', () => {
      // Arrange
      const viewModel = aCreateRecordCorrectionRequestViewModel();
      viewModel.errors.errorSummary = [{ text: 'an error', href: 'error-href' }];

      // Act
      const wrapper = render(viewModel);

      // Assert
      wrapper.expectPageTitle().toRead('Error - Create record correction request');
    });

    it('should render error summary', () => {
      // Arrange
      const errorSummaryText = 'error summary text';

      const errors: CreateRecordCorrectionRequestErrorsViewModel = {
        errorSummary: [{ text: errorSummaryText, href: '#some-error' }],
      };

      const viewModel: CreateRecordCorrectionRequestViewModel = aCreateRecordCorrectionRequestViewModel();
      viewModel.errors = errors;

      // Act
      const wrapper = render(viewModel);

      // Assert
      wrapper.expectElement('[data-cy="error-summary"]').toExist();
      wrapper.expectText('[data-cy="error-summary"]').toContain(errorSummaryText);
    });
  });

  describe('when there are no errors', () => {
    it('should not add error prefix to page title ', () => {
      // Arrange
      const viewModel = aCreateRecordCorrectionRequestViewModel();
      viewModel.errors.errorSummary = [];

      // Act
      const wrapper = render(viewModel);

      // Assert
      wrapper.expectPageTitle().toRead('Create record correction request');
    });

    it('should not render error summary', () => {
      // Arrange
      const viewModel = aCreateRecordCorrectionRequestViewModel();
      viewModel.errors.errorSummary = [];

      // Act
      const wrapper = render(viewModel);

      // Assert
      wrapper.expectElement('[data-cy="error-summary"]').notToExist();
    });
  });

  describe('when the reasons field', () => {
    describe('has an error', () => {
      it('should display an inline error message', () => {
        // Arrange
        const errorMessage = 'Select reason(s)';

        const viewModel = aCreateRecordCorrectionRequestViewModel();
        viewModel.errors.reasonsErrorMessage = errorMessage;

        // Act
        const wrapper = render(viewModel);

        // Assert
        wrapper.expectText('[data-cy="reasons-error"]').toContain(errorMessage);
      });
    });

    describe('has no pre-existing values', () => {
      it('should not check any reason checkboxes', () => {
        // Arrange
        const allValidReasons = Object.values(RECORD_CORRECTION_REQUEST_REASON);

        const viewModel = aCreateRecordCorrectionRequestViewModel();
        viewModel.formValues.reasons = undefined;

        // Act
        const wrapper = render(viewModel);

        // Assert
        allValidReasons.forEach((reasonId) => {
          wrapper.expectInput(`input[data-cy="reason-${reasonId}"]`).notToBeChecked();
        });
      });
    });

    describe('has pre-existing checked values', () => {
      it.each(Object.values(RECORD_CORRECTION_REQUEST_REASON))('should check the "%s" reason checkbox when it is in the form values', (reason) => {
        // Arrange
        const viewModel = aCreateRecordCorrectionRequestViewModel();
        viewModel.formValues.reasons = [reason];

        // Act
        const wrapper = render(viewModel);

        // Assert
        wrapper.expectInput(`input[data-cy="reason-${reason}"]`).toBeChecked();
      });
    });
  });

  describe('when the additional info field', () => {
    describe('has an error', () => {
      it('should display an inline error message', () => {
        // Arrange
        const errorMessage = 'Enter additional info';

        const viewModel = aCreateRecordCorrectionRequestViewModel();
        viewModel.errors.additionalInfoErrorMessage = errorMessage;

        // Act
        const wrapper = render(viewModel);

        // Assert
        wrapper.expectText('[data-cy="additional-info-error"]').toContain(errorMessage);
      });
    });

    describe('has no pre-existing value', () => {
      it('should not initialise the field', () => {
        // Arrange
        const viewModel = aCreateRecordCorrectionRequestViewModel();
        viewModel.formValues.additionalInfo = undefined;

        // Act
        const wrapper = render(viewModel);

        // Assert
        wrapper.expectTextArea('[data-cy="additional-info"]').toHaveValue('');
      });
    });

    describe('has a pre-existing value', () => {
      it('should initialise the field to the provided value', () => {
        // Arrange
        const fieldValue = 'Some additional info';

        const viewModel = aCreateRecordCorrectionRequestViewModel();
        viewModel.formValues.additionalInfo = fieldValue;

        // Act
        const wrapper = render(viewModel);

        // Assert
        wrapper.expectTextArea('[data-cy="additional-info"]').toHaveValue(fieldValue);
      });
    });
  });

  it('should render the continue button', () => {
    // Arrange
    const viewModel = aCreateRecordCorrectionRequestViewModel();

    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectElement('[data-cy="continue-button"]').toExist();
    wrapper.expectText('[data-cy="continue-button"]').toRead('Continue');
  });

  it('should render the main reasons hint', () => {
    // Arrange
    const viewModel = aCreateRecordCorrectionRequestViewModel();

    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectText('[data-cy="reasons-hint"]').toRead('Select all that apply');
  });

  it.each`
    reasonId                         | hint
    ${'facility-id-incorrect'}       | ${'Does not match what is in the system'}
    ${'reported-fee-incorrect'}      | ${'The fee is higher or lower than expected'}
    ${'reported-currency-incorrect'} | ${'The currency does not match the currency we have on record'}
    ${'other'}                       | ${'Something else'}
  `('should render the "$reasonId" reason hint', ({ reasonId, hint }: { reasonId: string; hint: string }) => {
    // Arrange
    const viewModel = aCreateRecordCorrectionRequestViewModel();

    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectText(`[data-cy="reason-${reasonId}-hint"]`).toRead(hint);
  });

  it('should render the additional info hint', () => {
    // Arrange
    const viewModel = aCreateRecordCorrectionRequestViewModel();

    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectText('[data-cy="additional-info-hint"]').toRead('For example, is the reported fee higher or lower than expected');
  });
});
