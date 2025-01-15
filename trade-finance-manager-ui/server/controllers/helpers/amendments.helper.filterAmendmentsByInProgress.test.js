const { TFM_DEAL_STAGE, AMENDMENT_STATUS } = require('@ukef/dtfs2-common');
const { filterAmendmentsByInProgress } = require('./amendments.helper');

const aNotStartedAmendment = () => ({
  status: AMENDMENT_STATUS.NOT_STARTED,
  submittedByPim: false,
});

const anUnsubmittedInProgressAmendment = () => ({
  status: AMENDMENT_STATUS.IN_PROGRESS,
  submittedByPim: false,
});

const aSubmittedInProgressAmendment = () => ({
  status: AMENDMENT_STATUS.IN_PROGRESS,
  submittedByPim: true,
});

const aCompletedAmendment = () => ({
  status: AMENDMENT_STATUS.COMPLETED,
  submittedByPim: true,
});

describe('filterAmendmentsByInProgress', () => {
  it(`should return an empty array if the deal stage is ${TFM_DEAL_STAGE.CANCELLED}`, () => {
    // Arrange
    const amendments = [aSubmittedInProgressAmendment()];
    const deal = {
      tfm: {
        stage: TFM_DEAL_STAGE.CANCELLED,
      },
    };

    // Act
    const result = filterAmendmentsByInProgress({ amendments, deal });

    // Assert
    expect(result).toEqual([]);
  });

  it(`should return an empty array if the amendments is not an array`, () => {
    // Arrange
    const amendments = undefined;
    const deal = {
      tfm: {
        stage: TFM_DEAL_STAGE.COMPLETED,
      },
    };

    // Act
    const result = filterAmendmentsByInProgress({ amendments, deal });

    // Assert
    expect(result).toEqual([]);
  });

  it(`should return an empty array if the amendments array is empty`, () => {
    // Arrange
    const amendments = [];
    const deal = {
      tfm: {
        stage: TFM_DEAL_STAGE.COMPLETED,
      },
    };

    // Act
    const result = filterAmendmentsByInProgress({ amendments, deal });

    // Assert
    expect(result).toEqual([]);
  });

  it(`should only return the in progress amendments`, () => {
    // Arrange
    const amendments = [aNotStartedAmendment(), aCompletedAmendment(), aSubmittedInProgressAmendment(), anUnsubmittedInProgressAmendment()];
    const deal = {
      tfm: {
        stage: TFM_DEAL_STAGE.COMPLETED,
      },
    };

    // Act
    const result = filterAmendmentsByInProgress({ amendments, deal });

    // Assert
    expect(result).toEqual([aSubmittedInProgressAmendment()]);
  });
});
