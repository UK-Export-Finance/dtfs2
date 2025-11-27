import { HttpStatusCode } from 'axios';
import { createMocks } from 'node-mocks-http';
import { getCheckYourEmailAccessCodePage, GetCheckYourEmailAccessCodePageRequest } from './check-your-email-access-code';

describe('getCheckYourEmailAccessCodePage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(console, 'error');
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it('should render check-your-email-access-code.njk when attemptsLeft is 3', () => {
    // Arrange
    const { req, res } = createMocks<GetCheckYourEmailAccessCodePageRequest>({
      session: { attemptsLeft: 3 },
    });

    // Act
    getCheckYourEmailAccessCodePage(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    expect(res._getRenderView()).toEqual('/login/check-your-email-access-code.njk');
    const renderData = res._getRenderData() as { attemptsLeft?: number; requestNewCodeUrl?: string };
    expect(renderData).toMatchObject({
      attemptsLeft: 3,
      requestNewCodeUrl: '/login/check-your-email-access-code',
    });
  });

  it('should render problem-with-service.njk when attemptsLeft is not a number', () => {
    // Arrange
    const { req, res } = createMocks<GetCheckYourEmailAccessCodePageRequest>({
      session: {},
    });

    // Act
    getCheckYourEmailAccessCodePage(req, res);

    // Assert
    expect(console.error).toHaveBeenCalledWith('Number of send sign in link attempts remaining was not present in the session.');
    expect(res._getRenderView()).toEqual('_partials/problem-with-service.njk');
  });

  it('should render problem-with-service.njk when attemptsLeft is greater than 3', () => {
    // Arrange
    const { req, res } = createMocks<GetCheckYourEmailAccessCodePageRequest>({
      session: { attemptsLeft: 4 },
    });

    // Act
    getCheckYourEmailAccessCodePage(req, res);

    // Assert
    expect(console.error).toHaveBeenCalledWith('Number of send sign in link attempts remaining was not within expected bounds: 4');
    expect(res._getRenderView()).toEqual('_partials/problem-with-service.njk');
  });
});
