import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, Put } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RemindersService } from './reminders.service';

@Controller('reminders')
@UseGuards(AuthGuard('jwt'))
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Get()
  findAll(@Request() req) {
    return this.remindersService.findAll(req.user.userId);
  }

  @Post()
  create(@Request() req, @Body() body) {
    return this.remindersService.create(req.user.userId, body);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.remindersService.remove(req.user.userId, +id);
  }

  @Put(':id/read')
  markAsRead(@Request() req, @Param('id') id: string) {
      return this.remindersService.markAsRead(req.user.userId, +id);
  }
}
