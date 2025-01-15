import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateEnterpriseDto } from './dto';
import { EnterprisesController } from './enterprises.controller';
import { EnterprisesService } from './enterprises.service';
import { Enterprise } from './entities/enterprise.entity';

describe('EnterprisesController', () => {
  let controller: EnterprisesController;
  let service: EnterprisesService;

  // Mock data con todas las propiedades requeridas
  const mockEnterprise: Enterprise = {
    enterprise_id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Enterprise',
    website: 'https://test-enterprise.com',
    description: 'Test enterprise description',
    industry: 'Technology',
    settings: null,
    created_at: new Date(),
    updated_at: new Date(),
    getFormattedWebsite: function () {
      return this.website.replace(/^https?:\/\//, '');
    }
  };

  const mockCreateEnterpriseDto: CreateEnterpriseDto = {
    name: 'Test Enterprise',
    contact_email: 'test@enterprise.com',
    website: 'https://test-enterprise.com',
    description: 'Test enterprise description',
    industry: 'Technology'
  };

  // Mock service
  const mockEnterpriseService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnterprisesController],
      providers: [
        {
          provide: EnterprisesService,
          useValue: mockEnterpriseService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<EnterprisesController>(EnterprisesController);
    service = module.get<EnterprisesService>(EnterprisesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new enterprise', async () => {
      mockEnterpriseService.create.mockResolvedValue(mockEnterprise);

      const result = await controller.create(mockCreateEnterpriseDto);

      expect(result).toEqual(mockEnterprise);
      expect(service.create).toHaveBeenCalledWith(mockCreateEnterpriseDto);
      expect(service.create).toHaveBeenCalledTimes(1);
    });

    it('should handle errors during creation', async () => {
      mockEnterpriseService.create.mockRejectedValue(new Error('Creation failed'));

      await expect(controller.create(mockCreateEnterpriseDto)).rejects.toThrow('Creation failed');
    });
  });

  describe('findAll', () => {
    it('should return an array of enterprises', async () => {
      const enterprises = [mockEnterprise];
      mockEnterpriseService.findAll.mockResolvedValue(enterprises);

      const result = await controller.findAll();

      expect(result).toEqual(enterprises);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no enterprises exist', async () => {
      mockEnterpriseService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return a single enterprise', async () => {
      mockEnterpriseService.findOne.mockResolvedValue(mockEnterprise);

      const result = await controller.findOne(mockEnterprise.enterprise_id);

      expect(result).toEqual(mockEnterprise);
      expect(service.findOne).toHaveBeenCalledWith(mockEnterprise.enterprise_id);
    });

    it('should throw NotFoundException when enterprise is not found', async () => {
      mockEnterpriseService.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an enterprise', async () => {
      const updatedEnterprise = {
        ...mockEnterprise,
        ...mockCreateEnterpriseDto,
      };
      mockEnterpriseService.create.mockResolvedValue(updatedEnterprise);

      const result = await controller.update(mockCreateEnterpriseDto);

      expect(result).toEqual(updatedEnterprise);
      expect(service.create).toHaveBeenCalledWith(mockCreateEnterpriseDto);
    });

    it('should handle errors during update', async () => {
      mockEnterpriseService.create.mockRejectedValue(new Error('Update failed'));

      await expect(controller.update(mockCreateEnterpriseDto)).rejects.toThrow('Update failed');
    });
  });

  describe('remove', () => {
    it('should remove an enterprise', async () => {
      mockEnterpriseService.remove.mockResolvedValue({ affected: 1 });

      const result = await controller.remove(mockEnterprise.enterprise_id);

      expect(result).toEqual({ affected: 1 });
      expect(service.remove).toHaveBeenCalledWith(mockEnterprise.enterprise_id);
    });

    it('should throw NotFoundException when enterprise to remove is not found', async () => {
      mockEnterpriseService.remove.mockRejectedValue(new NotFoundException());

      await expect(controller.remove('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('Entity Methods', () => {
    it('should format website correctly', () => {
      expect(mockEnterprise.getFormattedWebsite()).toBe('test-enterprise.com');
    });
  });

  describe('Controller Decorators', () => {
    it('should have correct controller decorators', () => {
      const controllerMetadata = Reflect.getMetadata('path', EnterprisesController);
      expect(controllerMetadata).toBe('enterprises');
    });

    it('should have JWT guard applied', () => {
      const guards = Reflect.getMetadata('__guards__', EnterprisesController);
      expect(guards).toBeDefined();
      expect(guards[0]).toBe(JwtAuthGuard);
    });
  });
});