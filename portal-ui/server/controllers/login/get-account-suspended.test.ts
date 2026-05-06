import { Request, Response } from 'express';
import { getAccountSuspendedPage } from './get-account-suspended';

describe('controllers/login/get-account-suspended', () => {
  let res: Response;
  let renderMock: jest.Mock;

  beforeEach(() => {
    renderMock = jest.fn();
    res = {
      render: renderMock,
    } as unknown as Response;
  });

  it('should render the account suspended access code template', () => {
    const req = {} as unknown as Request;

    getAccountSuspendedPage(req, res);

    expect(renderMock).toHaveBeenCalledTimes(1);
    expect(renderMock).toHaveBeenCalledWith('login/temporarily-suspended-access-code.njk');
  });
});
