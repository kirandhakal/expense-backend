import { Args, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Field, Float, ObjectType } from '@nestjs/graphql';
import { DashboardService } from './dashboard.service';
import { WorkspaceId } from '../common/decorators/workspace-id.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../common/guards/workspace.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@ObjectType()
class DashboardSummary {
  @Field(() => Float) totalBalance: number;
  @Field(() => Float) totalIncome: number;
  @Field(() => Float) totalExpense: number;
  @Field(() => Float) totalSavings: number;
  @Field(() => Float) monthlyChange: number;
}

@ObjectType()
class CategoryBreakdown {
  @Field() category: string;
  @Field(() => Float) amount: number;
  @Field() color: string;
}

@ObjectType()
class MonthlyData {
  @Field() month: string;
  @Field(() => Float) income: number;
  @Field(() => Float) expense: number;
}

@ObjectType()
class MemberReport {
  @Field() memberId: string;
  @Field() name: string;
  @Field(() => Float) income: number;
  @Field(() => Float) expense: number;
}

@Resolver()
@UseGuards(JwtAuthGuard, WorkspaceGuard, PermissionsGuard)
export class DashboardResolver {
  constructor(private dashboardService: DashboardService) {}

  @RequirePermissions('transaction:read')
  @Query(() => DashboardSummary)
  dashboardSummary(
    @WorkspaceId() workspaceId: string,
    @Args('startDate', { nullable: true }) startDate?: string,
    @Args('endDate', { nullable: true }) endDate?: string,
  ) {
    return this.dashboardService.getSummary(workspaceId, startDate, endDate);
  }

  @RequirePermissions('transaction:read')
  @Query(() => [CategoryBreakdown])
  categoryBreakdown(
    @WorkspaceId() workspaceId: string,
    @Args('startDate', { nullable: true }) startDate?: string,
    @Args('endDate', { nullable: true }) endDate?: string,
  ) {
    return this.dashboardService.getCategoryBreakdown(workspaceId, startDate, endDate);
  }

  @RequirePermissions('transaction:read')
  @Query(() => [MonthlyData])
  monthlyData(@WorkspaceId() workspaceId: string) {
    return this.dashboardService.getMonthlyData(workspaceId);
  }

  @RequirePermissions('transaction:read')
  @Query(() => [MemberReport])
  memberReports(
    @WorkspaceId() workspaceId: string,
    @Args('startDate', { nullable: true }) startDate?: string,
    @Args('endDate', { nullable: true }) endDate?: string,
  ) {
    return this.dashboardService.getMemberReports(workspaceId, startDate, endDate);
  }
}
