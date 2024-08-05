import { Request, Response } from 'express';
import { HttpStatusCode, isAxiosError } from 'axios';
import api from '../../api';

export const getSelectedFeeRecordsDetails = async (req: Request<{ id: number }, object, { feeRecordIds: number[] }>, res: Response) => {
  try {
    const { id } = req.params;
    const { feeRecordIds } = req.body;
    const SelectedFeeRecordsDetails = await api.getSelectedFeeRecordsDetails(id, feeRecordIds);
    res.status(200).send(SelectedFeeRecordsDetails);
  } catch (error) {
    const errorMessage = 'Failed to get selected fee records details';
    console.error(errorMessage, error);
    const statusCode = (isAxiosError(error) && error.response?.status) || HttpStatusCode.InternalServerError;
    res.status(statusCode).send(errorMessage);
  }
};
