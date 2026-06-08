import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StickyNote } from '../database/entities';
import { Field, Float, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';

@InputType()
export class CreateStickyNoteInput {
  @Field() @IsNotEmpty() content: string;
  @Field({ nullable: true }) @IsOptional() color?: string;
  @Field(() => Float, { nullable: true }) @IsOptional() x?: number;
  @Field(() => Float, { nullable: true }) @IsOptional() y?: number;
  @Field({ nullable: true }) @IsOptional() page?: string;
}

@InputType()
export class UpdateStickyNoteInput {
  @Field({ nullable: true }) @IsOptional() content?: string;
  @Field({ nullable: true }) @IsOptional() color?: string;
  @Field(() => Float, { nullable: true }) @IsOptional() x?: number;
  @Field(() => Float, { nullable: true }) @IsOptional() y?: number;
  @Field({ nullable: true }) @IsOptional() page?: string;
}

@Injectable()
export class StickyNotesService {
  constructor(
    @InjectRepository(StickyNote) private noteRepo: Repository<StickyNote>,
  ) {}

  findAll(workspaceId: string, userId: string) {
    return this.noteRepo.find({
      where: { workspaceId, userId },
      order: { createdAt: 'DESC' },
    });
  }

  create(workspaceId: string, userId: string, input: CreateStickyNoteInput) {
    return this.noteRepo.save({ ...input, workspaceId, userId });
  }

  async update(id: string, workspaceId: string, userId: string, input: UpdateStickyNoteInput) {
    const note = await this.noteRepo.findOne({ where: { id, workspaceId, userId } });
    if (!note) throw new NotFoundException('Note not found');
    await this.noteRepo.update(id, input);
    return this.noteRepo.findOneOrFail({ where: { id } });
  }

  async delete(id: string, workspaceId: string, userId: string) {
    const note = await this.noteRepo.findOne({ where: { id, workspaceId, userId } });
    if (!note) throw new NotFoundException('Note not found');
    await this.noteRepo.softDelete(id);
    return true;
  }
}
