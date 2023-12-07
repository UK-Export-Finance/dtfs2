// eslint-disable-next-line import/no-unresolved, import/extensions
import Bank from './bank';

type User = {
  username: string;
  email: string;
  _id: string;
  roles: [];
  timezone: string;
  firstname: string;
  surname: string;
  bank: Bank
  password: string;
};

export default User;
