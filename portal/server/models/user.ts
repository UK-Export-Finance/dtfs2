// eslint-disable-next-line import/no-unresolved, import/extensions
import Bank from './bank';

type User = {
  username: string;
  firstname: string;
  surname: string;
  email: string;
  roles: [];
  bank: Bank
  lastLogin: Date;
  'user-status': 'blocked' | 'active';
  disabled: boolean;
  signInLinkSendDate: Date;
  signInLinkSendCount: number;
  timezone: string;
  _id: string;
};

export default User;
