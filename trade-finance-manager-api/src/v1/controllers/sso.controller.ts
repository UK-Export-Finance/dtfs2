import { GetAuthCodeUrlApiRequest, GetAuthCodeUrlApiResponse } from '@ukef/dtfs2-common';
import { EntraIdService } from '../services/entra-id.service';

export class SsoController {
  private readonly entraIdService: EntraIdService;

  constructor({ entraIdService }: { entraIdService: EntraIdService }) {
    this.entraIdService = entraIdService;
  }

  async getAuthCodeUrl(req: GetAuthCodeUrlApiRequest, res: GetAuthCodeUrlApiResponse) {
    try {
      const getAuthCodeUrlResponse = await this.entraIdService.getAuthCodeUrl(req.params);
      res.json(getAuthCodeUrlResponse);
    } catch (error) {
      console.error('An error occurred while getting the auth code URL:', error);
      throw error;
    }
  }
}
