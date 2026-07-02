import { WithId } from 'mongodb';

export type PortalBankListEntry = WithId<{
  name: string;
  order: number;
}>;
