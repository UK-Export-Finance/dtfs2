const { createAmendmentTasks, createTasksAutomaticAmendment, createTasksManualAmendment } = require('./create-tasks-amendment.helper');

describe('createAmendmentTasks()', () => {
  const mockFacility = {
    requireUkefApproval: false,
    tfm: {},
  };

  it('should create automatic amendment tasks if !requireUkefApproval and !nonDelegatedBank', () => {
    const response = createAmendmentTasks(mockFacility.requireUkefApproval, mockFacility.tfm);

    const expected = createTasksAutomaticAmendment();

    expect(response).toEqual(expected);
  });

  it('should create manual amendment tasks if requireUkefApproval and !nonDelegatedBank', () => {
    mockFacility.requireUkefApproval = true;

    const response = createAmendmentTasks(mockFacility.requireUkefApproval, mockFacility.tfm);

    const expected = createTasksManualAmendment();

    expect(response).toEqual(expected);
  });

  it('should create non delegated bank amendment tasks if requireUkefApproval and nonDelegatedBank', () => {
    mockFacility.requireUkefApproval = true;
    mockFacility.tfm = {
      nonDelegatedBank: true,
    };

    const response = createAmendmentTasks(mockFacility.requireUkefApproval, mockFacility.tfm);

    const expected = createTasksManualAmendment(mockFacility.tfm.nonDelegatedBank);

    expect(response).toEqual(expected);
  });

  it('should create non delegated bank amendment tasks if !requireUkefApproval and nonDelegatedBank', () => {
    mockFacility.requireUkefApproval = false;
    mockFacility.tfm = {
      nonDelegatedBank: true,
    };

    const response = createAmendmentTasks(mockFacility.requireUkefApproval, mockFacility.tfm);

    const expected = createTasksManualAmendment(mockFacility.tfm.nonDelegatedBank);

    expect(response).toEqual(expected);
  });
});
