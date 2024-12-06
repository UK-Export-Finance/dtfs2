import { EntraIdAuthCodeRedirectResponseBody } from '../../types';

export const anEntraIdAuthCodeRedirectResponseBody = (): EntraIdAuthCodeRedirectResponseBody => ({
  code: 'a-code',
  client_info: 'a-client-info',
  state: 'a-state',
  session_state: 'a-session-state',
});
