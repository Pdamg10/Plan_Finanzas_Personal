import { Controller, Get, Body, UseGuards, Request, Put } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  getProfile(@Request() req) {
    return this.usersService.findOneById(req.user.userId);
  }

  @Put('profile')
  updateProfile(@Request() req, @Body() body) {
      // Prevent updating sensitive fields like password directly here if strictly following best practices, 
      // but for this MVP we assume the body contains safe fields or we filter them in service if needed.
      //Ideally we should use a DTO.
      const { password, ...updateData } = body; 
      return this.usersService.update(req.user.userId, updateData);
  }
}
