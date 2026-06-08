import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsUUID } from 'class-validator';

@InputType()
export class InviteMemberInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsUUID()
  roleId: string;
}

@InputType()
export class UpdateMemberRoleInput {
  @Field()
  @IsUUID()
  memberId: string;

  @Field()
  @IsUUID()
  roleId: string;
}

@InputType()
export class AcceptInvitationInput {
  @Field()
  @IsNotEmpty()
  token: string;
}
