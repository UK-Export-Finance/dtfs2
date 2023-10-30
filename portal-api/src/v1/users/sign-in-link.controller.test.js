const { when } = require('jest-when');
const { createAndEmailSignInLink } = require('./sign-in-link.controller');
const service = require('./sign-in-link.service');

jest.mock('./sign-in-link.service');

describe('sign in link controller', () => {
  const user = {
    _id: 'an id',
    email: 'an email',
    firstname: 'first name',
    surname: 'last name',
  };

  const req = {
    user
  };

  const res = {
    status: jest.fn(),
    send: jest.fn(),
  };

  beforeEach(() => {
    jest.resetAllMocks();
    res.status.mockReturnThis();
  });

  describe('createAndEmailSignInLink', () => {
    it('should create and send a sign in code for req.user', async () => {
      await createAndEmailSignInLink(req, res);
      expect(service.createAndEmailSignInLink).toHaveBeenCalledWith(user);
    });

    it('should respond with a 201 if the sign in code is sent', async () => {
      await createAndEmailSignInLink(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should respond with an empty body if the sign in code is sent', async () => {
      await createAndEmailSignInLink(req, res);
      expect(res.send).toHaveBeenCalledWith();
    });

    it('should respond with a 500 if the sign in code fails', async () => {
      when(service.createAndEmailSignInLink)
        .calledWith(user)
        .mockRejectedValueOnce(new Error());

      await createAndEmailSignInLink(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('should respond with the error message as a response body if the sign in code fails', async () => {
      const errorMessage = 'a test error';
      when(service.createAndEmailSignInLink)
        .calledWith(user)
        .mockRejectedValueOnce(new Error(errorMessage));

      await createAndEmailSignInLink(req, res);

      expect(res.send).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: errorMessage,
      });
    });
  });
});
