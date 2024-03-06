const { findByEmails } = require('./user.controller');
const MOCK_TFM_USERS = require('../../__mocks__/mock-users');

const MOCK_TFM_USER = MOCK_TFM_USERS[0];

// const MOCK_BLOCKED_USER = {
//   ...MOCK_TFM_USERS[1],
//   blocked: true,
// };

// const MOCK_DISABLED_USER = {
//   ...MOCK_TFM_USERS[2],
//   disabled: true,
// };

// const MOCK_USERS = [
//   MOCK_TFM_USER,
//   MOCK_BLOCKED_USER,
//   MOCK_DISABLED_USER,
// ];

// let mockCollection = {};
// let mockDatabase = {};


// beforeAll(() => {
//   mockCollection = {
//     // find: jest.fn().mockReturnThis(MOCK_USERS),
//     toArray: jest.fn().mockReturnValue(MOCK_USERS),
//   };

//   mockDatabase = {
//     getCollection: jest.fn().mockResolvedValue(mockCollection),
//   };
// });

describe('user.controller', () => {
  // beforeAll(() => {
  //   db.getCollection = mockDatabase.getCollection;
  // });

  describe('findByEmails', () => {
    // it('should call db.getCollection', async () => {
    //   await findByEmails([[MOCK_TFM_USER.email]]);

    //   expect(mockDatabase.getCollection).toHaveBeenCalledTimes(1);
    //   expect(mockDatabase.getCollection).toHaveBeenCalledWith('tfm-users');
    // });

    describe('when one user is found and the user is not blocked or disabled', () => {
      it('should return an object with user data, found and canProceed=true', async () => {
        const result = await findByEmails([[MOCK_TFM_USER.email]]);

        const expected = {
          found: true,
          canProceed: true,
          ...MOCK_TFM_USER,
        };

        expect(result).toEqual(expected);
      });
    });

    // describe('when more than 1user is found', () => {
    //   it('should return an object with user data, found and canProceed=false', async () => {

    //   });
    // });

    // describe('when a user is found and the user is disabled', () => {
    //   it('should return an object with user data, found and canProceed=false', async () => {

    //   });
    // });

    // describe('when a user is found and the user is blocked', () => {
    //   it('should return an object with user data, found and canProceed=false', async () => {

    //   });
    // });

    // describe('when a user is NOT found', () => {
    //   it('should return an object with found=false', async () => {

    //   });
    // });
  });
});
