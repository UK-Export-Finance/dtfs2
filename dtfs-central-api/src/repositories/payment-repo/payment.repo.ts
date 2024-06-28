import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';
import { PaymentEntity } from '@ukef/dtfs2-common';

export const PaymentRepo = SqlDbDataSource.getRepository(PaymentEntity);
