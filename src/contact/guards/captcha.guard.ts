import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { envs } from 'src/config/env';

@Injectable()
export class CaptchaGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const captchaToken = request.headers['turnstile-response'];
    // Express normaliza los nombres de headers a minúsculas
    const forwardedFor = request.headers['x-forwarded-for'];
    const ip =
      request.headers['cf-connecting-ip'] ||
      (typeof forwardedFor === 'string'
        ? forwardedFor.split(',')[0].trim()
        : forwardedFor?.[0]) ||
      'unknown';

    if (typeof captchaToken !== 'string' || !captchaToken) {
      throw new ForbiddenException('No puedes acceder a esta ruta');
    }

    const isValid = await this.verifyCaptcha(captchaToken, ip as string);
    if (!isValid) {
      throw new ForbiddenException('No puedes acceder a esta ruta');
    }
    return true;
  }

    private async verifyCaptcha(token: string, ip: string): Promise<boolean> {
        const validation = await this.validateTurnstile(token, ip);

        if (validation.success) {
          // Token is valid - process the form
          console.log('Valid submission from:', validation.hostname);
          return true;
      } else {
          // Token is invalid - reject the submission
          console.log('Invalid token:', validation['error-codes']);
          return false;
      }
    }

    private async validateTurnstile(token, remoteip) {
        const formData = new FormData();
        formData.append('secret', envs.CAPTCHA_SECRET);
        formData.append('response', token);
        formData.append('remoteip', remoteip);

      try {
          const response = await fetch(envs.CAPTCHA_URL, {
              method: 'POST',
              body: formData
          });

          const result = await response.json();
          console.log('result: ',result);
          
          return result;
        } catch (error) {
            console.error('Turnstile validation error:', error);
            return { success: false, 'error-codes': ['internal-error'] };
        }
    }
}
