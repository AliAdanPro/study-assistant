import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response } from 'express';
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(
    @Body()
    body: { email: string; username: string; name: string; password: string },
    @Res() res: Response,
  ) {
    try {
      const user = await this.authService.signup(
        body.email,
        body.username,
        body.name,
        body.password,
      );
      return res.status(HttpStatus.CREATED).json(user);
    } catch (err) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: err.message });
    }
  }

  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
    @Res() res: Response,
  ) {
    try {
      const result = await this.authService.login(body.email, body.password);
      return res.status(HttpStatus.OK).json(result);
    } catch (err) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: err.message });
    }
  }
  // ...existing code...
  @Post('update-password')
  async updatePassword(
    @Body()
    body: { userId: string; currentPassword: string; newPassword: string },
    @Res() res: Response,
  ) {
    try {
      const userId = Number(body.userId);
      if (!userId) {
        throw new Error('userId is required');
      }
      await this.authService.updatePassword(
        userId,
        body.currentPassword,
        body.newPassword,
      );
      return res
        .status(HttpStatus.OK)
        .json({ message: 'Password updated successfully!' });
    } catch (err) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: err.message });
    }
  }
  // ...existing code...
  @Post('reset-password')
  async resetPassword(
    @Body('email') email: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.authService.resetPassword(email, newPassword);
  }
}
