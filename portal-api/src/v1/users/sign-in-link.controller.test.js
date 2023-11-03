const { when } = require('jest-when');
const { SignInLinkController } = require('./sign-in-link.controller');

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

  let service;
  let controller;

  beforeEach(() => {
    jest.resetAllMocks();
    res.status.mockReturnThis();
    service = {
      createAndEmailSignInLink: jest.fn()
    };
    controller = new SignInLinkController(service);
  });

  describe('createAndEmailSignInLink', () => {
    it('should create and send a sign in token for req.user', async () => {
      await controller.createAndEmailSignInLink(req, res);
      expect(service.createAndEmailSignInLink).toHaveBeenCalledWith(user);
    });

    it('should respond with a 201 if the sign in token is sent', async () => {
      await controller.createAndEmailSignInLink(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should respond with an empty body if the sign in token is sent', async () => {
      await controller.createAndEmailSignInLink(req, res);
      expect(res.send).toHaveBeenCalledWith();
    });

    it('should respond with a 500 if the sign in token fails', async () => {
      when(service.createAndEmailSignInLink)
        .calledWith(user)
        .mockRejectedValueOnce(new Error());

      await controller.createAndEmailSignInLink(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('should respond with the error message as a response body if the sign in token fails', async () => {
      const errorMessage = 'a test error';
      when(service.createAndEmailSignInLink)
        .calledWith(user)
        .mockRejectedValueOnce(new Error(errorMessage));

      await controller.createAndEmailSignInLink(req, res);

      expect(res.send).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: errorMessage,
      });
    });
  });
});
