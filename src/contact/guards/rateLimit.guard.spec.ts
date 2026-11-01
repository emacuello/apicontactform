import { HttpException } from '@nestjs/common';
import { RateLimitGuard } from './rateLimit.guard.js';

const ctx = (ip: string) =>
  ({
    switchToHttp: () => ({ getRequest: () => ({ headers: { 'x-forwarded-for': `${ip}, 10.0.0.1` } }) }),
    getHandler: () => function create() {},
  }) as any;

describe('RateLimitGuard', () => {
  it('permite 5 requests por IP en 60s y bloquea la sexta', () => {
    const guard = new RateLimitGuard();
    for (let i = 0; i < 5; i++) expect(guard.canActivate(ctx('1.1.1.1'))).toBe(true);
    expect(() => guard.canActivate(ctx('1.1.1.1'))).toThrow(HttpException);
    expect(guard.canActivate(ctx('2.2.2.2'))).toBe(true);
  });
});
