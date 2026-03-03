const REQUEST_NEW_CODE_URL = '/login/request-new-access-code';

interface ViewModelConfig {
  isSupportInfo: boolean;
  isAccessCodeLink: boolean;
}

/**
 * Generates a view model for OTP access code pages.
 * @param attemptsLeft  The number of attempts remaining
 * @param userEmail     The user's email address
 * @param sixDigitAccessCode The access code entered
 * @param errors        The validation errors or null
 * @param config        Configuration for the page (isSupportInfo, isAccessCodeLink)
 */
export const generateViewModel = (
  attemptsLeft: number | undefined,
  userEmail: string | undefined,
  sixDigitAccessCode: string,
  errors: Record<string, { text: string; order?: string }> | null,
  config: ViewModelConfig,
) => ({
  attemptsLeft,
  requestNewCodeUrl: REQUEST_NEW_CODE_URL,
  isSupportInfo: config.isSupportInfo,
  isAccessCodeLink: config.isAccessCodeLink,
  email: userEmail,
  sixDigitAccessCode,
  validationErrors: errors,
  accessCodeError: errors?.sixDigitAccessCode || null,
});
