import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ChangePasswordInput,
  SudoPayload,
  UpdateProfileInput,
} from './dto/users.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/types/jwt-payload.interface';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { User, Workspace } from '../database/entities';

@Resolver()
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Mutation(() => User)
  updateProfile(
    @CurrentUser() user: JwtPayload,
    @Args('input') input: UpdateProfileInput,
  ) {
    return this.usersService.updateProfile(user.sub, input);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  changePassword(
    @CurrentUser() user: JwtPayload,
    @Args('input') input: ChangePasswordInput,
  ) {
    return this.usersService.changePassword(
      user.sub,
      input.currentPassword,
      input.newPassword,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => [User])
  allUsers(@CurrentUser() user: JwtPayload) {
    if (!user.isSuperAdmin) return [];
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => SudoPayload)
  sudoAsUser(
    @CurrentUser() user: JwtPayload,
    @Args('userId') userId: string,
  ) {
    return this.usersService.sudoAsUser(user, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  deactivateUser(
    @CurrentUser() user: JwtPayload,
    @Args('userId') userId: string,
  ) {
    return this.usersService.deactivateUser(user, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => [Workspace])
  allWorkspaces(@CurrentUser() user: JwtPayload) {
    if (!user.isSuperAdmin) return [];
    return this.usersService.listAllWorkspaces();
  }
}
