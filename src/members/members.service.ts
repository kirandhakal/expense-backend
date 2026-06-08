import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import {
  Invitation,
  InvitationStatus,
  Notification,
  Role,
  User,
  WorkspaceMember,
} from '../database/entities';
import { InviteMemberInput } from './dto/members.dto';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(WorkspaceMember) private memberRepo: Repository<WorkspaceMember>,
    @InjectRepository(Invitation) private invitationRepo: Repository<Invitation>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    @InjectRepository(Notification) private notificationRepo: Repository<Notification>,
    private mailer: MailerService,
    private config: ConfigService,
  ) {}

  async findByWorkspace(workspaceId: string) {
    const members = await this.memberRepo.find({
      where: { workspaceId, isActive: true },
      relations: { user: true, role: true },
    });

    return members.map((m) => ({
      id: m.id,
      userId: m.userId,
      name: `${m.user.firstName} ${m.user.lastName}`,
      email: m.user.email,
      role: m.role.name,
      roleId: m.roleId,
      avatar: m.user.avatar || `${m.user.firstName[0]}${m.user.lastName[0]}`,
      joinedDate: m.createdAt.toISOString().split('T')[0],
      accountType: '',
    }));
  }

  async invite(workspaceId: string, invitedById: string, input: InviteMemberInput) {
    const role = await this.roleRepo.findOne({
      where: { id: input.roleId, workspaceId },
    });
    if (!role) throw new NotFoundException('Role not found');

    const existing = await this.invitationRepo.findOne({
      where: { email: input.email, workspaceId, status: InvitationStatus.PENDING },
    });
    if (existing) throw new BadRequestException('Invitation already pending');

    const token = crypto.randomBytes(32).toString('hex');
    const invitation = await this.invitationRepo.save({
      email: input.email,
      token,
      workspaceId,
      roleId: input.roleId,
      invitedById,
      expiresAt: new Date(Date.now() + 7 * 86400000),
    });

    const frontendUrl = this.config.get('FRONTEND_URL', 'http://localhost:3000');
    await this.mailer.sendMail({
      to: input.email,
      subject: 'You have been invited to a workspace',
      html: `<p>You've been invited. <a href="${frontendUrl}/accept-invite?token=${token}">Accept invitation</a></p>`,
    });

    return invitation;
  }

  async acceptInvitation(token: string, userId: string) {
    const invitation = await this.invitationRepo.findOne({
      where: { token, status: InvitationStatus.PENDING },
      relations: { workspace: true },
    });

    if (!invitation || invitation.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired invitation');
    }

    const user = await this.userRepo.findOneOrFail({ where: { id: userId } });
    if (user.email !== invitation.email) {
      throw new BadRequestException('Invitation email does not match your account');
    }

    const existing = await this.memberRepo.findOne({
      where: { userId, workspaceId: invitation.workspaceId },
    });
    if (existing) throw new BadRequestException('Already a member');

    await this.memberRepo.save({
      userId,
      workspaceId: invitation.workspaceId,
      roleId: invitation.roleId,
    });

    invitation.status = InvitationStatus.ACCEPTED;
    await this.invitationRepo.save(invitation);

    await this.notificationRepo.save({
      userId: invitation.invitedById,
      title: 'Invitation Accepted',
      message: `${user.firstName} ${user.lastName} joined your workspace`,
      type: 'invitation_accepted',
    });

    return invitation.workspace;
  }

  async updateRole(workspaceId: string, memberId: string, roleId: string) {
    const member = await this.memberRepo.findOne({
      where: { id: memberId, workspaceId },
    });
    if (!member) throw new NotFoundException('Member not found');

    member.roleId = roleId;
    await this.memberRepo.save(member);
    return this.findByWorkspace(workspaceId);
  }

  async remove(workspaceId: string, memberId: string) {
    const member = await this.memberRepo.findOne({
      where: { id: memberId, workspaceId },
    });
    if (!member) throw new NotFoundException('Member not found');

    member.isActive = false;
    await this.memberRepo.save(member);
    return true;
  }
}
