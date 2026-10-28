import { UpsertTfmUserRequest } from '@ukef/types';
import { aCreateTfmUserRequest } from './create-tfm-user-request';

export const aUpsertTfmUserRequest = (): UpsertTfmUserRequest => aCreateTfmUserRequest();
