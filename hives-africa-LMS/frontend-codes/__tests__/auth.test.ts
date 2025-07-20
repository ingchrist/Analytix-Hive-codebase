
import { signup } from '../services/auth';
import { apiClient } from '../services/api-client';
import { TSignup } from '../types';

jest.mock('../services/api-client');

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('signup', () => {
  it('should call the api client with the correct data', async () => {
    const signupData: TSignup = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockResponse = {
      data: {
        user: {
          id: '1',
          email: 'test@example.com',
        },
        refresh: 'refresh_token',
        access: 'access_token',
      },
    };

    mockedApiClient.post.mockResolvedValue(mockResponse);

    await signup(signupData);

    expect(mockedApiClient.post).toHaveBeenCalledWith('/auth/register/', signupData);
  });
});
