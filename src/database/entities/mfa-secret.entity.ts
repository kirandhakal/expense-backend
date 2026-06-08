import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity('mfa_secrets')
export class MfaSecret extends BaseEntity {
  @Column()
  secret: string;

  @Column('simple-array', { default: '' })
  backupCodes: string[];

  @OneToOne(() => User, (user) => user.mfaSecret, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column()
  userId: string;
}
