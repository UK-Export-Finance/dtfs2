import { getAuthRouter, getUnauthenticatedAuthRouter } from './configs';

export const authRoutes = getAuthRouter();
export const unauthenticatedAuthRoutes = getUnauthenticatedAuthRouter();
