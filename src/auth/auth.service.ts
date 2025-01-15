import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

// Definimos interfaces para mejorar la tipificación
export interface JwtPayload {
    admin_id: string;
    email: string;
    iat?: number;
    exp?: number;
}

/**
 * Servicio de autenticación que maneja la validación de contraseñas y tokens JWT.
 */
@Injectable()
export class AuthService {
    constructor(private readonly jwtService: JwtService) { }

    /**
     * Valida una contraseña comparándola con su hash.
     * @param password - Contraseña en texto plano a validar
     * @param hash - Hash almacenado de la contraseña
     * @returns Promise<boolean> - True si la contraseña coincide, false en caso contrario
     * 
     * @example
     * // Ejemplo de uso
     * const isValid = await authService.validatePassword('myPassword123', storedHash);
     */
    async validatePassword(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }

    /**
     * Genera un token JWT con la información del administrador.
     * @param payload - Objeto con la información del administrador
     * @returns Promise<string> - Token JWT generado
     * 
     * @example
     * // Ejemplo de uso
     * const token = await authService.generateJwt({
     *   admin_id: '123',
     *   email: 'admin@example.com'
     * });
     * 
     * @throws Error si hay un problema al generar el token
     */
    async generateJwt(payload: JwtPayload): Promise<string> {
        try {
            return this.jwtService.sign(payload);
        } catch (error) {
            throw new Error(`Error al generar el token JWT: ${error.message}`);
        }
    }

    /**
     * Verifica y decodifica un token JWT.
     * @param token - Token JWT a verificar
     * @returns Promise<JwtPayload> - Payload decodificado del token
     * 
     * @example
     * // Ejemplo de uso
     * try {
     *   const decoded = await authService.verifyJwt('token.jwt.here');
     *   console.log(decoded.email);
     * } catch (error) {
     *   console.error('Token inválido');
     * }
     * 
     * @throws UnauthorizedException si el token es inválido o ha expirado
     */
    async verifyJwt(token: string): Promise<JwtPayload> {
        try {
            const decoded = await this.jwtService.verify<JwtPayload>(token);
            return decoded;
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new UnauthorizedException('El token ha expirado');
            }
            throw new UnauthorizedException('Token inválido');
        }
    }

    /**
     * Decodifica un token JWT sin verificar su validez.
     * Útil para debugging o cuando solo se necesita acceder al payload.
     * @param token - Token JWT a decodificar
     * @returns JwtPayload - Payload decodificado del token
     */
    decodeJwt(token: string): JwtPayload {
        return this.jwtService.decode(token) as JwtPayload;
    }

    /**
     * Genera un hash de una contraseña.
     * @param password - Contraseña en texto plano
     * @returns Promise<string> - Hash de la contraseña
     * 
     * @example
     * // Ejemplo de uso
     * const hashedPassword = await authService.hashPassword('myPassword123');
     */
    async hashPassword(password: string): Promise<string> {
        const saltRounds = 10;
        return bcrypt.hash(password, saltRounds);
    }
}