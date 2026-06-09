import { Controller, Post, Get, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { DecisionSupportService } from './decision-support.service';
import { EvaluateBudgetDto } from './dto/evaluate-budget.dto';

@Controller('decision-support')
export class DecisionSupportController {
  constructor(private readonly supportService: DecisionSupportService) {}

  @Post('evaluate')
  @HttpCode(HttpStatus.OK)
  async evaluate(@Body() dto: EvaluateBudgetDto) {
    return this.supportService.calculateFinancialDiagnostics(dto);
  }

  @Post('profile')
  @HttpCode(HttpStatus.CREATED)
  async createProfile(
    @Body() body: { region_geografica: string; miembros_hogar: number; rango_edad_principal: string; ingreso_mensual_neto: number }
  ) {
    return this.supportService.createProfile(body);
  }

  @Get('products')
  async getProducts() {
    return this.supportService.getProducts();
  }
}
