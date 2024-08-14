import { ObjectId } from 'mongodb';
import { HttpStatusCode } from 'axios';
import { getCollection } from '../database';
import { DealFolderResponse, EstoreErrorResponse, Estore } from '../interfaces';
import { ESTORE_CRON_STATUS } from '../constants';
import { createDealFolder } from '../v1/controllers/estore/eStoreApi';
import { getNowAsEpoch } from '../helpers/date';

const acceptableStatuses = [HttpStatusCode.Ok, HttpStatusCode.Created];

export const eStoreFacilityDirectoryCreationJob = async (eStoreData: Estore): Promise<void> => {
};
