import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { OnboardingState, SaveOnboardingStepInput } from './dto/onboarding.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/types/jwt-payload.interface';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import type { Request } from 'express';

@Resolver()
@UseGuards(JwtAuthGuard)
export class OnboardingResolver {
  constructor(private onboardingService: OnboardingService) {}

  private workspaceFromReq(req: Request): string | undefined {
    const header = req.headers['x-workspace-id'];
    return typeof header === 'string' ? header : undefined;
  }

  @Query(() => OnboardingState)
  onboardingState(
    @CurrentUser() user: JwtPayload,
    @Context() ctx: { req: Request },
  ) {
    return this.onboardingService.getState(user.sub, this.workspaceFromReq(ctx.req));
  }

  @Mutation(() => OnboardingState)
  saveOnboardingStep(
    @CurrentUser() user: JwtPayload,
    @Args('input') input: SaveOnboardingStepInput,
    @Context() ctx: { req: Request },
  ) {
    return this.onboardingService.saveStep(
      user.sub,
      this.workspaceFromReq(ctx.req),
      input,
    );
  }

  @Mutation(() => OnboardingState)
  completeOnboarding(
    @CurrentUser() user: JwtPayload,
    @Context() ctx: { req: Request },
  ) {
    return this.onboardingService.complete(user.sub, this.workspaceFromReq(ctx.req));
  }
}
