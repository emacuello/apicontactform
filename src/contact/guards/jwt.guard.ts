import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { envs } from 'src/config/env';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private reflector: Reflector, private jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();
    const CUSTOM_HEADER_KEY = envs.CUSTOM_HEADER_KEY;
    const CUSTOM_HEADER_VALUE = envs.CUSTOM_HEADER_VALUE;
    const token = request.headers['authorization']?.split(' ')[1];
    if (
      request.headers[CUSTOM_HEADER_KEY?.toLowerCase()] === CUSTOM_HEADER_VALUE
    ) {
      try {
        const decoded = this.jwt.verify(token);
        if (decoded?.purpose !== envs.QUEUE_RMQ) {
          throw new ForbiddenException('No puedes acceder a esta ruta 1');
        }
      } catch {
        throw new ForbiddenException('No puedes acceder a esta ruta 2');
      }
      console.log('paso la verificacion');
      return true;
    } else {
      throw new ForbiddenException('No puedes acceder a esta ruta 3');
    }
  }
}
