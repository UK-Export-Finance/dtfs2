import { PortalSessionUser } from "../../server/types/portal-session-user";
import { aBank } from "./bank";

export const aPortalSessionUser = (): PortalSessionUser => ({
  _id: 'abc123',
  username: 'firstlast',
  firstname: 'first',
  surname: 'last',
  email: 'first.last@ukexportfinance.gov.uk',
  roles: [],
  bank: aBank(),
  timezone: 'Europe/London',
  'user-status': 'active',
});
