const updateFacilityCoverStartDates = require('./update-facility-cover-start-dates');
const facilitiesController = require('../facilities.controller');
const CONSTANTS = require('../../../constants');

jest.mock('../facilities.controller');

describe('updateFacilityCoverStartDates', () => {
  const user = {};
  const deal = {
    _id: '1',
    facilities: ['2', '3'],
  };

  const dealWithNoFacilities = {
    _id: '1',
    facilities: [],
  };

  afterEach(() => {
    jest.resetAllMocks();
  });

  const errorMock = jest.spyOn(console, 'error');
  errorMock.mockImplementation();

  it('should not update cover start dates for deal with no facilities', async () => {
    const findOneMock = jest.spyOn(facilitiesController, 'findOne');
    findOneMock.mockResolvedValue({});

    const updateMock = jest.spyOn(facilitiesController, 'update');
    updateMock.mockResolvedValue({ data: true });

    const result = await updateFacilityCoverStartDates(user, dealWithNoFacilities);

    expect(findOneMock).toHaveBeenCalledTimes(0);
    expect(updateMock).toHaveBeenCalledTimes(0);

    expect(errorMock).toHaveBeenCalledTimes(2);
    expect(errorMock).toHaveBeenCalledWith('No facilities found in deal %s', deal._id);

    expect(result).toEqual({
      _id: '1',
      facilities: [],
    });
  });

  it('should throw an error when the deal does not have any facility', async () => {
    const findOneMock = jest.spyOn(facilitiesController, 'findOne');
    findOneMock.mockResolvedValue({});

    const updateMock = jest.spyOn(facilitiesController, 'update');
    updateMock.mockResolvedValue({ data: true });

    const result = await updateFacilityCoverStartDates(user, dealWithNoFacilities);

    expect(findOneMock).toHaveBeenCalledTimes(0);
    expect(updateMock).toHaveBeenCalledTimes(0);

    expect(errorMock).toHaveBeenCalledTimes(2);
    expect(errorMock).toHaveBeenCalledWith(
      "An error occurred while updating %s deal's facilities cover start date %o",
      dealWithNoFacilities._id,
      new Error(`No facilities found in deal ${dealWithNoFacilities._id}`),
    );

    expect(result).toEqual({
      _id: '1',
      facilities: [],
    });
  });

  it('should update cover start dates for facilities with correct stage and flags', async () => {
    const findOneMock = jest.spyOn(facilitiesController, 'findOne');
    findOneMock
      .mockResolvedValueOnce({
        facilityStage: CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.ISSUED,
      })
      .mockResolvedValueOnce({
        facilityStage: CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.ISSUED,
      });

    const updateMock = jest.spyOn(facilitiesController, 'update');
    updateMock.mockResolvedValue({ data: true });

    const result = await updateFacilityCoverStartDates(user, deal);

    expect(findOneMock).toHaveBeenCalledTimes(2);
    expect(updateMock).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      _id: '1',
      facilities: ['2', '3'],
    });
  });

  it('should not update cover start dates for facilities already issued', async () => {
    const findOneMock = jest.spyOn(facilitiesController, 'findOne');
    findOneMock
      .mockResolvedValueOnce({
        facilityStage: CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.ISSUED,
        requestedCoverStartDate: 123456789,
        coverDateConfirmed: true,
      })
      .mockResolvedValueOnce({
        facilityStage: CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.ISSUED,
        requestedCoverStartDate: 123456789,
        coverDateConfirmed: true,
      });

    const updateMock = jest.spyOn(facilitiesController, 'update');
    updateMock.mockResolvedValue({ data: true });

    const result = await updateFacilityCoverStartDates(user, deal);

    expect(findOneMock).toHaveBeenCalledTimes(2);
    expect(updateMock).toHaveBeenCalledTimes(0);
    expect(result).toEqual({
      _id: '1',
      facilities: ['2', '3'],
    });
  });

  it('should not update cover start dates for unissued facilities', async () => {
    const findOneMock = jest.spyOn(facilitiesController, 'findOne');
    findOneMock
      .mockResolvedValueOnce({
        facilityStage: CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.UNISSUED,
      })
      .mockResolvedValueOnce({
        facilityStage: CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.UNISSUED,
      });

    const updateMock = jest.spyOn(facilitiesController, 'update');
    updateMock.mockResolvedValue({ data: true });

    const result = await updateFacilityCoverStartDates(user, deal);

    expect(findOneMock).toHaveBeenCalledTimes(2);
    expect(updateMock).toHaveBeenCalledTimes(0);
    expect(result).toEqual({
      _id: '1',
      facilities: ['2', '3'],
    });
  });

  it('should not update cover start dates for unissued facilities', async () => {
    const findOneMock = jest.spyOn(facilitiesController, 'findOne');
    findOneMock
      .mockResolvedValueOnce({
        facilityStage: CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.UNISSUED,
      })
      .mockResolvedValueOnce({
        facilityStage: CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.UNISSUED,
      });

    const updateMock = jest.spyOn(facilitiesController, 'update');
    updateMock.mockResolvedValue({ data: true });

    const result = await updateFacilityCoverStartDates(user, deal);

    expect(findOneMock).toHaveBeenCalledTimes(2);
    expect(updateMock).toHaveBeenCalledTimes(0);
    expect(result).toEqual({
      _id: '1',
      facilities: ['2', '3'],
    });
  });

  it('should not update cover start dates for conditional facilities', async () => {
    const findOneMock = jest.spyOn(facilitiesController, 'findOne');
    findOneMock
      .mockResolvedValueOnce({
        facilityStage: CONSTANTS.FACILITIES.FACILITIES_STAGE.LOAN.CONDITIONAL,
      })
      .mockResolvedValueOnce({
        facilityStage: CONSTANTS.FACILITIES.FACILITIES_STAGE.LOAN.CONDITIONAL,
      });

    const updateMock = jest.spyOn(facilitiesController, 'update');
    updateMock.mockResolvedValue({ data: true });

    const result = await updateFacilityCoverStartDates(user, deal);

    expect(findOneMock).toHaveBeenCalledTimes(2);
    expect(updateMock).toHaveBeenCalledTimes(0);
    expect(result).toEqual({
      _id: '1',
      facilities: ['2', '3'],
    });
  });

  it('should not update cover start dates for unconditional facilities already issued', async () => {
    const findOneMock = jest.spyOn(facilitiesController, 'findOne');
    findOneMock
      .mockResolvedValueOnce({
        facilityStage: CONSTANTS.FACILITIES.FACILITIES_STAGE.LOAN.UNCONDITIONAL,
        requestedCoverStartDate: 123456789,
        coverDateConfirmed: true,
      })
      .mockResolvedValueOnce({
        facilityStage: CONSTANTS.FACILITIES.FACILITIES_STAGE.LOAN.UNCONDITIONAL,
        requestedCoverStartDate: 123456789,
        coverDateConfirmed: true,
      });

    const updateMock = jest.spyOn(facilitiesController, 'update');
    updateMock.mockResolvedValue({ data: true });

    const result = await updateFacilityCoverStartDates(user, deal);

    expect(findOneMock).toHaveBeenCalledTimes(2);
    expect(updateMock).toHaveBeenCalledTimes(0);
    expect(result).toEqual({
      _id: '1',
      facilities: ['2', '3'],
    });
  });

  it('should only update one unconditional facility which has not been issued', async () => {
    const findOneMock = jest.spyOn(facilitiesController, 'findOne');
    findOneMock
      .mockResolvedValueOnce({
        facilityStage: CONSTANTS.FACILITIES.FACILITIES_STAGE.LOAN.UNCONDITIONAL,
      })
      .mockResolvedValueOnce({
        facilityStage: CONSTANTS.FACILITIES.FACILITIES_STAGE.LOAN.UNCONDITIONAL,
        requestedCoverStartDate: 123456789,
        coverDateConfirmed: true,
      });

    const updateMock = jest.spyOn(facilitiesController, 'update');
    updateMock.mockResolvedValue({ data: true });

    const result = await updateFacilityCoverStartDates(user, deal);

    expect(findOneMock).toHaveBeenCalledTimes(2);
    expect(updateMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      _id: '1',
      facilities: ['2', '3'],
    });
  });

  it('should only update one issued facility which has not been issued', async () => {
    const findOneMock = jest.spyOn(facilitiesController, 'findOne');
    findOneMock
      .mockResolvedValueOnce({
        facilityStage: CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.ISSUED,
      })
      .mockResolvedValueOnce({
        facilityStage: CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.ISSUED,
        requestedCoverStartDate: 123456789,
        coverDateConfirmed: true,
      });

    const updateMock = jest.spyOn(facilitiesController, 'update');
    updateMock.mockResolvedValue({ data: true });

    const result = await updateFacilityCoverStartDates(user, deal);

    expect(findOneMock).toHaveBeenCalledTimes(2);
    expect(updateMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      _id: '1',
      facilities: ['2', '3'],
    });
  });

  it('should only update two issued facility which have not been issued yet.', async () => {
    const mockedDeal = {
      ...deal,
      facilities: ['2', '3', '4 ', '5'],
    };
    const findOneMock = jest.spyOn(facilitiesController, 'findOne');
    findOneMock
      .mockResolvedValueOnce({
        facilityStage: CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.ISSUED,
      })
      .mockResolvedValueOnce({
        facilityStage: CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.ISSUED,
        requestedCoverStartDate: 123456789,
        coverDateConfirmed: true,
      })
      .mockResolvedValueOnce({
        facilityStage: CONSTANTS.FACILITIES.FACILITIES_STAGE.LOAN.UNCONDITIONAL,
      })
      .mockResolvedValueOnce({
        facilityStage: CONSTANTS.FACILITIES.FACILITIES_STAGE.LOAN.UNCONDITIONAL,
        requestedCoverStartDate: 123456789,
        coverDateConfirmed: true,
      });

    const updateMock = jest.spyOn(facilitiesController, 'update');
    updateMock.mockResolvedValue({ data: true });

    const result = await updateFacilityCoverStartDates(user, mockedDeal);

    expect(findOneMock).toHaveBeenCalledTimes(4);
    expect(updateMock).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      _id: '1',
      facilities: ['2', '3', '4 ', '5'],
    });
  });

  it('should handle empty facility controller update response', async () => {
    const mockDeal = {
      _id: '1',
      facilities: ['2'],
    };

    const findOneMock = jest.spyOn(facilitiesController, 'findOne');
    findOneMock.mockResolvedValueOnce({
      facilityStage: CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.ISSUED,
    });

    const updateMock = jest.spyOn(facilitiesController, 'update');
    updateMock.mockResolvedValue(false);

    const result = await updateFacilityCoverStartDates(user, mockDeal);

    expect(findOneMock).toHaveBeenCalledTimes(1);
    expect(updateMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      _id: '1',
      facilities: ['2'],
    });

    expect(errorMock).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Error updating facility cover start date for facility %s with response %o', '2', undefined);
  });

  it('should handle an error thrown during facility update', async () => {
    const findOneMock = jest.spyOn(facilitiesController, 'findOne');
    findOneMock
      .mockResolvedValueOnce({
        facilityStage: CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.ISSUED,
      })
      .mockResolvedValueOnce({
        facilityStage: CONSTANTS.FACILITIES.FACILITIES_STAGE.LOAN.UNCONDITIONAL,
      });

    const updateMock = jest.spyOn(facilitiesController, 'update');
    updateMock.mockRejectedValue(new Error('Mock error'));

    const result = await updateFacilityCoverStartDates(user, deal);

    expect(findOneMock).toHaveBeenCalledTimes(1);
    expect(updateMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      _id: '1',
      facilities: ['2', '3'],
    });

    expect(errorMock).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith("An error occurred while updating %s deal's facilities cover start date %o", '1', new Error('Mock error'));
  });
});
