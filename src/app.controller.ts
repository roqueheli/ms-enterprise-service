import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

/**
 * Controlador principal de la aplicación.
 */
@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  /**
   * Endpoint para verificar que la aplicación está funcionando.
   * @returns Un mensaje de bienvenida.
   */
  @ApiOperation({ summary: 'Verificar el estado de la aplicación' })
  @ApiResponse({
    status: 200,
    description: 'La aplicación está funcionando correctamente',
    schema: {
      example: 'Hello World!',
    },
  })
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}