import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StickyNote } from '../database/entities';
import { StickyNotesService } from './sticky-notes.service';
import { StickyNotesResolver } from './sticky-notes.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([StickyNote])],
  providers: [StickyNotesService, StickyNotesResolver],
})
export class StickyNotesModule {}
