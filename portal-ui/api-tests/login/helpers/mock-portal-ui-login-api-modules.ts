type PortalUiLoginApiModuleMockOptions = {
  validateToken?: boolean;
  withPortalBankList?: boolean;
};

/**
 * Creates the shared dtfs2-common mock used by login API tests.
 */
export const mockDtfs2CommonLoginApiModule = () => ({
  ...jest.requireActual<typeof import('@ukef/dtfs2-common')>('@ukef/dtfs2-common'),
  verify: jest.fn((_req: unknown, _res: unknown, next: () => void): void => {
    next();
  }),
});

/**
 * Creates the shared server/api mock used by login API tests.
 */
export const mockLoginApiModule = ({ validateToken = false, withPortalBankList = false }: PortalUiLoginApiModuleMockOptions = {}) => ({
  login: jest.fn(),
  sendSignInOTP: jest.fn(),
  loginWithSignInOtp: jest.fn(),
  sendSignInLink: jest.fn(),
  loginWithSignInLink: jest.fn(),
  validateToken: () => validateToken,
  validatePartialAuthToken: jest.fn(),
  ...(withPortalBankList ? { getPortalBankList: jest.fn().mockResolvedValue([]) } : {}),
});
