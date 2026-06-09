import { Controller, Get, Body, UseGuards, Request, Put, Patch, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import * as bcrypt from 'bcrypt';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  getProfile(@Request() req) {
    return this.usersService.findOneById(req.user.userId);
  }

  @Put('profile')
  async updateProfile(@Request() req, @Body() body) {
    const allowedFields = ['nombre', 'email', 'avatar_color', 'moneda_principal'];
    const updateData: Record<string, any> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) updateData[field] = body[field];
    }
    const updated = await this.usersService.update(req.user.userId, updateData);
    const { password_hash, ...safe } = updated as any;
    return safe;
  }

  @Patch('password')
  async changePassword(@Request() req, @Body() body) {
    const { currentPassword, newPassword } = body;
    if (!currentPassword || !newPassword) {
      throw new BadRequestException('Se requieren la contraseña actual y la nueva.');
    }
    const user = await this.usersService.findOneById(req.user.userId);
    const valid = await bcrypt.compare(currentPassword, (user as any).password_hash);
    if (!valid) {
      throw new BadRequestException('La contraseña actual es incorrecta.');
    }
    const salt = await bcrypt.genSalt();
    const password_hash = await bcrypt.hash(newPassword, salt);
    await this.usersService.update(req.user.userId, { password_hash });
    return { message: 'Contraseña actualizada correctamente.' };
  }
}

