import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RecurringService } from './recurring.service';

@Controller('recurring')
@UseGuards(AuthGuard('jwt'))
export class RecurringController {
  constructor(private readonly recurringService: RecurringService) {}

  @Get()
  findAll(@Request() req) {
    return this.recurringService.findAll(req.user.userId);
  }

  @Post()
  create(@Request() req, @Body() body) {
    return this.recurringService.create(req.user.userId, body);
  }

  @Put(':id')
  update(@Request() req, @Param('id') id: string, @Body() body) {
    return this.recurringService.update(req.user.userId, +id, body);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.recurringService.remove(req.user.userId, +id);
  }

  @Post('process')
  process(@Request() req) {
      return this.recurringService.processRecurring(req.user.userId);
  }
}
