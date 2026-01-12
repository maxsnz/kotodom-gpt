import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  UseGuards,
} from "@nestjs/common";

import { SettingsService } from "./settings.service";
import { SessionAuthGuard } from "../auth/guards/session-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { ZodValidationPipe } from "../../common/pipes";
import {
  UpdateSettingsSchema,
  type UpdateSettingsDto,
  type SettingsResponse,
} from "@shared/contracts/settings";

/**
 * Settings controller - all endpoints require ADMIN role
 */
@Controller("api/settings")
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles("ADMIN")
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  /**
   * GET /api/settings - Get all settings
   */
  @Get()
  async getAllSettings(): Promise<SettingsResponse> {
    const settings = await this.settingsService.getAllSettings();
    return { data: settings };
  }

  /**
   * POST /api/settings - Create new settings
   * Accepts an object with key-value pairs (one or more settings)
   */
  @Post()
  async createSettings(
    @Body(new ZodValidationPipe(UpdateSettingsSchema))
    input: UpdateSettingsDto
  ): Promise<SettingsResponse> {
    await this.settingsService.setSettings(input);
    const settings = await this.settingsService.getAllSettings();
    return { data: settings };
  }

  /**
   * PUT /api/settings - Update existing settings
   * Accepts an object with key-value pairs (one or more settings)
   */
  @Put()
  async updateSettings(
    @Body(new ZodValidationPipe(UpdateSettingsSchema))
    input: UpdateSettingsDto
  ): Promise<SettingsResponse> {
    await this.settingsService.setSettings(input);
    const settings = await this.settingsService.getAllSettings();
    return { data: settings };
  }
}
