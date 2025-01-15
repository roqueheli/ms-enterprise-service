import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import 'reflect-metadata';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { Admin } from './entities/admin.entity';

describe('AdminController', () => {
  let controller: AdminController;
  let service: AdminService;

  // Mock data
  const mockAdmin: Admin = {
    admin_id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    first_name: 'John',
    last_name: 'Doe',
    password_hash: 'hashedpassword123',
    created_at: new Date(),
    updated_at: new Date(),
    fullName: 'John Doe'
  };

  const mockCreateAdminDto: CreateAdminDto = {
    email: 'new@example.com',
    first_name: 'Jane',
    last_name: 'Smith',
    password_hash: 'password123'
  };

  const mockUpdateAdminDto: UpdateAdminDto = {
    first_name: 'Jane Updated',
    last_name: 'Smith Updated'
  };

  // Mock service
  const mockAdminService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: mockAdminService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AdminController>(AdminController);
    service = module.get<AdminService>(AdminService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new admin successfully', async () => {
      // Arrange
      mockAdminService.create.mockResolvedValue(mockAdmin);

      // Act
      const result = await controller.create(mockCreateAdminDto);

      // Assert
      expect(result).toEqual(mockAdmin);
      expect(mockAdminService.create).toHaveBeenCalledWith(mockCreateAdminDto);
    });

    it('should throw ConflictException when email already exists', async () => {
      // Arrange
      mockAdminService.create.mockRejectedValue(new ConflictException('El email ya está registrado'));

      // Act & Assert
      await expect(controller.create(mockCreateAdminDto))
        .rejects
        .toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return an array of admins', async () => {
      // Arrange
      const mockAdmins = [mockAdmin];
      mockAdminService.findAll.mockResolvedValue(mockAdmins);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(result).toEqual(mockAdmins);
      expect(mockAdminService.findAll).toHaveBeenCalled();
    });

    it('should return empty array when no admins exist', async () => {
      // Arrange
      mockAdminService.findAll.mockResolvedValue([]);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(result).toEqual([]);
      expect(mockAdminService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return an admin when found', async () => {
      // Arrange
      mockAdminService.findOne.mockResolvedValue(mockAdmin);

      // Act
      const result = await controller.findOne(mockAdmin.admin_id);

      // Assert
      expect(result).toEqual(mockAdmin);
      expect(mockAdminService.findOne).toHaveBeenCalledWith(mockAdmin.admin_id);
    });

    it('should throw NotFoundException when admin not found', async () => {
      // Arrange
      mockAdminService.findOne.mockRejectedValue(new NotFoundException());

      // Act & Assert
      await expect(controller.findOne('non-existent-id'))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an admin successfully', async () => {
      // Arrange
      const updatedAdmin = { ...mockAdmin, ...mockUpdateAdminDto };
      mockAdminService.update.mockResolvedValue(updatedAdmin);

      // Act
      const result = await controller.update(mockAdmin.admin_id, mockUpdateAdminDto);

      // Assert
      expect(result).toEqual(updatedAdmin);
      expect(mockAdminService.update).toHaveBeenCalledWith(
        mockAdmin.admin_id,
        mockUpdateAdminDto
      );
    });

    it('should throw NotFoundException when admin not found', async () => {
      // Arrange
      mockAdminService.update.mockRejectedValue(new NotFoundException());

      // Act & Assert
      await expect(controller.update('non-existent-id', mockUpdateAdminDto))
        .rejects
        .toThrow(NotFoundException);
    });

    it('should throw ConflictException when updating to existing email', async () => {
      // Arrange
      const updateDtoWithEmail = { ...mockUpdateAdminDto, email: 'existing@email.com' };
      mockAdminService.update.mockRejectedValue(new ConflictException('El email ya está registrado'));

      // Act & Assert
      await expect(controller.update(mockAdmin.admin_id, updateDtoWithEmail))
        .rejects
        .toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should remove an admin successfully', async () => {
      // Arrange
      mockAdminService.remove.mockResolvedValue(undefined);

      // Act
      const result = await controller.remove(mockAdmin.admin_id);

      // Assert
      expect(result).toBeUndefined();
      expect(mockAdminService.remove).toHaveBeenCalledWith(mockAdmin.admin_id);
    });

    it('should throw NotFoundException when trying to remove non-existent admin', async () => {
      // Arrange
      mockAdminService.remove.mockRejectedValue(new NotFoundException());

      // Act & Assert
      await expect(controller.remove('non-existent-id'))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  describe('Controller Structure', () => {
    it('should be properly decorated', () => {
      // Verificar que el controlador está definido
      expect(controller).toBeDefined();

      // Verificar que los métodos requeridos existen
      expect(typeof controller.create).toBe('function');
      expect(typeof controller.findAll).toBe('function');
      expect(typeof controller.findOne).toBe('function');
      expect(typeof controller.update).toBe('function');
      expect(typeof controller.remove).toBe('function');
    });

    it('should have proper method decorators', () => {
      // Verificar que los métodos tienen los decoradores correctos
      const prototype = Object.getPrototypeOf(controller);

      // Verificar que create tiene decorador Post
      expect(Reflect.getMetadata('path', prototype.create)).toBeDefined();

      // Verificar que findAll tiene decorador Get
      expect(Reflect.getMetadata('path', prototype.findAll)).toBeDefined();

      // Verificar que findOne tiene decorador Get
      expect(Reflect.getMetadata('path', prototype.findOne)).toBeDefined();

      // Verificar que update tiene decorador Patch
      expect(Reflect.getMetadata('path', prototype.update)).toBeDefined();

      // Verificar que remove tiene decorador Delete
      expect(Reflect.getMetadata('path', prototype.remove)).toBeDefined();
    });
  });
});