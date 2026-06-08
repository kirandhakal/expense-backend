import { Args, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SearchService, SearchResult } from './search.service';
import { WorkspaceId } from '../common/decorators/workspace-id.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../common/guards/workspace.guard';

@Resolver()
@UseGuards(JwtAuthGuard, WorkspaceGuard)
export class SearchResolver {
  constructor(private searchService: SearchService) {}

  @Query(() => [SearchResult])
  search(
    @WorkspaceId() workspaceId: string,
    @Args('query') query: string,
  ) {
    return this.searchService.search(workspaceId, query);
  }
}
