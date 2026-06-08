import { Column, Entity, ManyToOne } from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
@Entity('audit_logs')
export class AuditLog extends BaseEntity {
  @Field()
  @Column()
  action: string;

  @Field()
  @Column()
  resource: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  resourceId?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  @Field({ nullable: true })
  @Column({ nullable: true })
  ipAddress?: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  user?: User;

  @Field({ nullable: true })
  @Column({ nullable: true })
  userId?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  sudoUserId?: string;
}
