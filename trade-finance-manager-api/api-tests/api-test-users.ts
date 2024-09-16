import { AnyObject } from '@ukef/dtfs2-common';
import { Response } from 'supertest';
import { createApi } from './api';
import MOCK_USERS from '../src/v1/__mocks__/mock-users';
import { MockUser } from './types/mock-user';

const loginTestUser = async (
  post: (data: AnyObject) => {
    to: (url: string) => Promise<Response>;
  },
  user: { password: string; username: string },
): Promise<{ token: string; userId: string }> => {
  const loginResponse = await post({ username: user.username, password: user.password }).to('/v1/login');

  const {
    token,
    user: { _id: userId },
  } = loginResponse.body as { token: string; user: { _id: string } };

  return { token, userId };
};

export const initialiseTestUsers = async (app: unknown): Promise<MockUser> => {
  const { post } = createApi(app);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const mockUser = MOCK_USERS[0] as Omit<MockUser, 'token'>;

  // Add rest of the users

  let token;
  let userId;

  ({ token, userId } = await loginTestUser(post, mockUser));

  if (!token) {
    await post(mockUser).to('/v1/user');

    ({ token, userId } = await loginTestUser(post, mockUser));
  }

  // return the builder (break everything)
  return { ...mockUser, token, _id: userId };
};
