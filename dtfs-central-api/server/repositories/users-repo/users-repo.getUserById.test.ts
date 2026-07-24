import { ObjectId } from 'mongodb';

import { getUserById } from '.';
import { mongoDbClient } from '../../drivers/db-client';

const findOneMock = jest.fn();
const getCollectionMock = jest.fn();

const userId = new ObjectId();

describe('getUserById', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});

    getCollectionMock.mockResolvedValue({
      findOne: findOneMock,
    });
    jest.spyOn(mongoDbClient, 'getCollection').mockImplementation(getCollectionMock);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should call getCollection with 'users'", async () => {
    // Arrange
    findOneMock.mockResolvedValue({ _id: userId, email: 'test@test.com' });

    // Act
    await getUserById(userId.toString());

    // Assert
    expect(getCollectionMock).toHaveBeenCalledWith('users');
  });

  it('should call findOne with the correct parameters', async () => {
    // Arrange
    findOneMock.mockResolvedValue({ _id: userId, email: 'test@test.com' });

    // Act
    await getUserById(userId.toString());

    // Assert
    expect(findOneMock).toHaveBeenCalledWith({ _id: { $eq: userId } });
  });

  it('should return the user when found', async () => {
    // Arrange
    const mockUser = { _id: userId, email: 'test@test.com' };
    findOneMock.mockResolvedValue(mockUser);

    // Act
    const result = await getUserById(userId.toString());

    // Assert
    expect(result).toEqual(mockUser);
  });

  it('should throw an error when no user is found for the id', async () => {
    // Arrange
    findOneMock.mockResolvedValue(null);

    // Act & Assert
    await expect(getUserById(userId.toString())).rejects.toThrow(`Failed to find user with id ${userId.toString()}`);
  });

  it('should call console.error and rethrow if a database error occurs', async () => {
    // Arrange
    const errorMessage = 'Database error';
    findOneMock.mockRejectedValue(new Error(errorMessage));

    // Act & Assert
    await expect(getUserById(userId.toString())).rejects.toThrow(errorMessage);

    expect(console.error).toHaveBeenCalledWith('Error fetching user by id %s: %o', userId.toString(), new Error(errorMessage));
  });
});
