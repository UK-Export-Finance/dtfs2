const { produce } = require('immer');
const emailMustBeUnique = require('./email-must-be-unique');

const userController = require('../../controller');
const { TEST_USER_TRANSFORMED_FROM_DATABASE } = require('../../../../../test-helpers/unit-test-mocks/mock-user');
const { InvalidEmailAddressError, UserNotFoundError } = require('../../../errors');

jest.mock('../../controller');

describe('emailMustBeUnique', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  const emailMustBeUniqueError = [
    {
      email: {
        order: '1',
        text: 'Email address already in use',
      },
    },
  ];

  const exampleEmail = 'example@ukexportfinance.gov.uk';
  const changeRequest = { email: exampleEmail };

  const testUserWithoutMatchingEmail = produce(TEST_USER_TRANSFORMED_FROM_DATABASE, (draftRequest) => {
    draftRequest.email = 'notAMatchingEmail@ukexportfinance.gov.uk';
  });

  const testCases = [
    { description: 'when no existing user is provided', user: undefined },
    { description: 'when an existing user is provided', user: { email: exampleEmail } },
  ];

  describe.each(testCases)('$description', ({ user }) => {
    it('should check if the email is unique', async () => {
      userController.findByEmail.mockResolvedValue(null);

      await emailMustBeUnique(user, changeRequest);

      expect(userController.findByEmail).toHaveBeenCalledWith(exampleEmail);
      expect(userController.findByEmail).toHaveBeenCalledTimes(1);
    });

    it('should not return error if no email is provided', async () => {
      userController.findByEmail.mockResolvedValue(null);

      const errors = await emailMustBeUnique(user, []);

      expect(errors).toStrictEqual([]);
    });

    it('should not return error when email is unique', async () => {
      userController.findByEmail.mockRejectedValue(new UserNotFoundError(exampleEmail));

      const errors = await emailMustBeUnique(user, changeRequest);

      expect(errors).toStrictEqual([]);
    });

    it('should return error when the email is not unique', async () => {
      userController.findByEmail.mockResolvedValue(testUserWithoutMatchingEmail);
      const errors = await emailMustBeUnique(user, changeRequest);

      expect(errors).toStrictEqual(emailMustBeUniqueError);
    });

    it('should not return error when email is not a valid email', async () => {
      userController.findByEmail.mockRejectedValue(new InvalidEmailAddressError(exampleEmail));

      const errors = await emailMustBeUnique(user, changeRequest);

      expect(errors).toStrictEqual([]);
    });

    it('should return an error if there is an unhandled error fetching users', async () => {
      userController.findByEmail.mockRejectedValue(new Error());

      expect(emailMustBeUnique(user, changeRequest)).rejects.toThrow();
    });
  });
});
