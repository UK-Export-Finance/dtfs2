import { UpsertTfmUserRequest } from '../../types';
import { aCreateTfmUserRequest } from './create-tfm-user-request';

export const aUpsertTfmUserRequest = (): UpsertTfmUserRequest => aCreateTfmUserRequest();
