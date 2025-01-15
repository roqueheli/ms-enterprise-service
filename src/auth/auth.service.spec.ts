import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { AuthService, JwtPayload } from './auth.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  const mockPayload: JwtPayload = {
    admin_id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com'
  };

  const mockToken = 'mock.jwt.token';

  const mockJwtService = {
    sign: jest.fn().mockResolvedValue(mockToken),
    verify: jest.fn(),
    decode: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService
        }
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  describe('validatePassword', () => {
    it('should return true for valid password', async () => {
      const password = 'password123';
      const hash = 'hashedPassword';

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validatePassword(password, hash);

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hash);
    });

    it('should return false for invalid password', async () => {
      const password = 'wrongPassword';
      const hash = 'hashedPassword';

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validatePassword(password, hash);

      expect(result).toBe(false);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hash);
    });
  });

  describe('generateJwt', () => {
    it('should generate a valid JWT token', async () => {
      const result = await service.generateJwt(mockPayload);

      expect(result).toBe(mockToken);
      expect(jwtService.sign).toHaveBeenCalledWith(mockPayload);
    });

    it('should throw error when token generation fails', async () => {
      mockJwtService.sign.mockRejectedValue(new Error('Token generation failed'));

      try {
        await service.generateJwt(mockPayload);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toBe('Token generation failed');
      }
    });
  });

  describe('verifyJwt', () => {
    it('should verify and decode a valid token', async () => {
      mockJwtService.verify.mockResolvedValue(mockPayload);

      const result = await service.verifyJwt(mockToken);

      expect(result).toEqual(mockPayload);
      expect(jwtService.verify).toHaveBeenCalledWith(mockToken);
    });

    it('should throw UnauthorizedException for expired token', async () => {
      const error = new Error('TokenExpiredError');
      error.name = 'TokenExpiredError';
      mockJwtService.verify.mockRejectedValue(error);

      await expect(service.verifyJwt(mockToken)).rejects.toThrow(
        new UnauthorizedException('El token ha expirado')
      );
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      mockJwtService.verify.mockRejectedValue(new Error('Invalid token'));

      await expect(service.verifyJwt(mockToken)).rejects.toThrow(
        new UnauthorizedException('Token inválido')
      );
    });
  });

  describe('decodeJwt', () => {
    it('should decode token without verification', () => {
      mockJwtService.decode.mockReturnValue(mockPayload);

      const result = service.decodeJwt(mockToken);

      expect(result).toEqual(mockPayload);
      expect(jwtService.decode).toHaveBeenCalledWith(mockToken);
    });

    it('should handle null decoded value', () => {
      mockJwtService.decode.mockReturnValue(null);

      const result = service.decodeJwt(mockToken);

      expect(result).toBeNull();
      expect(jwtService.decode).toHaveBeenCalledWith(mockToken);
    });
  });

  describe('hashPassword', () => {
    it('should hash password successfully', async () => {
      const password = 'password123';
      const hashedPassword = 'hashedPassword123';

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const result = await service.hashPassword(password);

      expect(result).toBe(hashedPassword);
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
    });

    it('should throw error when hashing fails', async () => {
      const password = 'password123';
      const error = new Error('Hashing failed');

      (bcrypt.hash as jest.Mock).mockRejectedValue(error);

      await expect(service.hashPassword(password)).rejects.toThrow(error);
    });
  });

  describe('error handling', () => {
    it('should handle bcrypt compare errors', async () => {
      const error = new Error('Bcrypt compare failed');
      (bcrypt.compare as jest.Mock).mockRejectedValue(error);

      await expect(
        service.validatePassword('password', 'hash')
      ).rejects.toThrow(error);
    });

    it('should handle JWT sign errors', async () => {
      mockJwtService.sign.mockRejectedValue(new Error('JWT sign failed'));

      try {
        await service.generateJwt(mockPayload);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toBe('JWT sign failed');
      }
    });
  });
});