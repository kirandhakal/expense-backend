import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { WorkspaceType } from '../../database/entities';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class CreateWorkspaceInput {
  @Field()
  @IsNotEmpty()
  name: string;

  @Field(() => WorkspaceType)
  @IsEnum(WorkspaceType)
  type: WorkspaceType;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  currency?: string;
}

@InputType()
export class UpdateWorkspaceInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  currency?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  fiscalYearStart?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  fiscalYearEnd?: string;

  @Field(() => WorkspaceType, { nullable: true })
  @IsOptional()
  @IsEnum(WorkspaceType)
  type?: WorkspaceType;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  settings?: Record<string, unknown>;
}
