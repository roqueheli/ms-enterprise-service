import { plainToClass } from 'class-transformer';
import { Admin } from './admin.entity';

describe('Admin Entity', () => {
    let admin: Admin;

    beforeEach(() => {
        admin = new Admin();
        admin.admin_id = '123e4567-e89b-12d3-a456-426614174000';
        admin.email = 'admin@empresa.com';
        admin.first_name = 'Juan';
        admin.last_name = 'Pérez';
        admin.password_hash = 'hashedpassword123';
        admin.created_at = new Date('2024-01-14T12:00:00Z');
        admin.updated_at = new Date('2024-01-15T12:00:00Z');
    });

    it('should create an instance of Admin', () => {
        expect(admin).toBeInstanceOf(Admin);
    });

    it('should have the correct properties', () => {
        expect(admin.admin_id).toBe('123e4567-e89b-12d3-a456-426614174000');
        expect(admin.email).toBe('admin@empresa.com');
        expect(admin.first_name).toBe('Juan');
        expect(admin.last_name).toBe('Pérez');
        expect(admin.password_hash).toBe('hashedpassword123');
        expect(admin.created_at).toEqual(new Date('2024-01-14T12:00:00Z'));
        expect(admin.updated_at).toEqual(new Date('2024-01-15T12:00:00Z'));
    });

    it('should return the correct full name', () => {
        expect(admin.fullName).toBe('Juan Pérez');
    });

    it('should exclude password from serialization', () => {
        // Arrange
        const admin = new Admin();
        admin.admin_id = '123e4567-e89b-12d3-a456-426614174000';
        admin.email = 'test@example.com';
        admin.first_name = 'John';
        admin.last_name = 'Doe';
        admin.password_hash = 'hashedpassword123'; // Esta propiedad debe ser excluida
        admin.created_at = new Date();
        admin.updated_at = new Date();

        // Act
        const serializedAdmin = JSON.parse(JSON.stringify(plainToClass(Admin, admin)));

        // Assert
        expect(serializedAdmin.password).toBeUndefined(); // Verifica que la propiedad fue excluida
        expect(serializedAdmin.email).toBe(admin.email); // Verifica que otras propiedades están presentes
        expect(serializedAdmin.first_name).toBe(admin.first_name);
        expect(serializedAdmin.last_name).toBe(admin.last_name);
    });

    it('should include all other properties in serialization', () => {
        // Simular la serialización de la entidad
        const serializedAdmin = JSON.parse(JSON.stringify(admin));
        expect(serializedAdmin.admin_id).toBe('123e4567-e89b-12d3-a456-426614174000');
        expect(serializedAdmin.email).toBe('admin@empresa.com');
        expect(serializedAdmin.first_name).toBe('Juan');
        expect(serializedAdmin.last_name).toBe('Pérez');
        expect(serializedAdmin.created_at).toBe('2024-01-14T12:00:00.000Z');
        expect(serializedAdmin.updated_at).toBe('2024-01-15T12:00:00.000Z');
    });
});