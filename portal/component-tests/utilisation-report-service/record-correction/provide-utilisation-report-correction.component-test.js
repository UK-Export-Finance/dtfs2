const { RECORD_CORRECTION_REASON } = require('@ukef/dtfs2-common');
const { difference } = require('lodash');
const pageRenderer = require('../../pageRenderer');
const {
  aProvideUtilisationReportCorrectionViewModel,
} = require('../../../test-helpers/test-data/view-models/record-corrections/provide-utilisation-report-correction-view-model');

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
      const correctionReasons = [correctionReason];

      const viewModel = aProvideUtilisationReportCorrectionViewModel();
      viewModel.correctionRequestDetails.reasons = correctionReasons;

      const remainingCorrectionReasonsExcludingOther = difference(correctionReasonsExcludingOther, [...correctionReasons]);

      // Act
      const wrapper = render(viewModel);

      // Assert
      wrapper.expectElement(`[data-cy="${correctionReason}-input"]`).toExist();

      remainingCorrectionReasonsExcludingOther.forEach((remainingCorrectionReason) => {
        wrapper.expectElement(`[data-cy="${remainingCorrectionReason}-input"]`).notToExist();
      });
    });

    it('should render the "additional comments" input', () => {
      // Arrange
      const viewModel = aProvideUtilisationReportCorrectionViewModel();
      viewModel.correctionRequestDetails.reasons = [RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT];

      // Act
      const wrapper = render(viewModel);

      // Assert
      wrapper.expectElement(`textarea[data-cy="${RECORD_CORRECTION_REASON.OTHER}-input"]`).toExist();
    });
  });

  describe(`when "${RECORD_CORRECTION_REASON.OTHER}" is the sole correction reason`, () => {
    const correctionReasons = [RECORD_CORRECTION_REASON.OTHER];

    it('should only render the "additional comments" input', () => {
      // Arrange
      const viewModel = aProvideUtilisationReportCorrectionViewModel();
      viewModel.correctionRequestDetails.reasons = correctionReasons;

      // Act
      const wrapper = render(viewModel);

      // Assert
      wrapper.expectElement(`textarea[data-cy="${RECORD_CORRECTION_REASON.OTHER}-input"]`).toExist();

      correctionReasonsExcludingOther.forEach((correctionReason) => {
        wrapper.expectElement(`[data-cy="${correctionReason}-input"]`).notToExist();
      });
    });
  });

  describe(`when there are multiple correction reasons excluding "${RECORD_CORRECTION_REASON.OTHER}"`, () => {
    const correctionReasons = [RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT, RECORD_CORRECTION_REASON.UTILISATION_INCORRECT];

    it('should only render the error type inputs for the provided correction reasons', () => {
      // Arrange
      const viewModel = aProvideUtilisationReportCorrectionViewModel();
      viewModel.correctionRequestDetails.reasons = correctionReasons;

      const remainingCorrectionReasonsExcludingOther = difference(correctionReasonsExcludingOther, correctionReasons);

      // Act
      const wrapper = render(viewModel);

      // Assert
      correctionReasons.forEach((correctionReason) => {
        wrapper.expectElement(`[data-cy="${correctionReason}-input"]`).toExist();
      });

      remainingCorrectionReasonsExcludingOther.forEach((correctionReason) => {
        wrapper.expectElement(`[data-cy="${correctionReason}-input"]`).notToExist();
      });
    });

    it('should render the "additional comments" input', () => {
      // Arrange
      const viewModel = aProvideUtilisationReportCorrectionViewModel();
      viewModel.correctionRequestDetails.reasons = correctionReasons;

      // Act
      const wrapper = render(viewModel);

      // Assert
      wrapper.expectElement(`textarea[data-cy="${RECORD_CORRECTION_REASON.OTHER}-input"]`).toExist();
    });
  });

  describe(`when there are multiple correction reasons including "${RECORD_CORRECTION_REASON.OTHER}"`, () => {
    const correctionReasons = [RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT, RECORD_CORRECTION_REASON.OTHER];

    it('should only render the error type inputs for the provided correction reasons', () => {
      // Arrange
      const viewModel = aProvideUtilisationReportCorrectionViewModel();
      viewModel.correctionRequestDetails.reasons = correctionReasons;

      const remainingCorrectionReasons = difference(correctionReasonsExcludingOther, correctionReasons);

      // Act
      const wrapper = render(viewModel);

      // Assert
      correctionReasons.forEach((correctionReason) => {
        wrapper.expectElement(`[data-cy="${correctionReason}-input"]`).toExist();
      });

      remainingCorrectionReasons.forEach((correctionReason) => {
        wrapper.expectElement(`[data-cy="${correctionReason}-input"]`).notToExist();
      });
    });
  });

  it('should render the provided "additional comments" input labels', () => {
    // Arrange
    const additionalCommentsLabel = 'Additional comments label';
    const additionalCommentsHint = 'Additional comments hint';

    const viewModel = {
      ...aProvideUtilisationReportCorrectionViewModel(),
      additionalCommentsLabel,
      additionalCommentsHint,
    };

    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectText(`[data-cy="${RECORD_CORRECTION_REASON.OTHER}-label"]`).toRead(additionalCommentsLabel);
    wrapper.expectText(`[data-cy="${RECORD_CORRECTION_REASON.OTHER}-hint"]`).toRead(additionalCommentsHint);
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
