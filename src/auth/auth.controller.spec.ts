import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from '../admin/admin.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let adminService: AdminService;

  // Mock data
  const mockAdmin = {
    admin_id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    first_name: 'John',
    last_name: 'Doe',
    password_hash: 'hashed_password',
    created_at: new Date(),
    updated_at: new Date()
  };

  const mockToken = 'mock.jwt.token';

  const mockAuthService = {
    hashPassword: jest.fn().mockResolvedValue('hashed_password'),
    generateJwt: jest.fn().mockResolvedValue(mockToken),
    validatePassword: jest.fn().mockResolvedValue(true),
    verifyJwt: jest.fn().mockResolvedValue({
      admin_id: mockAdmin.admin_id,
      email: mockAdmin.email
    })
  };

  const mockAdminService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService
        },
        {
          provide: AdminService,
          useValue: mockAdminService
        }
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    adminService = module.get<AdminService>(AdminService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      password: 'password123',
      first_name: 'John',
      last_name: 'Doe'
    };

    it('should register a new admin successfully', async () => {
      mockAdminService.findByEmail.mockResolvedValue(null);
      mockAdminService.create.mockResolvedValue(mockAdmin);

      const result = await controller.register(registerDto);

      expect(result).toEqual({
        access_token: mockToken,
        admin: mockAdmin
      });
      expect(authService.hashPassword).toHaveBeenCalledWith(registerDto.password);
      expect(adminService.create).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if email already exists', async () => {
      mockAdminService.findByEmail.mockResolvedValue(mockAdmin);

      await expect(controller.register(registerDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123'
    };

    it('should login successfully with valid credentials', async () => {
      mockAdminService.findByEmail.mockResolvedValue(mockAdmin);
      mockAuthService.validatePassword.mockResolvedValue(true);

      const result = await controller.login(loginDto);

      expect(result).toEqual({
        access_token: mockToken,
        admin: mockAdmin
      });
    });

    it('should throw UnauthorizedException if admin not found', async () => {
      mockAdminService.findByEmail.mockResolvedValue(null);

      await expect(controller.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      mockAdminService.findByEmail.mockResolvedValue(mockAdmin);
      mockAuthService.validatePassword.mockResolvedValue(false);

      await expect(controller.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('verifyToken', () => {
    it('should verify token successfully', async () => {
      const mockReq = {
        headers: {
          authorization: 'Bearer ' + mockToken
        }
      };

      const result = await controller.verifyToken(mockReq);

      expect(result).toEqual({
        admin_id: mockAdmin.admin_id,
        email: mockAdmin.email
      });
      expect(authService.verifyJwt).toHaveBeenCalledWith(mockToken);
    });

    it('should throw UnauthorizedException if no token provided', async () => {
      const mockReq = {
        headers: {}
      };

      await expect(controller.verifyToken(mockReq)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const mockReq = {
        user: {
          admin_id: mockAdmin.admin_id,
          email: mockAdmin.email
        }
      };

      mockAdminService.findOne.mockResolvedValue(mockAdmin);

      const result = await controller.refreshToken(mockReq);

      expect(result).toEqual({
        access_token: mockToken,
        admin: mockAdmin
      });
      expect(adminService.findOne).toHaveBeenCalledWith(mockAdmin.admin_id);
      expect(authService.generateJwt).toHaveBeenCalled();
    });
  });

  describe('Swagger Decorators', () => {
    it('should have ApiTags decorator', () => {
      const controllers = Reflect.getMetadata('swagger/apiUseTags', AuthController);
      expect(controllers).toContain('Autenticación');
    });

    it('should have proper decorators for register endpoint', () => {
      const metadata = Reflect.getMetadata('swagger/apiResponse', controller.register);
      expect(metadata).toBeDefined();
    });

    it('should have proper decorators for login endpoint', () => {
      const metadata = Reflect.getMetadata('swagger/apiResponse', controller.login);
      expect(metadata).toBeDefined();
    });
  });
});