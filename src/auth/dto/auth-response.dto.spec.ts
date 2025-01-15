import { Admin } from '../../admin/entities/admin.entity';
import { AuthResponseDto } from './auth-response.dto';

describe('AuthResponseDto', () => {
    let dto: AuthResponseDto;
    let mockAdmin: Admin;

    beforeEach(() => {
        // Crear un admin mock
        mockAdmin = new Admin();
        Object.assign(mockAdmin, {
            admin_id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'admin@empresa.com',
            first_name: 'John',
            last_name: 'Doe',
            created_at: new Date(),
            updated_at: new Date()
        });

        // Crear una instancia del DTO
        dto = new AuthResponseDto();
        dto.access_token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
        dto.admin = mockAdmin;
    });

    describe('DTO Structure', () => {
        it('should create an instance of AuthResponseDto', () => {
            expect(dto).toBeInstanceOf(AuthResponseDto);
        });

        it('should have access_token property', () => {
            expect(dto).toHaveProperty('access_token');
        });

        it('should have admin property', () => {
            expect(dto).toHaveProperty('admin');
        });
    });

    describe('Property Values', () => {
        it('should store access_token correctly', () => {
            const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
            dto.access_token = token;
            expect(dto.access_token).toBe(token);
        });

        it('should store admin object correctly', () => {
            expect(dto.admin).toBe(mockAdmin);
            expect(dto.admin.admin_id).toBe(mockAdmin.admin_id);
            expect(dto.admin.email).toBe(mockAdmin.email);
            expect(dto.admin.first_name).toBe(mockAdmin.first_name);
            expect(dto.admin.last_name).toBe(mockAdmin.last_name);
        });
    });

    describe('Object Creation and Assignment', () => {
        it('should create DTO from plain object', () => {
            const plainObject = {
                access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                admin: mockAdmin
            };

            const newDto = new AuthResponseDto();
            Object.assign(newDto, plainObject);

            expect(newDto.access_token).toBe(plainObject.access_token);
            expect(newDto.admin).toBe(plainObject.admin);
        });

        it('should handle partial object assignment', () => {
            const partialDto = new AuthResponseDto();

            // Asignar solo access_token
            partialDto.access_token = 'some-token';
            expect(partialDto.access_token).toBe('some-token');
            expect(partialDto.admin).toBeUndefined();

            // Asignar solo admin
            partialDto.admin = mockAdmin;
            expect(partialDto.admin).toBe(mockAdmin);
        });
    });

    describe('Data Integrity', () => {
        it('should maintain admin object structure', () => {
            expect(dto.admin).toEqual(expect.objectContaining({
                admin_id: expect.any(String),
                email: expect.any(String),
                first_name: expect.any(String),
                last_name: expect.any(String),
                created_at: expect.any(Date),
                updated_at: expect.any(Date)
            }));
        });

        it('should not expose admin password_hash', () => {
            const serializedDto = JSON.parse(JSON.stringify(dto));
            expect(serializedDto.admin.password_hash).toBeUndefined();
        });
    });

    describe('Type Safety', () => {
        it('should accept valid JWT token format', () => {
            const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
            dto.access_token = validToken;
            expect(dto.access_token).toBe(validToken);
        });

        it('should accept Admin instance for admin property', () => {
            const newAdmin = new Admin();
            Object.assign(newAdmin, mockAdmin);
            dto.admin = newAdmin;
            expect(dto.admin).toBeInstanceOf(Admin);
        });
    });

    describe('Serialization', () => {
        it('should serialize to JSON correctly', () => {
            const serialized = JSON.stringify(dto);
            const parsed = JSON.parse(serialized);

            expect(parsed).toHaveProperty('access_token');
            expect(parsed).toHaveProperty('admin');
            expect(parsed.admin).toHaveProperty('admin_id');
            expect(parsed.admin).toHaveProperty('email');
        });

        it('should maintain data types after serialization', () => {
            const serialized = JSON.stringify(dto);
            const parsed = JSON.parse(serialized);

            expect(typeof parsed.access_token).toBe('string');
            expect(typeof parsed.admin).toBe('object');
            expect(typeof parsed.admin.admin_id).toBe('string');
            expect(typeof parsed.admin.email).toBe('string');
        });
    });
});