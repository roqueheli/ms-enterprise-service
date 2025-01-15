import { Injectable } from '@nestjs/common';

/**
 * Servicio principal de la aplicación.
 */
@Injectable()
export class AppService {
  /**
   * Devuelve un mensaje de bienvenida.
   * @returns Un mensaje de bienvenida.
   */
  getHello(): string {
    return 'Hello World!';
  }
}