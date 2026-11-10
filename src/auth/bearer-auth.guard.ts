import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'crypto';
import { Request } from 'express';

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) {
    return false;
  }
  return timingSafeEqual(left, right);
}

@Injectable()
export class BearerAuthGuard implements CanActivate {
  private readonly expected: string;

  constructor(config: ConfigService) {
    const token = config.get<string>('MOCK_TOKEN', 'mock-seguros-local');
    this.expected = `Bearer ${token}`;
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const given = request.headers.authorization ?? '';
    if (!safeEqual(given, this.expected)) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
