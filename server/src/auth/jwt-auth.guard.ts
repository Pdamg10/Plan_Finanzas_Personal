import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    // Inject mock user
    request.user = {
      id: 'default-user-id',
      email: 'migrated_user@example.com',
      nombre: 'Usuario Principal',
    };
    return true;
  }
}
