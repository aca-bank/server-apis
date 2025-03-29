import { JwtService } from '@nestjs/jwt';
import appConfigFn from 'src/app/app.config';

import { TokensResponse } from './auth.types';

const appConfig = appConfigFn();

type GetTokensParams = {
  jwtService: JwtService;
  jwtPayload: {
    userId: string;
    accountId: string;
    username: string;
    name: string;
    role: string;
  };
};

export const getTokens = async ({
  jwtService,
  jwtPayload,
}: GetTokensParams): Promise<TokensResponse> => {
  const [at, rt] = await Promise.all([
    jwtService.signAsync(jwtPayload, {
      secret: appConfig.jwt.accessTokenSecret,
      expiresIn: 60 * 60 * 24, // Access token expired after 1 day
    }),
    jwtService.signAsync(jwtPayload, {
      secret: appConfig.jwt.refreshTokenSecret,
      expiresIn: 60 * 60 * 24 * 7, // Access token expired after 7 days
    }),
  ]);

  return { accessToken: at, refreshToken: rt };
};
