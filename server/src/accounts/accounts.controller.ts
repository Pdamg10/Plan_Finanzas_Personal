import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AccountsService } from './accounts.service';

@Controller('accounts')
@UseGuards(AuthGuard('jwt'))
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  findAll(@Request() req) {
    return this.accountsService.findAll(req.user.userId);
  }

  @Post()
  create(@Request() req, @Body() body) {
    return this.accountsService.create(req.user.userId, body);
  }

  @Put(':id')
  update(@Request() req, @Param('id') id: string, @Body() body) {
    return this.accountsService.update(req.user.userId, +id, body);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.accountsService.remove(req.user.userId, +id);
  }
}
