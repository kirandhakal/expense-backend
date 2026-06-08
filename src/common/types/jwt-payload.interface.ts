export interface JwtPayload {
  sub: string;
  email: string;
  isSuperAdmin: boolean;
  sudoUserId?: string;
}
