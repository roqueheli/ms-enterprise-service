import { NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateEnterpriseDto } from './dto';
import { EnterprisesController } from './enterprises.controller';
import { EnterprisesService } from './enterprises.service';
import { Enterprise } from './entities/enterprise.entity';

describe('EnterprisesController', () => {
  let controller: EnterprisesController;
  let service: EnterprisesService;
  let client: ClientProxy;

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

  // Mock client proxy
  const mockClientProxy = {
    emit: jest.fn(),
    send: jest.fn().mockReturnValue({
      toPromise: jest.fn().mockResolvedValue([]), // Simula el método toPromise
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnterprisesController],
      providers: [
        {
          provide: EnterprisesService,
          useValue: mockEnterpriseService,
        },
        {
          provide: 'ENTERPRISE_SERVICE',
          useValue: mockClientProxy,
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
      expect(mockClientProxy.emit).toHaveBeenCalledWith('enterprise_created', {
        enterpriseId: mockEnterprise.enterprise_id,
        name: mockEnterprise.name,
      });
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
      mockClientProxy.send.mockReturnValueOnce({
        toPromise: jest.fn().mockResolvedValue(null), // Simula que no hay caché
      });

      const result = await controller.findAll();

      expect(result).toEqual(enterprises);
      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(mockClientProxy.send).toHaveBeenCalledWith('get_all_enterprises', {});
    });

    it('should return empty array when no enterprises exist', async () => {
      mockEnterpriseService.findAll.mockResolvedValue([]);
      mockClientProxy.send.mockReturnValueOnce({
        toPromise: jest.fn().mockResolvedValue(null), // Simula que no hay caché
      });

      const result = await controller.findAll();

      expect(result).toEqual([]);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return a single enterprise', async () => {
      mockEnterpriseService.findOne.mockResolvedValue(mockEnterprise);
      mockClientProxy.send.mockReturnValueOnce({
        toPromise: jest.fn().mockResolvedValue(null), // Simula que no hay caché
      });

      const result = await controller.findOne(mockEnterprise.enterprise_id);

      expect(result).toEqual(mockEnterprise);
      expect(service.findOne).toHaveBeenCalledWith(mockEnterprise.enterprise_id);
    });
  });

  describe('remove', () => {
    it('should remove an enterprise', async () => {
      mockEnterpriseService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(mockEnterprise.enterprise_id);

      expect(result).toEqual({ message: 'Enterprise deleted successfully' });
      expect(service.remove).toHaveBeenCalledWith(mockEnterprise.enterprise_id);
      expect(mockClientProxy.emit).toHaveBeenCalledWith('enterprise_deleted', { enterpriseId: mockEnterprise.enterprise_id });
      expect(mockClientProxy.emit).toHaveBeenCalledWith('invalidate_enterprise_cache', { id: mockEnterprise.enterprise_id });
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
