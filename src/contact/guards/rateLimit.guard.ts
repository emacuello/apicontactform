import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';

const LIMIT = 5;
const TTL_MS = 60_000;
const hits = new Map<string, number[]>();

// Reemplaza a @nestjs/throttler, que es CommonJS y el runtime de Vercel no puede
// hacer require() de @nestjs/common 12 (ESM).
// ponytail: memoria por instancia (igual que el storage default de throttler);
// pasar a Vercel WAF rate limiting o Redis si hace falta un límite global.
@Injectable()
export class RateLimitGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req: Request = context.switchToHttp().getRequest();
    const fwd = req.headers['x-forwarded-for'];
    const ip =
      (typeof fwd === 'string' ? fwd.split(',')[0].trim() : fwd?.[0]) ||
      req.ip;
    const key = `${context.getHandler().name}:${ip}`;
    const now = Date.now();
    const recent = (hits.get(key) ?? []).filter((t) => now - t < TTL_MS);
    if (recent.length >= LIMIT) {
      throw new HttpException(
        'Demasiadas solicitudes, intenta más tarde',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    if (hits.size > 10_000) hits.clear();
    recent.push(now);
    hits.set(key, recent);
    return true;
  }
}
