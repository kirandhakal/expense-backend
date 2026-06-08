import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  AuthPayload,
  ForgotPasswordInput,
  LoginInput,
  MfaSetupPayload,
  MfaVerifyInput,
  RefreshTokenInput,
  RegisterInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from './dto/auth.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/types/jwt-payload.interface';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { User } from '../database/entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Resolver()
export class AuthResolver {
  constructor(
    private authService: AuthService,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  @Public()
  @Mutation(() => AuthPayload)
  register(@Args('input') input: RegisterInput) {
    return this.authService.register(input);
  }

  @Public()
  @Mutation(() => AuthPayload)
  login(@Args('input') input: LoginInput) {
    return this.authService.login(input);
  }

  @Public()
  @Mutation(() => AuthPayload)
  refreshToken(@Args('input') input: RefreshTokenInput) {
    return this.authService.refreshToken(input.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  logout(
    @CurrentUser() user: JwtPayload,
    @Args('refreshToken', { nullable: true }) refreshToken?: string,
  ) {
    return this.authService.logout(user.sub, refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  logoutAll(@CurrentUser() user: JwtPayload) {
    return this.authService.logoutAll(user.sub);
  }

  @Public()
  @Mutation(() => Boolean)
  verifyEmail(@Args('input') input: VerifyEmailInput) {
    return this.authService.verifyEmail(input.token);
  }

  @Public()
  @Mutation(() => Boolean)
  forgotPassword(@Args('input') input: ForgotPasswordInput) {
    return this.authService.forgotPassword(input.email);
  }

  @Public()
  @Mutation(() => Boolean)
  resetPassword(@Args('input') input: ResetPasswordInput) {
    return this.authService.resetPassword(input.token, input.newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  deactivateAccount(@CurrentUser() user: JwtPayload) {
    return this.authService.deactivateAccount(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => MfaSetupPayload)
  setupMfa(@CurrentUser() user: JwtPayload) {
    return this.authService.setupMfa(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  enableMfa(
    @CurrentUser() user: JwtPayload,
    @Args('input') input: MfaVerifyInput,
  ) {
    return this.authService.enableMfa(user.sub, input.code);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  disableMfa(
    @CurrentUser() user: JwtPayload,
    @Args('input') input: MfaVerifyInput,
  ) {
    return this.authService.disableMfa(user.sub, input.code);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => User)
  me(@CurrentUser() user: JwtPayload) {
    return this.userRepo.findOneOrFail({ where: { id: user.sub } });
  }
}
