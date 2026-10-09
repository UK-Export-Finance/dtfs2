import { Response } from 'express';
import { MOCK_EMAIL } from '@ukef/dtfs2-common/test-helpers';
import { getNewAccessCodePage, GetNewAccessCodePageRequest } from './get-new-access-code-page';

describe('controllers/login/get-new-access-code-page', () => {
  let res: Response;
  let renderMock: jest.Mock;
  let redirectMock: jest.Mock;

  beforeEach(() => {
    renderMock = jest.fn();
    redirectMock = jest.fn();
    res = {
      render: renderMock,
      redirect: redirectMock,
    } as unknown as Response;
  });

  it('should render the new access code template with attemptsLeft from the session', () => {
    const req = {
      session: {
        numberOfSignInOtpAttemptsRemaining: 1,
        userEmail: MOCK_EMAIL,
      },
    } as unknown as GetNewAccessCodePageRequest;

    getNewAccessCodePage(req, res);

    expect(renderMock).toHaveBeenCalledWith('login/new-access-code.njk', {
      attemptsLeft: 1,
      requestNewCodeUrl: '/login/request-new-access-code',
      isAccessCodeLink: true,
      isSupportInfo: false,
      email: MOCK_EMAIL,
    });
  });

  it('should redirect to not-found when attemptsLeft is not present in the session', () => {
    const req = {
      session: {},
    } as unknown as GetNewAccessCodePageRequest;

    getNewAccessCodePage(req, res);

    expect(redirectMock).toHaveBeenCalledTimes(1);
    expect(redirectMock).toHaveBeenCalledWith('/not-found');
  });

  it('should redirect to not-found when attemptsLeft is negative', () => {
    const req = {
      session: {
        numberOfSignInOtpAttemptsRemaining: -1,
        userEmail: MOCK_EMAIL,
      },
    } as unknown as GetNewAccessCodePageRequest;

    getNewAccessCodePage(req, res);

    expect(redirectMock).toHaveBeenCalledTimes(1);
    expect(redirectMock).toHaveBeenCalledWith('/not-found');
  });
});
