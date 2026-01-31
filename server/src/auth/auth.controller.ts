import { Controller, Request, Post, UseGuards, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() req) {
    // Ideally use LocalAuthGuard but for simplicity validating manually or using service
    // For now assuming body has email/password and we validate manually to skip LocalStrategy setup if desired
    // But let's do it properly: User sends { email, password }
    const valid = await this.authService.validateUser(req.email, req.password);
    if (!valid) {
        return { message: 'Invalid credentials' }; // Should throw Unauthorized
    }
    return this.authService.login(valid);
  }

  @Post('register')
  async register(@Body() body) {
    return this.authService.register(body.email, body.password, body.nombre);
  }
}
