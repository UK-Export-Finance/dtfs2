// Number Generator API is used to get a new deal/facility id.
// However, the id might already be in use so we need to check it with ACBS.
//
// the flow is:
// 1) Call number generator Azure function
// 2) return a PENDING status while Azure function runs independently
// 3) Create a scheduled job to keep checking the Azure function status

import axios from 'axios';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
import * as durableFunctionsLogController from './durable-functions-log.controller';

dotenv.config();
const numberGeneratorFunctionUrl = process.env.AZURE_NUMBER_GENERATOR_FUNCTION_URL;

const callNumberGenerator = async ({ dealType, entityType, entityId, dealId, user }: any) => {
  const response: any = await axios({
    method: 'POST',
    url: `${numberGeneratorFunctionUrl}/api/orchestrators/numbergenerator`,
    data: {
      dealType,
      entityType,
      entityId,
      dealId,
      user,
    },
  }).catch((err: any) => ({
    err,
  }));

  if (response.err) {
    await durableFunctionsLogController.addDurableFunctionLog({
      type: 'NUMBER_GENERATOR',
      data: {
        dealType,
        entityType,
        entityId,
        dealId,
        user,
        error: await response.err.toJSON(),
      },
    });

    return {
      status: response.status || 500,
    };
  }

  const { id: instanceId, ...numberGeneratorFunctionUrls } = response.data;

  await durableFunctionsLogController.addDurableFunctionLog({
    type: 'NUMBER_GENERATOR',
    data: {
      instanceId,
      dealType,
      entityType,
      entityId,
      dealId,
      numberGeneratorFunctionUrls,
      user,
    },
  });

  return response;
};

export const callNumberGeneratorPOST = async (req: Request, res: Response) => {
  const { dealType, entityType, entityId, dealId, user } = req.body;

  console.log('Reference Data API - calling Number Generator');

  const { status } = await callNumberGenerator({
    dealType,
    entityType,
    entityId,
    dealId,
    user,
  });

  // Azure function returns 202 status but 200 is more relevant here as we're returning data
  const returnStatus = status === 202 ? 200 : status;
  return res.status(returnStatus).send({ ukefId: 'PENDING' });
};
