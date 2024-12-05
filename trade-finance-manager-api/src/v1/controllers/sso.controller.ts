import { NextFunction } from 'express';
import { GetAuthCodeUrlApiRequest, GetAuthCodeUrlApiResponse } from '@ukef/dtfs2-common';
import { EntraIdService } from '../services/entra-id.service';

export class SsoController {
  private readonly entraIdService: EntraIdService;

  constructor({ entraIdService }: { entraIdService: EntraIdService }) {
    this.entraIdService = entraIdService;
  }

  async getAuthCodeUrl(req: GetAuthCodeUrlApiRequest, res: GetAuthCodeUrlApiResponse, next: NextFunction) {
    try {
      const { successRedirect } = req.params;
      const getAuthCodeUrlResponse = await this.entraIdService.getAuthCodeUrl({ successRedirect });
      return res.json(getAuthCodeUrlResponse);
    } catch (error) {
      return next(error);
    }
  }
}
