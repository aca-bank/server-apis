export class JwtPayload {
  id: string;
  email: string;
}

export class TokensResponse {
  accessToken: string;
  refreshToken: string;
}
