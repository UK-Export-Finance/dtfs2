import { RECORD_CORRECTION_REASON } from '@ukef/dtfs2-common';
import { difference } from 'lodash';
import pageRenderer from '../../pageRenderer';
import { aProvideUtilisationReportCorrectionViewModel } from '../../../test-helpers/test-data/view-models/record-corrections/provide-utilisation-report-correction-view-model';

const page = 'utilisation-report-service/record-correction/provide-utilisation-report-correction.njk';
const render = pageRenderer(page);

describe(page, () => {
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
    const viewModel = aProvideUtilisationReportCorrectionViewModel();
    const cancelButtonSelector = '[data-cy="cancel-button"]';

    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectElement(cancelButtonSelector).toExist();
    wrapper.expectElement(cancelButtonSelector).toHaveAttribute('value', 'Cancel record correction');
    wrapper.expectElement(cancelButtonSelector).hasClass('govuk-button--secondary');
  });
});
