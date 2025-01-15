import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    UnauthorizedException,
    UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminService } from '../admin/admin.service';
import { AuthService, JwtPayload } from './auth.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly adminService: AdminService
    ) { }

    @ApiOperation({ summary: 'Registrar un nuevo administrador' })
    @ApiResponse({
        status: 201,
        description: 'Administrador registrado exitosamente',
        type: AuthResponseDto
    })
    @ApiResponse({
        status: 400,
        description: 'Datos de registro inválidos o email ya registrado'
    })
    @Post('register')
    async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
        // Verificar si el email ya está registrado
        const existingAdmin = await this.adminService.findByEmail(registerDto.email);
        if (existingAdmin) {
            throw new UnauthorizedException('El email ya está registrado');
        }

        // Crear el hash de la contraseña
        const hashedPassword = await this.authService.hashPassword(registerDto.password);

        // Crear el nuevo administrador
        const newAdmin = await this.adminService.create({
            ...registerDto,
            password_hash: hashedPassword
        });

        // Generar el token JWT
        const payload: JwtPayload = {
            admin_id: newAdmin.admin_id,
            email: newAdmin.email
        };

        const token = await this.authService.generateJwt(payload);

        return {
            access_token: token,
            admin: newAdmin
        };
    }

    @ApiOperation({ summary: 'Iniciar sesión como administrador' })
    @ApiResponse({
        status: 200,
        description: 'Login exitoso',
        type: AuthResponseDto
    })
    @ApiResponse({
        status: 401,
        description: 'Credenciales inválidas'
    })
    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
        const admin = await this.adminService.findByEmail(loginDto.email);
        if (!admin) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        const isPasswordValid = await this.authService.validatePassword(
            loginDto.password,
            admin.password_hash
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        const payload: JwtPayload = {
            admin_id: admin.admin_id,
            email: admin.email
        };

        const token = await this.authService.generateJwt(payload);

        return {
            access_token: token,
            admin: admin
        };
    }

    @ApiOperation({ summary: 'Verificar el token JWT actual' })
    @ApiResponse({
        status: 200,
        description: 'Token válido y decodificado',
        type: 'JwtPayload'
    })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('verify')
    async verifyToken(@Req() req: any): Promise<JwtPayload> {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            throw new UnauthorizedException('Token no proporcionado');
        }
        return this.authService.verifyJwt(token);
    }

    @ApiOperation({ summary: 'Refrescar el token JWT' })
    @ApiResponse({
        status: 200,
        description: 'Nuevo token generado',
        type: AuthResponseDto
    })
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    @Post('refresh')
    async refreshToken(@Req() req: any): Promise<AuthResponseDto> {
        const admin = await this.adminService.findOne(req.user.admin_id);

        const payload: JwtPayload = {
            admin_id: admin.admin_id,
            email: admin.email
        };

        const token = await this.authService.generateJwt(payload);

        return {
            access_token: token,
            admin: admin
        };
    }
}