import { DateIanaTimezone } from '../date-iana-timezones';
import { TeamId } from './team-id';

export type UserUpdateFromEntraUser = {
  azureOid: string;
  email: string;
  username: string;
  teams: TeamId[];
  timezone: DateIanaTimezone;
  firstName: string;
  lastName: string;
};
