import { isAxiosError, HttpStatusCode } from 'axios';
import { Response } from 'express';
import api from '../../api';
import { CustomExpressRequest } from '../../../types/custom-express-request';
import { TfmSessionUser } from '../../../types/tfm-session-user';

export type PostRemoveFeesFromPaymentGroupRequestBody = {
  selectedFeeRecordIds: number[];
  user: TfmSessionUser;
};

export type PostRemoveFeesFromPaymentGroupRequestParams = {
  reportId: string;
  paymentId: string;
};

export type PostRemoveFeesFromPaymentGroupRequest = CustomExpressRequest<{
  reqBody: PostRemoveFeesFromPaymentGroupRequestBody;
  params: PostRemoveFeesFromPaymentGroupRequestParams;
}>;

export const postRemoveFeesFromPaymentGroup = async (req: PostRemoveFeesFromPaymentGroupRequest, res: Response) => {
  try {
    const { reportId, paymentId } = req.params;
    const { selectedFeeRecordIds, user } = req.body;

    await api.removeFeesFromPaymentGroup(reportId, paymentId, selectedFeeRecordIds, user);
    return res.sendStatus(HttpStatusCode.Ok);
  } catch (error) {
    const errorMessage = 'Failed to remove fees from payment group';
    const errorStatus = (isAxiosError(error) && error.response?.status) || HttpStatusCode.InternalServerError;
    console.error(errorMessage, error);
    return res.status(errorStatus).send(errorMessage);
  }
};
