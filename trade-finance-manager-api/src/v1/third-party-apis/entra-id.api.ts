import axios from 'axios';
import { EntraIdConfig } from '../configs/entra-id.config';

type GetAuthCodeUrlResponse = unknown;

export class EntraIdApi {
  private readonly entraIdConfig: EntraIdConfig;

  constructor({ entraIdConfig }: { entraIdConfig: EntraIdConfig }) {
    this.entraIdConfig = entraIdConfig;
  }

  public async getAuthorityMetadataUrl(): Promise<GetAuthCodeUrlResponse> {
    const response = await axios.get<GetAuthCodeUrlResponse>(this.entraIdConfig.authorityMetadataUrl);
    return response.data;
  }
}
