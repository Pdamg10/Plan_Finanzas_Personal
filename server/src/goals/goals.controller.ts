import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GoalsService } from './goals.service';

@Controller('goals')
@UseGuards(AuthGuard('jwt'))
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Get()
  findAll(@Request() req) {
    return this.goalsService.findAll(req.user.userId);
  }

  @Post()
  create(@Request() req, @Body() body) {
    return this.goalsService.create(req.user.userId, body);
  }

  @Put(':id')
  update(@Request() req, @Param('id') id: string, @Body() body) {
    return this.goalsService.update(req.user.userId, +id, body);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.goalsService.remove(req.user.userId, +id);
  }
}
