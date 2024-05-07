import createUkefIds from './create-ukef-ids';
import { number } from '../../../external-api/api';
import { NUMBER } from '../../../constants';
import api from '../../api';
import facilitiesController from '../facilities.controller';

const mockSuccessfulResponse = {
  data: {
    status: 200,
    data: [
      {
        id: 12345678,
        maskedId: NUMBER.UKEF_ID.TEST,
        type: 1,
        createdBy: NUMBER.USER.DTFS,
        createdDatetime: '2024-01-01T00:00:00.000Z',
        requestingSystem: NUMBER.USER.DTFS,
      },
    ],
  },
};

const mockFacility1 = {
  _id: '1',
  ukefFacilityId: NUMBER.UKEF_ID.TEST,
};

const mockFacility2 = {
  _id: '2',
  ukefFacilityId: NUMBER.UKEF_ID.TEST,
};

const mockDeal = {
  _id: '6597dffeb5ef5ff4267e5044',
  facilities: [mockFacility1, mockFacility2],
};

const updatedDeal = {
  _id: mockDeal._id,
  details: {
    ukefDealId: NUMBER.UKEF_ID.TEST,
  },
};

const mockUser = {
  _id: '1234',
};

describe('createUkefIds', () => {
  beforeEach(() => {
    number.getNumber = jest.fn().mockResolvedValue(mockSuccessfulResponse);
    api.updateDeal = jest.fn().mockResolvedValue(updatedDeal);
    facilitiesController.update = jest.fn().mockResolvedValue({});
  });

  it('Should generate and update UKEF IDs for a given deal and its facilities', async () => {
    // Arrange
    const modifiedMockFacility1 = {
      ukefFacilityId: NUMBER.UKEF_ID.TEST,
    };
    const modifiedMockFacility2 = {
      ukefFacilityId: NUMBER.UKEF_ID.TEST,
    };

    const facilitiesControllerUpdateSpy = jest.spyOn(facilitiesController, 'update');

    // Act
    const result = await createUkefIds(mockDeal, mockUser);

    // Assert
    expect(result).toEqual(updatedDeal);
    expect(number.getNumber).toHaveBeenCalledWith(NUMBER.ENTITY_TYPE.DEAL, mockDeal._id);
    expect(number.getNumber).toHaveBeenCalledWith(NUMBER.ENTITY_TYPE.FACILITY, mockDeal._id);
    expect(facilitiesControllerUpdateSpy).toHaveBeenCalledWith(
      mockDeal._id,
      mockFacility1,
      modifiedMockFacility1,
      mockUser,
    );
    expect(facilitiesControllerUpdateSpy).toHaveBeenCalledWith(
      mockDeal._id,
      mockFacility2,
      modifiedMockFacility2,
      mockUser,
    );

    // Clean up
    facilitiesControllerUpdateSpy.mockRestore();
  });

  it.each`
    value
    ${{}}
    ${[]}
    ${null}
    ${undefined}
    ${''}
  `('Should throw an error when deal argument provided is $value', async ({ value }) => {
    await expect(createUkefIds(value, mockUser)).rejects.toThrow('Unable to get UKEF IDs from the number generator');
  });

  it.each`
    value
    ${{}}
    ${[]}
    ${null}
    ${undefined}
    ${''}
  `('Should throw an error when user argument provided is $value', async ({ value }) => {
    await expect(createUkefIds(mockDeal, value)).rejects.toThrow('Unable to get UKEF IDs from the number generator');
  });
});
