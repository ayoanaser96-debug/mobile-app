import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('billing')
@UseGuards(JwtAuthGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('payment')
  @UseGuards(RolesGuard)
  @Roles('admin', 'patient')
  async processPayment(
    @Request() req,
    @Body() body: { patientId: string; amount: number },
  ) {
    const staffId = req.user.role === 'admin' ? req.user.id : undefined;
    return this.billingService.processPayment(
      body.patientId || req.user.id,
      body.amount,
      staffId,
    );
  }
}

