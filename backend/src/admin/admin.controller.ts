import {
  Controller,
  Get,
  Put,
  Delete,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminEnhancedService } from './admin-enhanced.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly adminEnhancedService: AdminEnhancedService,
  ) {}

  @Get('users')
  async getAllUsers(@Query('role') role?: string) {
    return this.adminService.getAllUsers(role);
  }

  @Get('users/activity')
  async getUsersWithActivity() {
    return this.adminEnhancedService.getUsersWithActivity();
  }

  @Get('users/:id/activity')
  async getUserActivity(@Param('id') id: string, @Query('days') days?: number) {
    return this.adminEnhancedService.getUserActivity(id, days ? parseInt(days.toString()) : 30);
  }

  @Get('users/:id')
  async getUser(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Put('users/:id')
  async updateUser(@Param('id') id: string, @Body() updateDto: any) {
    return this.adminService.updateUser(id, updateDto);
  }

  @Put('users/:id/role')
  async updateUserRole(@Param('id') id: string, @Body() body: { role: string; permissions?: any }) {
    return this.adminEnhancedService.updateUserRole(id, body.role, body.permissions);
  }

  @Post('users/:id/revoke-access')
  async revokeUserAccess(@Param('id') id: string) {
    return this.adminEnhancedService.revokeUserAccess(id);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @Get('analytics')
  async getAnalytics() {
    return this.adminService.getAnalytics();
  }

  // Device Monitoring
  @Get('devices')
  async getDevices() {
    return this.adminEnhancedService.getDevices();
  }

  @Put('devices/:deviceId')
  async updateDeviceStatus(@Param('deviceId') deviceId: string, @Body() status: any) {
    return this.adminEnhancedService.updateDeviceStatus(deviceId, status);
  }

  @Get('devices/alerts')
  async getDeviceAlerts() {
    return this.adminEnhancedService.getDeviceAlerts();
  }

  // Appointment Analytics
  @Get('appointments/analytics')
  async getAppointmentAnalytics(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.adminEnhancedService.getAppointmentAnalytics(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  // Billing & Financial
  @Get('billing/analytics')
  async getBillingAnalytics(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.adminEnhancedService.getBillingAnalytics(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  // Comprehensive Analytics
  @Get('analytics/comprehensive')
  async getComprehensiveAnalytics(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.adminEnhancedService.getComprehensiveAnalytics(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  // Security & Compliance
  @Get('security/audit-logs')
  async getAuditLogs(
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.adminEnhancedService.getAuditLogs(
      userId,
      action,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('security/status')
  async getSecurityStatus() {
    return this.adminEnhancedService.getSecurityStatus();
  }

  // System Settings
  @Get('settings')
  async getSettings() {
    return this.adminEnhancedService.getSettings();
  }

  @Put('settings')
  async updateSettings(@Body() settings: any) {
    return this.adminEnhancedService.updateSettings(settings);
  }

  // Device Management
  @Post('devices/:deviceId/calibrate')
  async calibrateDevice(@Param('deviceId') deviceId: string) {
    return this.adminEnhancedService.calibrateDevice(deviceId);
  }

  // Dashboard Stats
  @Get('dashboard-stats')
  async getDashboardStats() {
    return this.adminEnhancedService.getDashboardStats();
  }

  // Emergency Controls
  @Post('controls/lockdown')
  async toggleLockdown(@Body() body: { active: boolean }) {
    return this.adminEnhancedService.toggleLockdown(body.active);
  }

  @Post('controls/broadcast')
  async sendBroadcast(@Body() body: { message: string }) {
    return this.adminEnhancedService.sendBroadcast(body.message);
  }

  // Automation Rules
  @Put('automation/:ruleKey')
  async updateAutomationRule(
    @Param('ruleKey') ruleKey: string,
    @Body() body: { enabled: boolean },
  ) {
    return this.adminEnhancedService.updateAutomationRule(ruleKey, body.enabled);
  }
}

