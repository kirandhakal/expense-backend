import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  EmailVerificationToken,
  MfaSecret,
  PasswordResetToken,
  RefreshToken,
  User,
  Workspace,
  WorkspaceMember,
} from '../database/entities';
import { SeedModule } from '../database/seed/seed.module';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      User,
      RefreshToken,
      Workspace,
      WorkspaceMember,
      EmailVerificationToken,
      PasswordResetToken,
      MfaSecret,
    ]),
    SeedModule,
  ],
  providers: [AuthService, AuthResolver, JwtStrategy],
  exports: [AuthService, JwtStrategy],
})
export class AuthModule {}
