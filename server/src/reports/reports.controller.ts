import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReportsService } from './reports.service';

@Controller('reports')
@UseGuards(AuthGuard('jwt'))
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('expenses-by-category')
  getExpensesByCategory(@Request() req) {
    return this.reportsService.getExpensesByCategory(req.user.userId);
  }

  @Get('income-vs-expenses')
  getIncomeVsExpense(@Request() req) {
    return this.reportsService.getIncomeVsExpense(req.user.userId);
  }

  @Get('cashflow')
  getCashFlow(@Request() req) {
    return this.reportsService.getCashFlow(req.user.userId);
  }
}
