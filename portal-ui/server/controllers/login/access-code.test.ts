import * as dtfsCommon from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { createMocks } from 'node-mocks-http';
import { getAccessCodePage, GetAccessCodePageRequest } from './access-code.ts';

describe('getAccessCodePage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(dtfsCommon, 'isPortal2FAFeatureFlagEnabled').mockReturnValue(true);
    jest.spyOn(console, 'error');
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  const validPages = ['check-your-email-access-code', 'new-access-code', 'another-access-code', 'account-suspended'];

  validPages.forEach((validPage) => {
    it(`should render the access code template for page: ${validPage}`, () => {
      // Arrange
      const { req, res } = createMocks<GetAccessCodePageRequest>({ params: { page: validPage } });

      // Act
      getAccessCodePage(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
      expect(res._getRenderView()).toEqual(`login/access-code/${validPage}.njk`);
      const renderData = res._getRenderData() as { attemptsLeft?: number; requestNewCodeUrl?: string };
      expect(renderData).toHaveProperty('attemptsLeft');
      expect(renderData).toHaveProperty('requestNewCodeUrl');
      expect(renderData.requestNewCodeUrl).toEqual(`/login/access-code/${validPage}`);
    });
  });

  it(`should redirect to not-found page for an invalid page`, () => {
    // Arrange
    const invalidPage = 'not-a-valid-page';
    const { req, res } = createMocks<GetAccessCodePageRequest>({ params: { page: invalidPage } });

    // Act
    getAccessCodePage(req, res);

    // Assert
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Invalid access code page requested %s', invalidPage);
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual('/not-found');
  });
});
