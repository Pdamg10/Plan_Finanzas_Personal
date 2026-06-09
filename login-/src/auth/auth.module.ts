import 'dotenv/config'; // ← AÑADIR ESTO PRIMERO
import { Module, Controller, Post, Body, Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { createClient } from '@libsql/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
class AuthService {
  private turso = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  async register(nombre: string, correo: string, pass: string) {
    const hash = await bcrypt.hash(pass, 10);
    await this.turso.execute({
      sql: 'INSERT INTO usuarios (nombre, pass, fecha_registro, Correo) VALUES (?, ?, datetime(), ?)',
      args: [nombre, hash, correo],
    });
    return { ok: true, msg: 'Usuario creado' };
  }

  async login(correo: string, pass: string) {
    const result = await this.turso.execute({
      sql: 'SELECT * FROM usuarios WHERE Correo = ?',
      args: [correo],
    });

    if (result.rows.length === 0)
      throw new UnauthorizedException('Credenciales inválidas');

    const user = result.rows[0] as any;
    const valid = await bcrypt.compare(pass, user.pass);
    if (!valid) throw new UnauthorizedException('Credenciales inválidas');

    return { id: user.id, nombre: user.nombre, correo: user.Correo };
  }
}

@Controller('api/auth')
class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: { nombre: string; correo: string; pass: string }) {
    if (!body.nombre || !body.correo || !body.pass)
      throw new BadRequestException('Faltan campos');
    return this.authService.register(body.nombre, body.correo, body.pass);
  }

  @Post('login')
  async login(@Body() body: { correo: string; pass: string }) {
    if (!body.correo || !body.pass)
      throw new BadRequestException('Faltan credenciales');
    const user = await this.authService.login(body.correo, body.pass);
    return { ok: true, user };
  }
}

@Module({
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}