import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ContactService } from './contact.service.js';
import { CreateContactDto } from './dto/create-contact.dto.js';
import { Request } from 'express';
import { CustomHeaderGuard } from './guards/customHeaders.guard.js';
import { JwtService } from '@nestjs/jwt';
import { JwtGuard } from './guards/jwt.guard.js';
import { CaptchaGuard } from './guards/captcha.guard.js';
import { RateLimitGuard } from './guards/rateLimit.guard.js';
import { envs } from '../config/env.js';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService, private readonly jwt: JwtService) {}

  @Post()
  @UseGuards(JwtGuard, RateLimitGuard, CaptchaGuard)
  async create(@Body() createContactDto: CreateContactDto, @Req() req: Request) {
    return await this.contactService.create(createContactDto, req);
  }
  

  @Post('form-token')
  @UseGuards(CustomHeaderGuard, RateLimitGuard)
  getFormToken() {
    return {
      token: this.jwt.sign(
        { purpose: envs.QUEUE_RMQ }
      ),
    };
  }

}
