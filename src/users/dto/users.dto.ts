import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { User } from '../../database/entities';

@InputType()
export class UpdateProfileInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  firstName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  lastName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  avatar?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  country?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  timezone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  language?: string;
}

@InputType()
export class ChangePasswordInput {
  @Field()
  @IsNotEmpty()
  currentPassword: string;

  @Field()
  @MinLength(8)
  newPassword: string;
}

@ObjectType()
export class SudoPayload {
  @Field()
  accessToken: string;

  @Field(() => User)
  user: User;
}
