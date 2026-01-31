import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoalsService } from './goals.service';
import { GoalsController } from './goals.controller';
import { Goal } from './goal.entity';
import { GoalContribution } from './goal-contribution.entity';
import { AccountsModule } from '../accounts/accounts.module';

@Module({
  imports: [TypeOrmModule.forFeature([Goal, GoalContribution]), AccountsModule],
  providers: [GoalsService],
  controllers: [GoalsController],
})
export class GoalsModule {}
