import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { Resend } from 'resend';
import type { AppConfig } from '../config';

@Injectable()
export class MailService {
  private resend: Resend;

  constructor(private configService: ConfigService<AppConfig, true>) {
    const apiKey = this.configService.get('mail.resendApiKey', { infer: true });
    this.resend = new Resend(apiKey);
  }

  private get fromAddress(): string {
    const domain = this.configService.get('mail.fromDomain', { infer: true });
    // Handle Resend testing environment restriction
    if (domain === 'resend.dev') {
      return 'onboarding@resend.dev';
    }
    return `Acme Consultores <noreply@${domain}>`;
  }

  private get frontendUrl(): string {
    return this.configService.get('app.frontendUrl', { infer: true });
  }

  @OnEvent('user.registered')
  async handleUserRegisteredEvent(payload: { email: string; code: string }) {
    if (!this.configService.get('mail.resendApiKey', { infer: true })) return;
    try {
      await this.resend.emails.send({
        from: this.fromAddress,
        to: payload.email,
        subject: 'Verifica tu cuenta en Acme Consultores',
        html: `<h3>Bienvenido a Acme Consultores</h3>
               <p>Tu código de verificación es: <strong>${payload.code}</strong></p>
               <p>Ingresa este código para activar tu cuenta.</p>`,
      });
    } catch (error) {
      console.error('[MailService] Exception sending verification email:', error);
    }
  }

  @OnEvent('password.reset')
  async handlePasswordResetEvent(payload: { email: string; code: string }) {
    if (!this.configService.get('mail.resendApiKey', { infer: true })) return;
    try {
      await this.resend.emails.send({
        from: this.fromAddress,
        to: payload.email,
        subject: 'Recuperar contraseña - Acme Consultores',
        html: `<h3>Recuperación de contraseña</h3>
               <p>Tu código de recuperación es: <strong>${payload.code}</strong></p>
               <p>Ingresa este código para restablecer tu contraseña. Si no solicitaste este cambio, ignora este correo.</p>`,
      });
    } catch (error) {
      console.error('[MailService] Exception sending password reset email:', error);
    }
  }

  @OnEvent('survey.completed')
  async handleSurveyCompletedEvent(payload: {
    email: string;
    userName: string;
    resultUrl: string;
  }) {
    if (!this.configService.get('mail.resendApiKey', { infer: true })) return;
    try {
      await this.resend.emails.send({
        from: this.fromAddress,
        to: payload.email,
        subject: 'Tu Reporte del Diagnóstico 360° del Emprendedor',
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
            <h2 style="color: #0f172a;">¡Hola, ${payload.userName}!</h2>
            <p>Gracias por completar tu <strong>Diagnóstico 360° del Emprendedor</strong>.</p>
            <p>Puedes acceder a tu informe completo haciendo clic en el siguiente enlace:</p>
            <div style="margin: 25px 0;">
              <a href="${payload.resultUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Ver mi Diagnóstico Completo</a>
            </div>
            <p>Atentamente,<br /><strong>El equipo de Acme Consultores</strong></p>
          </div>
        `,
      });
    } catch (error) {
      console.error('[MailService] Exception sending survey results email:', error);
    }
  }

  @OnEvent('diagnosis.reminder')
  async handleDiagnosisReminderEvent(payload: {
    email: string;
    userName: string;
    lastResultUrl: string;
    daysSince: number;
  }) {
    if (!this.configService.get('mail.resendApiKey', { infer: true })) return;
    const newDiagUrl = `${this.frontendUrl}/personal/diagnostico?new=true`;

    try {
      await this.resend.emails.send({
        from: this.fromAddress,
        to: payload.email,
        subject: `${payload.userName}, es momento de medir tu evolución`,
        html: `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background-color:#0E0E1A;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0E0E1A;padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:linear-gradient(145deg,#16162A 0%,#1A1A2E 100%);border-radius:20px;border:1px solid rgba(201,168,76,0.2);overflow:hidden;">

      <!-- Header with gold accent -->
      <tr><td style="padding:0;">
        <div style="height:4px;background:linear-gradient(90deg,#B8943F,#D4B957,#C9A84C);"></div>
        <div style="padding:32px 40px 24px;text-align:center;">
          <div style="font-size:24px;font-weight:900;color:#E8E5DF;letter-spacing:-0.5px;">
            Acme<span style="color:#C9A84C;"> Consultores</span>
          </div>
          <div style="font-size:10px;font-weight:700;color:rgba(201,168,76,0.6);letter-spacing:3px;text-transform:uppercase;margin-top:4px;">
            Diagnóstico 360°
          </div>
        </div>
      </td></tr>

      <!-- Main content -->
      <tr><td style="padding:0 40px 40px;">

        <h1 style="color:#E8E5DF;font-size:22px;font-weight:900;margin:0 0 8px;line-height:1.3;">
          ¡Hola, ${payload.userName}!
        </h1>
        <p style="color:#A09B90;font-size:14px;line-height:1.7;margin:0 0 24px;">
          Han pasado <strong style="color:#C9A84C;">${payload.daysSince} días</strong> desde tu último diagnóstico.
          Este es un excelente momento para medir tu evolución y descubrir cómo has avanzado.
        </p>

        <!-- Highlight card -->
        <div style="background:rgba(201,168,76,0.06);border:1px solid rgba(201,168,76,0.15);border-radius:14px;padding:20px 24px;margin-bottom:24px;">
          <div style="font-size:11px;font-weight:800;color:#C9A84C;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;">
            ¿Por qué es importante?
          </div>
          <p style="color:#C4BFB5;font-size:13px;line-height:1.7;margin:0;">
            El crecimiento real se mide con datos. Un nuevo diagnóstico te permite comparar
            resultados, identificar patrones y tomar decisiones estratégicas basadas en evidencia.
          </p>
        </div>

        <!-- CTA Button -->
        <div style="text-align:center;margin:32px 0 24px;">
          <a href="${newDiagUrl}"
             style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#C9A84C,#D4B957);color:#0E0E1A;font-size:14px;font-weight:900;text-decoration:none;border-radius:12px;letter-spacing:0.3px;">
            Realizar nuevo diagnóstico →
          </a>
        </div>

        <!-- Secondary link -->
        <p style="text-align:center;margin:0 0 16px;">
          <a href="${payload.lastResultUrl}"
             style="color:#C9A84C;font-size:12px;font-weight:700;text-decoration:underline;">
            Ver mi último diagnóstico
          </a>
        </p>

        <!-- Divider -->
        <div style="height:1px;background:rgba(201,168,76,0.12);margin:24px 0;"></div>

        <p style="color:#6B6760;font-size:12px;line-height:1.6;margin:0;text-align:center;font-style:italic;">
          "Tu resultado no es una etiqueta; es tu punto de partida."
        </p>

      </td></tr>

      <!-- Footer -->
      <tr><td style="padding:0;">
        <div style="background:rgba(201,168,76,0.04);padding:20px 40px;text-align:center;border-top:1px solid rgba(201,168,76,0.08);">
          <p style="color:#4A4740;font-size:11px;margin:0;">
            © ${new Date().getFullYear()} Acme Consultores · Todos los derechos reservados
          </p>
        </div>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>
        `,
      });
    } catch (error) {
      console.error('[MailService] Exception sending reminder email:', error);
    }
  }
}
