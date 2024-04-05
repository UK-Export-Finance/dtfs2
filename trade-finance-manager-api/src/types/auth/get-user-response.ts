import { TfmUser } from "../db-models/tfm-users";

export type GetUserResponse = {found: boolean; canProceed?: boolean; user?: TfmUser};