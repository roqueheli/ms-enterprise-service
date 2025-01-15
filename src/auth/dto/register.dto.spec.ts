import { validate } from 'class-validator';
import { RegisterDto } from './register.dto';

describe('RegisterDto', () => {
  let dto: RegisterDto;

  beforeEach(() => {
    dto = new RegisterDto();
    // Establecer valores válidos por defecto
    dto.email = 'admin@empresa.com';
    dto.first_name = 'Juan';
    dto.last_name = 'Pérez';
    dto.password = 'Admin123!';
  });

  describe('email validation', () => {
    it('should pass with valid email', async () => {
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail with invalid email format', async () => {
      dto.email = 'invalid-email';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isEmail');
    });

    it('should fail with empty email', async () => {
      dto.email = '';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isEmail');
    });
  });

  describe('first_name validation', () => {
    it('should pass with valid first name', async () => {
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail with empty first name', async () => {
      dto.first_name = '';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail with first name shorter than 2 characters', async () => {
      dto.first_name = 'J';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('minLength');
    });

    it('should fail with first name containing numbers', async () => {
      dto.first_name = 'Juan123';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('matches');
    });

    it('should pass with first name containing accented characters', async () => {
      dto.first_name = 'José María';
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('last_name validation', () => {
    it('should pass with valid last name', async () => {
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail with empty last name', async () => {
      dto.last_name = '';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail with last name shorter than 2 characters', async () => {
      dto.last_name = 'P';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('minLength');
    });

    it('should fail with last name containing numbers', async () => {
      dto.last_name = 'Pérez2';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('matches');
    });

    it('should pass with last name containing accented characters', async () => {
      dto.last_name = 'Rodríguez Pérez';
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('password validation', () => {
    it('should pass with valid password', async () => {
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail with password shorter than 8 characters', async () => {
      dto.password = 'Admin1!';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('minLength');
    });

    it('should fail without uppercase letters', async () => {
      dto.password = 'admin123!';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('matches');
    });

    it('should fail without lowercase letters', async () => {
      dto.password = 'ADMIN123!';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('matches');
    });

    it('should fail without numbers', async () => {
      dto.password = 'AdminAdmin!';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('matches');
    });
  });

  describe('complete DTO validation', () => {
    it('should pass with all valid fields', async () => {
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail with all empty fields', async () => {
      dto = new RegisterDto();
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should validate object creation and property assignment', () => {
      const testData = {
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        password: 'TestPass123!'
      };

      const testDto = new RegisterDto();
      Object.assign(testDto, testData);

      expect(testDto.email).toBe(testData.email);
      expect(testDto.first_name).toBe(testData.first_name);
      expect(testDto.last_name).toBe(testData.last_name);
      expect(testDto.password).toBe(testData.password);
    });
  });
});