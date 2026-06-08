import { Column, Entity, ManyToOne } from 'typeorm';
import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { BaseEntity } from './base.entity';
import { Workspace } from './workspace.entity';
import { Role } from './role.entity';
import { User } from './user.entity';

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
}

registerEnumType(InvitationStatus, { name: 'InvitationStatus' });

@ObjectType()
@Entity('invitations')
export class Invitation extends BaseEntity {
  @Field()
  @Column()
  email: string;

  @Field()
  @Column()
  token: string;

  @Field(() => InvitationStatus)
  @Column({
    type: 'enum',
    enum: InvitationStatus,
    default: InvitationStatus.PENDING,
  })
  status: InvitationStatus;

  @Field()
  @Column()
  expiresAt: Date;

  @ManyToOne(() => Workspace, { onDelete: 'CASCADE' })
  workspace: Workspace;

  @Field()
  @Column()
  workspaceId: string;

  @ManyToOne(() => Role, { onDelete: 'CASCADE' })
  role: Role;

  @Field()
  @Column()
  roleId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  invitedBy: User;

  @Column()
  invitedById: string;
}
