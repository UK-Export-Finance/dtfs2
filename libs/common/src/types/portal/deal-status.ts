import { ValuesOf } from '..';
import { DEAL_STATUS } from '../../constants/portal/deal-status';

export type DealStatus = ValuesOf<typeof DEAL_STATUS>;
