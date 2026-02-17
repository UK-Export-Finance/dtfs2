import { Response } from 'express';
import { HttpStatusCode } from 'axios';
import { renderAccessCodeErrorView } from './render-access-code-error';

describe('renderAccessCodeErrorView', () => {
  const mockRes = () => {
    const render = jest.fn();
    const status = jest.fn().mockReturnThis();

    return {
      res: {
        render,
        status,
      } as unknown as Response,
      render,
      status,
    };
  };

  const validationErrors = {
    signInOTP: {
      text: 'Enter the access code',
      order: '1',
    },
  };

  const baseOptions = {
    attemptsLeft: 3,
    email: 'user@example.com',
    signInOTP: '123456',
    validationErrors,
  };

  it('should set the response status to BadRequest before rendering the template', () => {
    // Arrange
    const { res, status } = mockRes();

    // Act
    renderAccessCodeErrorView({
      res,
      ...baseOptions,
    });

    // Assert
    expect(status).toHaveBeenCalledTimes(1);
    expect(status).toHaveBeenCalledWith(HttpStatusCode.BadRequest);
  });

  it('should render the access code template with the expected view model', () => {
    // Arrange
    const { res, render } = mockRes();

    // Act
    renderAccessCodeErrorView({
      res,
      ...baseOptions,
    });

    // Assert
    expect(render).toHaveBeenCalledTimes(1);
    expect(render).toHaveBeenCalledWith('login/check-your-email-access-code.njk', {
      attemptsLeft: 3,
      requestNewCodeUrl: '/login/new-access-code',
      email: 'user@example.com',
      signInOTP: '123456',
      validationErrors,
    });
  });
});
