import { MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import { UserRepo } from './user.repo';
import { mongoDbClient } from '../../drivers/db-client';
import { getEscapedRegexFromString } from '../helpers/get-escaped-regex-from-string';

let toArrayMock = jest.fn();
const findMock = jest.fn();
const getCollectionMock = jest.fn();

describe('user repo', () => {
  beforeEach(() => {
    jest.resetAllMocks();

    findMock.mockImplementation(() => ({
      toArray: toArrayMock,
    }));

    getCollectionMock.mockResolvedValue({
      find: findMock,
    });
  });

  describe('find users by email addresses', () => {
    describe.each([
      { description: '1', emailsToTest: ['a-test-email@ukexportfinance.gov.uk'], findResult: ['a-user'] },
      {
        description: '2',
        emailsToTest: ['a-test-email@ukexportfinance.gov.uk', 'a-test-email-2@ukexportfinance.gov.uk'],
        findResult: ['a-user', 'another-user'],
      },
    ])(`when finding $description user(s) by email addresses`, ({ emailsToTest, findResult }) => {
      let expectedEmailRegex: RegExp[];

      beforeEach(() => {
        jest.spyOn(mongoDbClient, 'getCollection').mockImplementation(getCollectionMock);
        expectedEmailRegex = emailsToTest.map((email) => getEscapedRegexFromString(email));

        mockFindResponse(findResult);
      });

      it('calls the tfm user collection', async () => {
        await makeRequest();

        expect(getCollectionMock).toHaveBeenCalledWith(MONGO_DB_COLLECTIONS.TFM_USERS);
        expect(getCollectionMock).toHaveBeenCalledTimes(1);
      });

      it('finds users by escaped email addresses', async () => {
        const expectedQuery = { email: { $in: expectedEmailRegex } };

        await makeRequest();

        expect(findMock).toHaveBeenCalledWith(expectedQuery);
        expect(findMock).toHaveBeenCalledTimes(1);
      });

      it('returns the found users', async () => {
        const result = await makeRequest();

        expect(result).toEqual(findResult);
      });

      async function makeRequest() {
        return UserRepo.findUsersByEmailAddresses(emailsToTest);
      }
      function mockFindResponse(response: unknown[]) {
        toArrayMock = jest.fn().mockResolvedValue(response);
      }
    });
  });
});
