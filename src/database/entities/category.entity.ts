import { Column, Entity, ManyToOne } from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { BaseEntity } from './base.entity';
import { Workspace } from './workspace.entity';

@ObjectType()
@Entity('categories')
export class Category extends BaseEntity {
  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  slug: string;

  @Field()
  @Column({ default: '#6366f1' })
  color: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  icon?: string;

  @Field()
  @Column({ default: true })
  isDefault: boolean;

  @ManyToOne(() => Workspace, (workspace) => workspace.categories, {
    onDelete: 'CASCADE',
  })
  workspace: Workspace;

  @Field()
  @Column()
  workspaceId: string;
}
