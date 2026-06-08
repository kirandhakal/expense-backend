import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { SoftDeleteEntity } from './base.entity';
import { RefreshToken } from './refresh-token.entity';
import { WorkspaceMember } from './workspace-member.entity';
import { MfaSecret } from './mfa-secret.entity';

@ObjectType()
@Entity('users')
export class User extends SoftDeleteEntity {
  @Field()
  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Field()
  @Column()
  firstName: string;

  @Field()
  @Column()
  lastName: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  avatar?: string;

  @Field()
  @Column({ default: false })
  isEmailVerified: boolean;

  @Field()
  @Column({ default: false })
  isSuperAdmin: boolean;

  @Field()
  @Column({ default: true })
  isActive: boolean;

  @Field()
  @Column({ default: false })
  mfaEnabled: boolean;

  @OneToMany(() => RefreshToken, (token) => token.user)
  refreshTokens: RefreshToken[];

  @OneToMany(() => WorkspaceMember, (member) => member.user)
  workspaceMemberships: WorkspaceMember[];

  @OneToOne(() => MfaSecret, (mfa) => mfa.user)
  mfaSecret?: MfaSecret;
}
