import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { envs } from '../../config/env.js';

@Injectable()
export class CustomHeaderGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();
    const CUSTOM_HEADER_KEY = envs.CUSTOM_HEADER_KEY;
    const CUSTOM_HEADER_VALUE = envs.CUSTOM_HEADER_VALUE;

    if (
      request.headers[CUSTOM_HEADER_KEY?.toLowerCase()] === CUSTOM_HEADER_VALUE
    ) {
      console.log('paso la verificacion');

      return true;
    } else {
      throw new ForbiddenException('No puedes acceder a esta ruta');
    }
  }
}
