import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import dataSource from '../ormconfig'; // Importa tu configuración de TypeORM
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { AppModule } from './../src/app.module';

describe('Enterprise Service API (e2e)', () => {
  let app: INestApplication;
  let dbConnection: DataSource;
  let authToken: string;
  let enterpriseId: string;
  let adminId: string;

  // Datos de prueba
  const testAdmin = {
    email: 'admin@test.com',
    password: 'Test123!',
    first_name: 'Test',
    last_name: 'Admin',
  };

  const testEnterprise = {
    name: 'Test Enterprise',
    contact_email: 'contact@testenterprise.com',
    website: 'https://testenterprise.com',
    settings: {
      report_generation_type: 'AUTOMATIC',
      access_type: 'FULL',
    },
  };

  beforeAll(async () => {
    // Inicializa la conexión a la base de datos
    dbConnection = await dataSource.initialize();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Configuración global
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    app.useGlobalInterceptors(new TransformInterceptor());

    await app.init();
  });

  afterAll(async () => {
    // Limpia la base de datos y cierra la conexión
    await cleanDatabase();
    await dbConnection.destroy();
    await app.close();
  });

  // Limpia todas las tablas de la base de datos
  async function cleanDatabase() {
    const entities = dbConnection.entityMetadatas;

    for (const entity of entities) {
      const repository = dbConnection.getRepository(entity.name);
      await repository.query(`TRUNCATE "${entity.tableName}" CASCADE;`);
    }
  }

  describe('Documentation', () => {
    it('/api/docs (GET) - Should serve Swagger documentation', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/docs')
        .expect(200);

      console.log('Response status:', response.status);
      console.log('Response type:', response.type);
      console.log('Response text contains swagger:', response.text.includes('swagger'));

      expect(response.text).toContain('swagger');
      expect(response.text).toContain('Enterprise Service API');
    });
  });

  describe('Authentication', () => {
    it('/auth/register (POST) - Should register a new admin', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(testAdmin)
        .expect(201)
        .expect((res) => {
          expect(res.body.data.admin).toHaveProperty('admin_id');
          expect(res.body.data.admin.email).toBe(testAdmin.email);
          adminId = res.body.data.admin.admin_id;
        });
    });

    it('/auth/login (POST) - Should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testAdmin.email,
          password: testAdmin.password,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          authToken = res.body.access_token;
          console.log(authToken);
          
        });
    });

    it('/auth/login (POST) - Should fail with invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testAdmin.email,
          password: 'wrongpassword',
        })
        .expect(401);
    });
  });

  describe('Enterprises', () => {
    it('/enterprises (POST) - Should create a new enterprise', () => {
      return request(app.getHttpServer())
        .post('/enterprises')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testEnterprise)
        .expect(201)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.name).toBe(testEnterprise.name);
          expect(res.body.data).toHaveProperty('settings');
          enterpriseId = res.body.data.id;
        });
    });

    it('/enterprises (GET) - Should get all enterprises', () => {
      return request(app.getHttpServer())
        .get('/enterprises')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toBeGreaterThan(0);
        });
    });

    it('/enterprises/:id (GET) - Should get enterprise by ID', () => {
      return request(app.getHttpServer())
        .get(`/enterprises/${enterpriseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.id).toBe(enterpriseId);
          expect(res.body.data.name).toBe(testEnterprise.name);
        });
    });

    it('/enterprises/:id (PATCH) - Should update enterprise', () => {
      const updateData = {
        name: 'Updated Enterprise Name',
        settings: {
          report_generation_type: 'MANUAL'
        }
      };

      return request(app.getHttpServer())
        .patch(`/enterprises/${enterpriseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.name).toBe(updateData.name);
          expect(res.body.data.settings.report_generation_type).toBe(updateData.settings.report_generation_type);
        });
    });

    it('/enterprises/:id (DELETE) - Should delete enterprise', () => {
      return request(app.getHttpServer())
        .delete(`/enterprises/${enterpriseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });

  describe('Admins', () => {
    it('/admin (GET) - Should get all admins', () => {
      return request(app.getHttpServer())
        .get('/admin')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toBeGreaterThan(0);
        });
    });

    it('/admin/:id (GET) - Should get admin by ID', () => {
      return request(app.getHttpServer())
        .get(`/admin/${adminId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.id).toBe(adminId);
          expect(res.body.data.email).toBe(testAdmin.email);
        });
    });

    it('/admin/:id (PATCH) - Should update admin', () => {
      const updateData = {
        first_name: 'Updated',
        last_name: 'Name'
      };

      return request(app.getHttpServer())
        .patch(`/admin/${adminId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.first_name).toBe(updateData.first_name);
          expect(res.body.data.last_name).toBe(updateData.last_name);
        });
    });
  });

  describe('Error Handling', () => {
    it('Should handle invalid JWT token', () => {
      return request(app.getHttpServer())
        .get('/enterprises')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('Should handle invalid enterprise ID', () => {
      return request(app.getHttpServer())
        .get('/enterprises/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('Should handle non-existent enterprise', () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      return request(app.getHttpServer())
        .get(`/enterprises/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('Should handle validation errors', () => {
      return request(app.getHttpServer())
        .post('/enterprises')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '', // nombre vacío debería fallar la validación
          contact_email: 'invalid-email' // email inválido
        })
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(Array.isArray(res.body.message)).toBe(true);
        });
    });
  });
});