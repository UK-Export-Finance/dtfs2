import { RECORD_CORRECTION_REASON, CURRENCY, mapCurrenciesToRadioItems } from '@ukef/dtfs2-common';
import { difference } from 'lodash';
import pageRenderer from '../../pageRenderer';
import { aProvideUtilisationReportCorrectionViewModel } from '../../../test-helpers/test-data/view-models/record-corrections/provide-utilisation-report-correction-view-model';

const page = 'utilisation-report-service/record-correction/provide-utilisation-report-correction.njk';
const render = pageRenderer(page);

describe(page, () => {
  it('should add error prefix to page title when there are errors', () => {
    const viewModel = aProvideUtilisationReportCorrectionViewModel();
    viewModel.errors = {
      errorSummary: [{ text: 'an error', href: 'error-href' }],
    };

    const wrapper = render(viewModel);

    wrapper.expectPageTitle().toRead('Error - Record correction');
  });

  it('should not add error prefix to page title when there are no errors', () => {
    const viewModel = aProvideUtilisationReportCorrectionViewModel();
    viewModel.errors = {
      errorSummary: [],
    };

    const wrapper = render(viewModel);

    wrapper.expectPageTitle().toRead('Record correction');
  });

  it('should render the current record details table', () => {
    // Arrange
    const viewModel = aProvideUtilisationReportCorrectionViewModel();

    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectElement('[data-cy="correction-request-details-table"]').toExist();
  });

  const correctionReasonsExcludingOther = difference(Object.values(RECORD_CORRECTION_REASON), [RECORD_CORRECTION_REASON.OTHER]);

  describe.each(correctionReasonsExcludingOther)('when "%s" is the sole correction reason', (correctionReason) => {
    it(`should only render the "${correctionReason}" error type input`, () => {
      // Arrange
      const requestReasons = [correctionReason];

      const viewModel = aProvideUtilisationReportCorrectionViewModel();
      viewModel.correctionRequestDetails.reasons = requestReasons;

      const unusedCorrectionReasons = difference(correctionReasonsExcludingOther, [...requestReasons]);

      // Act
      const wrapper = render(viewModel);

      // Assert
      wrapper.expectElement(`[data-cy="${correctionReason}-input"]`).toExist();

      unusedCorrectionReasons.forEach((remainingRequestReason) => {
        wrapper.expectElement(`[data-cy="${remainingRequestReason}-input"]`).notToExist();
      });
    });

    it('should render the "additional comments" input', () => {
      // Arrange
      const viewModel = aProvideUtilisationReportCorrectionViewModel();
      viewModel.correctionRequestDetails.reasons = [RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT];

      // Act
      const wrapper = render(viewModel);

      // Assert
      wrapper.expectElement(`textarea[data-cy="additional-comments-input"]`).toExist();
    });
  });

  describe(`when "${RECORD_CORRECTION_REASON.OTHER}" is the sole correction reason`, () => {
    const requestReasons = [RECORD_CORRECTION_REASON.OTHER];

    it('should only render the "additional comments" input', () => {
      // Arrange
      const viewModel = aProvideUtilisationReportCorrectionViewModel();
      viewModel.correctionRequestDetails.reasons = requestReasons;

      // Act
      const wrapper = render(viewModel);

      // Assert
      wrapper.expectElement(`textarea[data-cy="additional-comments-input"]`).toExist();

      correctionReasonsExcludingOther.forEach((correctionReason) => {
        wrapper.expectElement(`[data-cy="${correctionReason}-input"]`).notToExist();
      });
    });
  });

  describe(`when there are multiple correction reasons excluding "${RECORD_CORRECTION_REASON.OTHER}"`, () => {
    const requestReasons = [RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT, RECORD_CORRECTION_REASON.UTILISATION_INCORRECT];

    it('should only render the error type inputs for the provided correction reasons', () => {
      // Arrange
      const viewModel = aProvideUtilisationReportCorrectionViewModel();
      viewModel.correctionRequestDetails.reasons = requestReasons;

      const unusedCorrectionReasons = difference(correctionReasonsExcludingOther, requestReasons);

      // Act
      const wrapper = render(viewModel);

      // Assert
      requestReasons.forEach((correctionReason) => {
        wrapper.expectElement(`[data-cy="${correctionReason}-input"]`).toExist();
      });

      unusedCorrectionReasons.forEach((correctionReason) => {
        wrapper.expectElement(`[data-cy="${correctionReason}-input"]`).notToExist();
      });
    });

    it('should render the "additional comments" input', () => {
      // Arrange
      const viewModel = aProvideUtilisationReportCorrectionViewModel();
      viewModel.correctionRequestDetails.reasons = requestReasons;

      // Act
      const wrapper = render(viewModel);

      // Assert
      wrapper.expectElement(`textarea[data-cy="additional-comments-input"]`).toExist();
    });
  });

  describe(`when there are multiple correction reasons including "${RECORD_CORRECTION_REASON.OTHER}"`, () => {
    const requestReasons = [RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT, RECORD_CORRECTION_REASON.OTHER];

    it('should only render the error type inputs for the provided correction reasons', () => {
      // Arrange
      const viewModel = aProvideUtilisationReportCorrectionViewModel();
      viewModel.correctionRequestDetails.reasons = requestReasons;

      const unusedCorrectionReasons = difference(correctionReasonsExcludingOther, requestReasons);
      const requestReasonsExcludingOther = difference(requestReasons, [RECORD_CORRECTION_REASON.OTHER]);

      // Act
      const wrapper = render(viewModel);

      // Assert
      requestReasonsExcludingOther.forEach((correctionReason) => {
        wrapper.expectElement(`[data-cy="${correctionReason}-input"]`).toExist();
      });

      wrapper.expectElement(`textarea[data-cy="additional-comments-input"]`).toExist();

      unusedCorrectionReasons.forEach((correctionReason) => {
        wrapper.expectElement(`[data-cy="${correctionReason}-input"]`).notToExist();
      });
    });
  });

  describe('when there are NO form values provided', () => {
    const viewModel = {
      ...aProvideUtilisationReportCorrectionViewModel(),
      correctionRequestDetails: {
        ...aProvideUtilisationReportCorrectionViewModel().correctionRequestDetails,
        reasons: [
          RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT,
          RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT,
          RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT,
          RECORD_CORRECTION_REASON.UTILISATION_INCORRECT,
          RECORD_CORRECTION_REASON.OTHER,
        ],
      },
      paymentCurrencyOptions: mapCurrenciesToRadioItems(),
      formValues: {
        additionalComments: null,
        facilityId: null,
        utilisation: null,
        reportedFee: null,
      },
    };

    it('should not set any of the form values', () => {
      // Act
      const wrapper = render(viewModel);

      // Assert
      wrapper.expectInput(`[data-cy="${RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT}-input"]`).toHaveValue(undefined);
      wrapper.expectInput(`[data-cy="${RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT}-input"]`).toHaveValue(undefined);
      wrapper.expectInput(`[data-cy="${RECORD_CORRECTION_REASON.UTILISATION_INCORRECT}-input"]`).toHaveValue(undefined);
      wrapper.expectTextArea('[data-cy="additional-comments-input"]').toHaveValue('');

      wrapper.expectInput(`[data-cy="currency-${CURRENCY.GBP}"]`).toNotBeChecked();
      wrapper.expectInput(`[data-cy="currency-${CURRENCY.USD}"]`).toNotBeChecked();
      wrapper.expectInput(`[data-cy="currency-${CURRENCY.EUR}"]`).toNotBeChecked();
      wrapper.expectInput(`[data-cy="currency-${CURRENCY.JPY}"]`).toNotBeChecked();
    });
  });

  describe('when there are form values provided', () => {
    const formValues = {
      additionalComments: 'this is an additional comment',
      facilityId: '7777777',
      utilisation: '99,999.00',
      reportedFee: '88,888.88',
    };

    const viewModel = {
      ...aProvideUtilisationReportCorrectionViewModel(),
      correctionRequestDetails: {
        ...aProvideUtilisationReportCorrectionViewModel().correctionRequestDetails,
        reasons: [
          RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT,
          RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT,
          RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT,
          RECORD_CORRECTION_REASON.UTILISATION_INCORRECT,
          RECORD_CORRECTION_REASON.OTHER,
        ],
      },
      paymentCurrencyOptions: mapCurrenciesToRadioItems(CURRENCY.JPY),
      formValues,
    };

    it('should set the input to have the given form values', () => {
      // Act
      const wrapper = render(viewModel);

      // Assert
      wrapper.expectInput(`[data-cy="${RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT}-input"]`).toHaveValue(formValues.facilityId);
      wrapper.expectInput(`[data-cy="${RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT}-input"]`).toHaveValue(formValues.reportedFee);
      wrapper.expectInput(`[data-cy="${RECORD_CORRECTION_REASON.UTILISATION_INCORRECT}-input"]`).toHaveValue(formValues.utilisation);
      wrapper.expectTextArea('[data-cy="additional-comments-input"]').toHaveValue(formValues.additionalComments);

      wrapper.expectInput(`[data-cy="currency-${CURRENCY.GBP}"]`).toNotBeChecked();
      wrapper.expectInput(`[data-cy="currency-${CURRENCY.USD}"]`).toNotBeChecked();
      wrapper.expectInput(`[data-cy="currency-${CURRENCY.EUR}"]`).toNotBeChecked();
      wrapper.expectInput(`[data-cy="currency-${CURRENCY.JPY}"]`).toBeChecked();
    });
  });

  it('should render the provided "additional comments" input labels', () => {
    // Arrange
    const label = 'Additional comments label';
    const hint = 'Additional comments hint';

    const viewModel = {
      ...aProvideUtilisationReportCorrectionViewModel(),
      additionalComments: {
        label,
        hint,
      },
    };

    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectText(`[data-cy="additional-comments-label"]`).toRead(label);
    wrapper.expectText(`[data-cy="additional-comments-hint"]`).toRead(hint);
  });

  it('should render the provided "error type" header text', () => {
    // Arrange
    const errorTypeHeader = 'An error type header';

    const viewModel = aProvideUtilisationReportCorrectionViewModel();
    viewModel.correctionRequestDetails.errorTypeHeader = errorTypeHeader;

    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectText(`[data-cy="correction-request-details-table-header--error-type"]`).toRead(errorTypeHeader);
  });

  it('should render the save button', () => {
    // Arrange
    const viewModel = aProvideUtilisationReportCorrectionViewModel();
    const continueButtonSelector = '[data-cy="continue-button"]';

    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectElement(continueButtonSelector).toExist();
    wrapper.expectText(continueButtonSelector).toRead('Save and review changes');
  });

  it('should render the cancel button', () => {
    // Arrange
    const cancelLinkHref = '/utilisation-reports/cancel-correction/7';
    const viewModel = {
      ...aProvideUtilisationReportCorrectionViewModel(),
      cancelLinkHref,
    };
    const cancelButtonSelector = '[data-cy="cancel-button"]';

    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectElement(cancelButtonSelector).toExist();
    wrapper.expectElement(cancelButtonSelector).toHaveAttribute('value', 'Cancel record correction');
    wrapper.expectElement(cancelButtonSelector).hasClass('govuk-button--secondary');
    wrapper.expectElement(cancelButtonSelector).toHaveAttribute('formaction', cancelLinkHref);
  });

  describe('when there are validation errors', () => {
    const formValues = {
      additionalComments: '',
      facilityId: 'invalid',
      utilisation: 'one',
      reportedFee: 'two',
      reportedCurrency: 'invalid',
    };

    const errorsViewModel = {
      errorSummary: [{ text: 'error summary', href: '#errorSummary' }],
      facilityIdErrorMessage: 'some facility id error',
      reportedCurrencyErrorMessage: 'some reported currency error',
      reportedFeeErrorMessage: 'some reported fee error',
      utilisationErrorMessage: 'some utilisation error',
      additionalCommentsErrorMessage: 'some additional comments error',
    };

    const viewModel = {
      ...aProvideUtilisationReportCorrectionViewModel(),
      correctionRequestDetails: {
        ...aProvideUtilisationReportCorrectionViewModel().correctionRequestDetails,
        reasons: [
          RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT,
          RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT,
          RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT,
          RECORD_CORRECTION_REASON.UTILISATION_INCORRECT,
          RECORD_CORRECTION_REASON.OTHER,
        ],
      },
      paymentCurrencyOptions: mapCurrenciesToRadioItems(CURRENCY.JPY),
      formValues,
      errors: errorsViewModel,
    };

    it('should render the error summary', () => {
      // Act
      const wrapper = render(viewModel);

      // Assert
      wrapper.expectText('[data-cy="error-summary"]').toContain(errorsViewModel.errorSummary[0].text);
    });

    it('should render the inline error for the "facility id" input', () => {
      // Act
      const wrapper = render(viewModel);

      // Assert
      wrapper.expectText('[data-cy="FACILITY_ID_INCORRECT-error"]').toRead(`Error: ${errorsViewModel.facilityIdErrorMessage}`);
    });

    it('should render the inline error for the "reported currency" input', () => {
      // Act
      const wrapper = render(viewModel);

      // Assert
      wrapper.expectText('[data-cy="REPORTED_CURRENCY_INCORRECT-error"]').toRead(`Error: ${errorsViewModel.reportedCurrencyErrorMessage}`);
    });

    it('should render the inline error for the "reported fee" input', () => {
      // Act
      const wrapper = render(viewModel);

      // Assert
      wrapper.expectText('[data-cy="REPORTED_FEE_INCORRECT-error"]').toRead(`Error: ${errorsViewModel.reportedFeeErrorMessage}`);
    });

    it('should render the inline error for the "utilisation" input', () => {
      // Act
      const wrapper = render(viewModel);

      // Assert
      wrapper.expectText('[data-cy="UTILISATION_INCORRECT-error"]').toRead(`Error: ${errorsViewModel.utilisationErrorMessage}`);
    });

    it('should render the inline error for the "additional comments" input', () => {
      // Act
      const wrapper = render(viewModel);

      // Assert
      wrapper.expectText('[data-cy="additional-comments-error"]').toRead(`Error: ${errorsViewModel.additionalCommentsErrorMessage}`);
    });
  });
});
