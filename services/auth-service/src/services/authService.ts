// services/auth-service/src/services/authService.ts

import { Repository } from 'typeorm';
import jwt, { VerifyErrors } from 'jsonwebtoken';
import { User } from '../models/user.model';
import { RefreshToken } from '../models/refreshToken.model';
import { hashPassword, comparePassword } from '../utils/hash';
import {
  JWT_SECRET,
  ACCESS_TOKEN_EXPIRE_MINUTES,
  REFRESH_TOKEN_EXPIRE_DAYS,
  ALGORITHM,
} from '../configs/config';

interface TokenPair {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
}

export class AuthService {
  constructor(
    private userRepo: Repository<User>,
    private tokenRepo: Repository<RefreshToken>
  ) {}

  async signup(
    email: string,
    name: string | undefined,
    password: string
  ): Promise<TokenPair> {
    const exists = await this.userRepo.findOne({ where: { email } });
    if (exists) throw new Error('Email already in use');

    const passwordHash = await hashPassword(password);
    const user = this.userRepo.create({ email, name, passwordHash });
    await this.userRepo.save(user);

    return this.createTokenPair(user);
  }

  async login(email: string, password: string): Promise<TokenPair> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new Error('Invalid credentials');

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) throw new Error('Invalid credentials');

    return this.createTokenPair(user);
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    const stored = await this.tokenRepo.findOne({
      where: { token: refreshToken, revoked: false },
      relations: ['user'],
    });
    if (!stored) throw new Error('Invalid refresh token');

    // Verify and restrict to our algorithm
    jwt.verify(
      refreshToken,
      JWT_SECRET,
      { algorithms: [ALGORITHM as jwt.Algorithm] },
      (err: VerifyErrors | null) => {
        if (err) throw new Error('Invalid or expired refresh token');
      }
    );

    // Revoke old token
    stored.revoked = true;
    await this.tokenRepo.save(stored);

    // Issue new access token
    const { accessToken } = this.generateAccessToken(stored.user.id);
    return { accessToken };
  }

  private async createTokenPair(user: User): Promise<TokenPair> {
    // Ensure 'sub' is a string
    const subject = String(user.id);
    const payload = { sub: subject };

    const accessToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: `${ACCESS_TOKEN_EXPIRE_MINUTES}m`,
      algorithm: ALGORITHM as jwt.Algorithm,
    });
    const expiresIn = ACCESS_TOKEN_EXPIRE_MINUTES * 60;

    const refreshToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: `${REFRESH_TOKEN_EXPIRE_DAYS}d`,
      algorithm: ALGORITHM as jwt.Algorithm,
    });

    const expiresAt = new Date(
      Date.now() + REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60 * 1000
    );
    const tokenEntity = this.tokenRepo.create({
      user,
      token: refreshToken,
      expiresAt,
    });
    await this.tokenRepo.save(tokenEntity);

    return { accessToken, expiresIn, refreshToken };
  }

  private generateAccessToken(userId: number): {
    accessToken: string;
    expiresIn: number;
  } {
    // Ensure 'sub' is a string
    const payload = { sub: String(userId) };
    const accessToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: `${ACCESS_TOKEN_EXPIRE_MINUTES}m`,
      algorithm: ALGORITHM as jwt.Algorithm,
    });
    return { accessToken, expiresIn: ACCESS_TOKEN_EXPIRE_MINUTES * 60 };
  }
}