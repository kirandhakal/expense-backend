import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import {
  StickyNotesService,
  CreateStickyNoteInput,
  UpdateStickyNoteInput,
} from './sticky-notes.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/types/jwt-payload.interface';
import { WorkspaceId } from '../common/decorators/workspace-id.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../common/guards/workspace.guard';
import { StickyNote } from '../database/entities';

@Resolver(() => StickyNote)
@UseGuards(JwtAuthGuard, WorkspaceGuard)
export class StickyNotesResolver {
  constructor(private stickyNotesService: StickyNotesService) {}

  @Query(() => [StickyNote])
  stickyNotes(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.stickyNotesService.findAll(workspaceId, user.sub);
  }

  @Mutation(() => StickyNote)
  createStickyNote(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: JwtPayload,
    @Args('input') input: CreateStickyNoteInput,
  ) {
    return this.stickyNotesService.create(workspaceId, user.sub, input);
  }

  @Mutation(() => StickyNote)
  updateStickyNote(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: JwtPayload,
    @Args('id') id: string,
    @Args('input') input: UpdateStickyNoteInput,
  ) {
    return this.stickyNotesService.update(id, workspaceId, user.sub, input);
  }

  @Mutation(() => Boolean)
  deleteStickyNote(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: JwtPayload,
    @Args('id') id: string,
  ) {
    return this.stickyNotesService.delete(id, workspaceId, user.sub);
  }
}
