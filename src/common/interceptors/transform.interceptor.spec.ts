// src/interceptors/transform.interceptor.spec.ts
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { of } from 'rxjs';
import { TransformInterceptor } from './transform.interceptor';

describe('TransformInterceptor', () => {
    let interceptor: TransformInterceptor<any>;
    let mockExecutionContext: ExecutionContext;
    let mockCallHandler: CallHandler;

    // Mock de fecha para pruebas consistentes
    const mockDate = '2024-01-15T12:00:00.000Z';

    beforeEach(async () => {
        // Crear una instancia del interceptor
        const module = await Test.createTestingModule({
            providers: [TransformInterceptor],
        }).compile();

        interceptor = module.get<TransformInterceptor<any>>(TransformInterceptor);

        // Mock para fecha consistente en pruebas
        jest.spyOn(Date.prototype, 'toISOString').mockReturnValue(mockDate);

        // Mock del CallHandler con jest.fn()
        mockCallHandler = {
            handle: jest.fn()
        } as CallHandler;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('intercept', () => {
        beforeEach(() => {
            // Mock del ExecutionContext
            mockExecutionContext = {
                switchToHttp: jest.fn().mockReturnValue({
                    getRequest: jest.fn().mockReturnValue({}),
                    getResponse: jest.fn().mockReturnValue({ statusCode: 200 }),
                }),
            } as any;
        });

        it('should transform response for regular routes', (done) => {
            // Mock de datos de respuesta
            const responseData = { foo: 'bar' };
            (mockCallHandler.handle as jest.Mock).mockReturnValue(of(responseData));

            // Mock de la URL de la solicitud
            (mockExecutionContext.switchToHttp() as any).getRequest.mockReturnValue({
                url: '/api/test',
            });

            // Ejecutar el interceptor
            interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
                next: (result) => {
                    expect(result).toEqual({
                        data: responseData,
                        statusCode: 200,
                        message: 'Success',
                        timestamp: mockDate,
                    });
                },
                complete: () => done(),
            });
        });

        it('should not transform response for /auth/login route', (done) => {
            // Mock de datos de respuesta
            const responseData = { token: 'jwt-token' };
            (mockCallHandler.handle as jest.Mock).mockReturnValue(of(responseData));

            // Mock de la URL de la solicitud
            (mockExecutionContext.switchToHttp() as any).getRequest.mockReturnValue({
                url: '/auth/login',
            });

            // Ejecutar el interceptor
            interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
                next: (result) => {
                    expect(result).toEqual(responseData);
                    expect(result).not.toHaveProperty('data');
                    expect(result).not.toHaveProperty('statusCode');
                    expect(result).not.toHaveProperty('message');
                    expect(result).not.toHaveProperty('timestamp');
                },
                complete: () => done(),
            });
        });

        it('should handle null response data', (done) => {
            // Mock de respuesta nula
            (mockCallHandler.handle as jest.Mock).mockReturnValue(of(null));

            // Mock de la URL de la solicitud
            (mockExecutionContext.switchToHttp() as any).getRequest.mockReturnValue({
                url: '/api/test',
            });

            // Ejecutar el interceptor
            interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
                next: (result) => {
                    expect(result).toEqual({
                        data: null,
                        statusCode: 200,
                        message: 'Success',
                        timestamp: mockDate,
                    });
                },
                complete: () => done(),
            });
        });

        it('should handle different status codes', (done) => {
            // Mock de datos de respuesta
            const responseData = { foo: 'bar' };
            (mockCallHandler.handle as jest.Mock).mockReturnValue(of(responseData));

            // Mock de la URL de la solicitud y código de estado
            mockExecutionContext.switchToHttp = jest.fn().mockReturnValue({
                getRequest: jest.fn().mockReturnValue({ url: '/api/test' }),
                getResponse: jest.fn().mockReturnValue({ statusCode: 201 }),
            });

            // Ejecutar el interceptor
            interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
                next: (result) => {
                    expect(result).toEqual({
                        data: responseData,
                        statusCode: 201,
                        message: 'Success',
                        timestamp: mockDate,
                    });
                },
                complete: () => done(),
            });
        });

        it('should preserve complex response structures', (done) => {
            // Mock de datos de respuesta complejos
            const complexData = {
                id: 1,
                nested: {
                    field: 'value',
                },
                array: [1, 2, 3],
            };
            (mockCallHandler.handle as jest.Mock).mockReturnValue(of(complexData));

            // Mock de la URL de la solicitud
            (mockExecutionContext.switchToHttp() as any).getRequest.mockReturnValue({
                url: '/api/test',
            });

            // Ejecutar el interceptor
            interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
                next: (result) => {
                    expect(result).toEqual({
                        data: complexData,
                        statusCode: 200,
                        message: 'Success',
                        timestamp: mockDate,
                    });
                    expect(result.data.nested).toBeDefined();
                    expect(result.data.array).toHaveLength(3);
                },
                complete: () => done(),
            });
        });
    });
});
