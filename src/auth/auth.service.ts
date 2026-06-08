import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { authenticator } from '@otplib/preset-default';
import * as QRCode from 'qrcode';
import { MailerService } from '@nestjs-modules/mailer';
import {
  EmailVerificationToken,
  MfaSecret,
  PasswordResetToken,
  RefreshToken,
  User,
  Workspace,
  WorkspaceMember,
  WorkspaceType,
} from '../database/entities';
import { SeedService } from '../database/seed/seed.service';
import {
  AuthPayload,
  LoginInput,
  MfaSetupPayload,
  RegisterInput,
} from './dto/auth.dto';
import type { JwtPayload } from '../common/types/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(RefreshToken) private refreshRepo: Repository<RefreshToken>,
    @InjectRepository(Workspace) private workspaceRepo: Repository<Workspace>,
    @InjectRepository(WorkspaceMember) private memberRepo: Repository<WorkspaceMember>,
    @InjectRepository(EmailVerificationToken)
    private emailTokenRepo: Repository<EmailVerificationToken>,
    @InjectRepository(PasswordResetToken)
    private passwordTokenRepo: Repository<PasswordResetToken>,
    @InjectRepository(MfaSecret) private mfaRepo: Repository<MfaSecret>,
    private jwtService: JwtService,
    private config: ConfigService,
    private mailer: MailerService,
    private seedService: SeedService,
  ) {}

  async register(input: RegisterInput): Promise<AuthPayload> {
    const existing = await this.userRepo.findOne({ where: { email: input.email } });
    if (existing) throw new BadRequestException('Email already registered');

    const user = await this.userRepo.save({
      email: input.email,
      passwordHash: await bcrypt.hash(input.password, 12),
      firstName: input.firstName,
      lastName: input.lastName,
    });

    const workspace = await this.workspaceRepo.save({
      name: `${user.firstName}'s Workspace`,
      type: WorkspaceType.PERSONAL,
      currency: 'USD',
    });

    await this.seedService.seedWorkspaceDefaults(workspace.id);
    const ownerRole = await this.seedService.createSystemRoles(workspace.id);

    await this.memberRepo.save({
      userId: user.id,
      workspaceId: workspace.id,
      roleId: ownerRole.id,
    });

    await this.sendVerificationEmail(user);
    return this.generateTokens(user);
  }

  async login(input: LoginInput, deviceInfo?: string): Promise<AuthPayload> {
    const user = await this.userRepo.findOne({ where: { email: input.email } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    if (user.mfaEnabled) {
      if (!input.mfaCode) {
        return { accessToken: '', refreshToken: '', user, requiresMfa: true };
      }
      await this.verifyMfaCode(user.id, input.mfaCode);
    }

    return this.generateTokens(user, deviceInfo);
  }

  async refreshToken(token: string, deviceInfo?: string): Promise<AuthPayload> {
    const tokens = await this.refreshRepo.find({
      where: { isRevoked: false },
      relations: { user: true },
    });

    let matched: RefreshToken | null = null;
    for (const rt of tokens) {
      if (await bcrypt.compare(token, rt.tokenHash)) {
        if (rt.expiresAt < new Date()) {
          rt.isRevoked = true;
          await this.refreshRepo.save(rt);
          throw new UnauthorizedException('Refresh token expired');
        }
        matched = rt;
        break;
      }
    }

    if (!matched) throw new UnauthorizedException('Invalid refresh token');

    matched.isRevoked = true;
    await this.refreshRepo.save(matched);

    return this.generateTokens(matched.user, deviceInfo);
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      const tokens = await this.refreshRepo.find({ where: { userId, isRevoked: false } });
      for (const rt of tokens) {
        if (await bcrypt.compare(refreshToken, rt.tokenHash)) {
          rt.isRevoked = true;
          await this.refreshRepo.save(rt);
        }
      }
    }
    return true;
  }

  async logoutAll(userId: string) {
    await this.refreshRepo.update({ userId }, { isRevoked: true });
    return true;
  }

  async verifyEmail(token: string) {
    const record = await this.emailTokenRepo.findOne({
      where: { token, isUsed: false },
      relations: { user: true },
    });
    if (!record || record.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired token');
    }

    record.isUsed = true;
    await this.emailTokenRepo.save(record);
    await this.userRepo.update(record.userId, { isEmailVerified: true });
    return true;
  }

  async forgotPassword(email: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) return true;

    const token = crypto.randomBytes(32).toString('hex');
    await this.passwordTokenRepo.save({
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + 3600000),
    });

    const frontendUrl = this.config.get('FRONTEND_URL', 'http://localhost:3000');
    await this.mailer.sendMail({
      to: email,
      subject: 'Reset your password',
      html: `<p>Click <a href="${frontendUrl}/reset-password?token=${token}">here</a> to reset your password.</p>`,
    });

    return true;
  }

  async resetPassword(token: string, newPassword: string) {
    const record = await this.passwordTokenRepo.findOne({
      where: { token, isUsed: false },
    });
    if (!record || record.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired token');
    }

    record.isUsed = true;
    await this.passwordTokenRepo.save(record);
    await this.userRepo.update(record.userId, {
      passwordHash: await bcrypt.hash(newPassword, 12),
    });
    await this.logoutAll(record.userId);
    return true;
  }

  async deactivateAccount(userId: string) {
    await this.userRepo.update(userId, { isActive: false });
    await this.logoutAll(userId);
    return true;
  }

  async setupMfa(userId: string): Promise<MfaSetupPayload> {
    const secret = authenticator.generateSecret();
    const user = await this.userRepo.findOneOrFail({ where: { id: userId } });
    const backupCodes = Array.from({ length: 10 }, () =>
      crypto.randomBytes(4).toString('hex'),
    );

    const hashedCodes = await Promise.all(
      backupCodes.map((c) => bcrypt.hash(c, 10)),
    );

    await this.mfaRepo.save({
      userId,
      secret,
      backupCodes: hashedCodes,
    });

    const otpauth = authenticator.keyuri(user.email, 'ExpenseTracker', secret);
    const qrCodeUrl = await QRCode.toDataURL(otpauth);

    return { secret, qrCodeUrl, backupCodes };
  }

  async enableMfa(userId: string, code: string) {
    await this.verifyMfaCode(userId, code);
    await this.userRepo.update(userId, { mfaEnabled: true });
    return true;
  }

  async disableMfa(userId: string, code: string) {
    await this.verifyMfaCode(userId, code);
    await this.userRepo.update(userId, { mfaEnabled: false });
    await this.mfaRepo.delete({ userId });
    return true;
  }

  private async verifyMfaCode(userId: string, code: string) {
    const mfa = await this.mfaRepo.findOne({ where: { userId } });
    if (!mfa) throw new BadRequestException('MFA not configured');

    const valid = authenticator.verify({ token: code, secret: mfa.secret });
    if (!valid) {
      for (let i = 0; i < mfa.backupCodes.length; i++) {
        if (await bcrypt.compare(code, mfa.backupCodes[i])) {
          mfa.backupCodes.splice(i, 1);
          await this.mfaRepo.save(mfa);
          return;
        }
      }
      throw new UnauthorizedException('Invalid MFA code');
    }
  }

  private async sendVerificationEmail(user: User) {
    const token = crypto.randomBytes(32).toString('hex');
    await this.emailTokenRepo.save({
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + 86400000),
    });

    const frontendUrl = this.config.get('FRONTEND_URL', 'http://localhost:3000');
    await this.mailer.sendMail({
      to: user.email,
      subject: 'Verify your email',
      html: `<p>Click <a href="${frontendUrl}/verify-email?token=${token}">here</a> to verify your email.</p>`,
    });
  }

  private async generateTokens(user: User, deviceInfo?: string): Promise<AuthPayload> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      isSuperAdmin: user.isSuperAdmin,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.getOrThrow('JWT_SECRET'),
      expiresIn: this.config.get('JWT_ACCESS_EXPIRES_IN', '15m'),
    });

    const refreshToken = crypto.randomBytes(64).toString('hex');
    const refreshExpires = this.config.get('JWT_REFRESH_EXPIRES_IN', '7d');
    const days = parseInt(refreshExpires) || 7;

    await this.refreshRepo.save({
      tokenHash: await bcrypt.hash(refreshToken, 10),
      userId: user.id,
      expiresAt: new Date(Date.now() + days * 86400000),
      deviceInfo,
    });

    return { accessToken, refreshToken, user };
  }
}
