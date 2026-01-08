import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { request, Request } from 'express';
import { envs } from 'src/config/env';

@Injectable()
export class CaptchaGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const request: Request = context.switchToHttp().getRequest();
        const captchaToken = request.headers['turnstile-response'];
        const ip = request.headers['CF-Connecting-IP'] ||
        request.headers['X-Forwarded-For'] ||
        'unknown';

        if (
            this.verifyCaptcha(captchaToken as string, ip as string).then((res) => {
                return res;
            }).catch((err) => {
                return false;
            })
        ) {
        console.log('paso la verificacion');

        return true;
        } else {
        throw new ForbiddenException('No puedes acceder a esta ruta');
        }
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
