import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password_hash))) {
      const { password_hash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: user,
    };
  }

  async register(email: string, pass: string, nombre: string): Promise<User> {
    // Check if exists
    const existing = await this.usersService.findOneByEmail(email);
    if (existing) {
        throw new UnauthorizedException('User already exists');
    }
    const salt = await bcrypt.genSalt();
    const password_hash = await bcrypt.hash(pass, salt);
    return this.usersService.create({ email, password_hash, nombre });
  }
}
