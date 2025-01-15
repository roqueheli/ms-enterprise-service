import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEnterpriseDto } from './dto/create-enterprise.dto';
import { AccessType, ReportGenerationType } from './dto/enterprise-settings.dto';
import { UpdateEnterpriseDto } from './dto/update-enterprise.dto';
import { EnterprisesService } from './enterprises.service';
import { EnterpriseSettings } from './entities/enterprise-settings.entity';
import { Enterprise } from './entities/enterprise.entity';

describe('EnterprisesService', () => {
  let service: EnterprisesService;
  let enterpriseRepository: Repository<Enterprise>;
  let settingsRepository: Repository<EnterpriseSettings>;

  // Mock data
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

  const mockSettings: EnterpriseSettings = {
    setting_id: '987fcdeb-51a2-4bc1-9e3d-789012345678',
    report_generation_type: ReportGenerationType.IMMEDIATE,
    access_type: AccessType.FULL,
    enterprise: null,
    created_at: new Date(),
    updated_at: new Date(),
    toJSON: function () {
      const { enterprise, ...rest } = this;
      return rest;
    }
  };

  const mockCreateEnterpriseDto: CreateEnterpriseDto = {
    name: 'Test Enterprise',
    contact_email: 'test@enterprise.com',
    website: 'https://test-enterprise.com',
    description: 'Test enterprise description',
    industry: 'Technology',
    settings: {
      id: '987fcdeb-51a2-4bc1-9e3d-789012345678', // Proporcionar un ID válido
      report_generation_type: ReportGenerationType.IMMEDIATE,
      access_type: AccessType.FULL
    }
  };

  const mockUpdateEnterpriseDto: UpdateEnterpriseDto = {
    name: 'Updated Enterprise',
    settings: {
      id: '987fcdeb-51a2-4bc1-9e3d-789012345678', // Proporcionar un ID válido
      access_type: AccessType.LIMITED
    }
  };

  // Mock repositories
  const mockEnterpriseRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockSettingsRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnterprisesService,
        {
          provide: getRepositoryToken(Enterprise),
          useValue: mockEnterpriseRepository,
        },
        {
          provide: getRepositoryToken(EnterpriseSettings),
          useValue: mockSettingsRepository,
        },
      ],
    }).compile();

    service = module.get<EnterprisesService>(EnterprisesService);
    enterpriseRepository = module.get<Repository<Enterprise>>(getRepositoryToken(Enterprise));
    settingsRepository = module.get<Repository<EnterpriseSettings>>(getRepositoryToken(EnterpriseSettings));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an enterprise without settings', async () => {
      const dtoWithoutSettings = { ...mockCreateEnterpriseDto };
      delete dtoWithoutSettings.settings;

      const enterpriseWithoutSettings = { ...mockEnterprise };
      mockEnterpriseRepository.save.mockResolvedValue(enterpriseWithoutSettings);

      const result = await service.create(dtoWithoutSettings);

      expect(result).toEqual(enterpriseWithoutSettings);
      expect(mockEnterpriseRepository.save).toHaveBeenCalled();
    });

    it('should create an enterprise with settings', async () => {
      const enterpriseWithSettings = {
        ...mockEnterprise,
        settings: mockSettings,
      };
      mockEnterpriseRepository.save.mockResolvedValue(enterpriseWithSettings);

      const result = await service.create(mockCreateEnterpriseDto);

      expect(result).toEqual(enterpriseWithSettings);
      expect(mockEnterpriseRepository.save).toHaveBeenCalled();
    });

    it('should handle save errors', async () => {
      mockEnterpriseRepository.save.mockRejectedValue(new Error('Save failed'));

      await expect(service.create(mockCreateEnterpriseDto))
        .rejects
        .toThrow('Save failed');
    });
  });

  describe('findAll', () => {
    it('should return an array of enterprises', async () => {
      const enterprises = [mockEnterprise];
      mockEnterpriseRepository.find.mockResolvedValue(enterprises);

      const result = await service.findAll();

      expect(result).toEqual(enterprises);
      expect(mockEnterpriseRepository.find).toHaveBeenCalledWith({
        relations: ['settings']
      });
    });

    it('should return empty array when no enterprises exist', async () => {
      mockEnterpriseRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(mockEnterpriseRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return an enterprise when it exists', async () => {
      mockEnterpriseRepository.findOne.mockResolvedValue(mockEnterprise);

      const result = await service.findOne(mockEnterprise.enterprise_id);

      expect(result).toEqual(mockEnterprise);
      expect(mockEnterpriseRepository.findOne).toHaveBeenCalledWith({
        where: { enterprise_id: mockEnterprise.enterprise_id },
        relations: ['settings']
      });
    });

    it('should throw NotFoundException when enterprise does not exist', async () => {
      mockEnterpriseRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id'))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an enterprise and its settings', async () => {
      const enterpriseToUpdate = {
        ...mockEnterprise,
        settings: mockSettings,
      };
      mockEnterpriseRepository.findOne.mockResolvedValue(enterpriseToUpdate);

      const updatedEnterprise = {
        ...enterpriseToUpdate,
        ...mockUpdateEnterpriseDto,
        settings: {
          ...enterpriseToUpdate.settings,
          ...mockUpdateEnterpriseDto.settings,
        },
      };
      mockEnterpriseRepository.save.mockResolvedValue(updatedEnterprise);

      const result = await service.update(mockEnterprise.enterprise_id, mockUpdateEnterpriseDto);

      expect(result).toEqual(updatedEnterprise);
      expect(mockEnterpriseRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when enterprise to update does not exist', async () => {
      mockEnterpriseRepository.findOne.mockResolvedValue(null);

      await expect(service.update('non-existent-id', mockUpdateEnterpriseDto))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove an enterprise', async () => {
      mockEnterpriseRepository.findOne.mockResolvedValue(mockEnterprise);
      mockEnterpriseRepository.remove.mockResolvedValue(mockEnterprise);

      await service.remove(mockEnterprise.enterprise_id);

      expect(mockEnterpriseRepository.remove).toHaveBeenCalledWith(mockEnterprise);
    });

    it('should throw NotFoundException when enterprise to remove does not exist', async () => {
      mockEnterpriseRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent-id'))
        .rejects
        .toThrow(NotFoundException);
    });
  });
});