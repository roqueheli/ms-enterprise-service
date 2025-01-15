import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { Admin } from './entities/admin.entity';

describe('AdminService', () => {
  let service: AdminService;
  let repository: Repository<Admin>;

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

  // Mock repository
  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(Admin),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    repository = module.get<Repository<Admin>>(getRepositoryToken(Admin));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new admin successfully', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValueOnce(null);
      mockRepository.create.mockReturnValue(mockAdmin);
      mockRepository.save.mockResolvedValue(mockAdmin);

      // Act
      const result = await service.create(mockCreateAdminDto);

      // Assert
      expect(result).toEqual(mockAdmin);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: mockCreateAdminDto.email }
      });
      expect(mockRepository.create).toHaveBeenCalledWith(mockCreateAdminDto);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException when email already exists', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValueOnce(mockAdmin);

      // Act & Assert
      await expect(service.create(mockCreateAdminDto))
        .rejects
        .toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return an array of admins', async () => {
      // Arrange
      const mockAdmins = [mockAdmin];
      mockRepository.find.mockResolvedValue(mockAdmins);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual(mockAdmins);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return an admin when found', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(mockAdmin);

      // Act
      const result = await service.findOne(mockAdmin.admin_id);

      // Assert
      expect(result).toEqual(mockAdmin);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { admin_id: mockAdmin.admin_id }
      });
    });

    it('should throw NotFoundException when admin not found', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne('non-existent-id'))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('should return an admin when email found', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(mockAdmin);

      // Act
      const result = await service.findByEmail(mockAdmin.email);

      // Assert
      expect(result).toEqual(mockAdmin);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: mockAdmin.email }
      });
    });

    it('should return null when email not found', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await service.findByEmail('non-existent@email.com');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update an admin successfully', async () => {
      // Arrange
      const updatedAdmin = { ...mockAdmin, ...mockUpdateAdminDto };
      mockRepository.findOne.mockResolvedValueOnce(mockAdmin);
      mockRepository.save.mockResolvedValue(updatedAdmin);

      // Act
      const result = await service.update(mockAdmin.admin_id, mockUpdateAdminDto);

      // Assert
      expect(result).toEqual(updatedAdmin);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when admin not found', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update('non-existent-id', mockUpdateAdminDto))
        .rejects
        .toThrow(NotFoundException);
    });

    it('should throw ConflictException when updating to existing email', async () => {
      // Arrange
      const updateDtoWithEmail = { ...mockUpdateAdminDto, email: 'existing@email.com' };
      mockRepository.findOne
        .mockResolvedValueOnce(mockAdmin) // First call for findOne
        .mockResolvedValueOnce({ ...mockAdmin, email: 'existing@email.com' }); // Second call for findByEmail

      // Act & Assert
      await expect(service.update(mockAdmin.admin_id, updateDtoWithEmail))
        .rejects
        .toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should remove an admin successfully', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(mockAdmin);
      mockRepository.remove.mockResolvedValue(mockAdmin);

      // Act
      await service.remove(mockAdmin.admin_id);

      // Assert
      expect(mockRepository.remove).toHaveBeenCalledWith(mockAdmin);
    });

    it('should throw NotFoundException when trying to remove non-existent admin', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove('non-existent-id'))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  describe('Admin Entity', () => {
    it('should return correct fullName', () => {
      // Arrange
      const admin = new Admin();
      admin.first_name = 'John';
      admin.last_name = 'Doe';

      // Act & Assert
      expect(admin.fullName).toBe('John Doe');
    });
  });
});