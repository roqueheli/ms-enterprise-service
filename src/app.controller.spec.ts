import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            getHello: jest.fn().mockReturnValue('Hello World!'),
          },
        },
      ],
    }).compile();

    appController = module.get<AppController>(AppController);
    appService = module.get<AppService>(AppService);
  });

  describe('root', () => {
    it('should be defined', () => {
      expect(appController).toBeDefined();
    });

    it('should call appService.getHello()', () => {
      appController.getHello();
      expect(appService.getHello).toHaveBeenCalled();
    });

    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('Error Handling', () => {
    it('should handle service errors', () => {
      jest.spyOn(appService, 'getHello').mockImplementation(() => {
        throw new Error('Service error');
      });

      expect(() => appController.getHello()).toThrow('Service error');
    });
  });

  // Pruebas de integración básicas
  describe('Integration', () => {
    it('should work with actual AppService', async () => {
      const moduleRef = await Test.createTestingModule({
        controllers: [AppController],
        providers: [AppService],
      }).compile();

      const controller = moduleRef.get<AppController>(AppController);
      expect(controller.getHello()).toBe('Hello World!');
    });
  });
});
