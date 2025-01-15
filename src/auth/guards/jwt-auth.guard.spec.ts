import { createMock } from '@golevelup/ts-jest';
import { ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

// Mock correcto de AuthGuard
jest.mock('@nestjs/passport', () => {
    const actual = jest.requireActual('@nestjs/passport');
    return {
        ...actual,
        AuthGuard: jest.fn(() => {
            class MockAuthGuard {
                canActivate(context: ExecutionContext) {
                    return true;
                }
            }
            return MockAuthGuard;
        }),
    };
});

describe('JwtAuthGuard', () => {
    let guard: JwtAuthGuard;

    beforeEach(() => {
        jest.clearAllMocks();
        guard = new JwtAuthGuard();
    });

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    describe('canActivate', () => {
        it('should allow access with valid context', async () => {
            const mockExecutionContext = createMock<ExecutionContext>({
                switchToHttp: () => ({
                    getRequest: () => ({
                        headers: {
                            authorization: 'Bearer valid.jwt.token'
                        }
                    })
                })
            });

            const result = await guard.canActivate(mockExecutionContext);
            expect(result).toBeTruthy();
        });
    });

    describe('context handling', () => {
        it('should handle HTTP context correctly', () => {
            const mockExecutionContext = createMock<ExecutionContext>({
                switchToHttp: () => ({
                    getRequest: () => ({
                        headers: {
                            authorization: 'Bearer valid.jwt.token'
                        }
                    })
                })
            });

            expect(() => {
                guard.canActivate(mockExecutionContext);
            }).not.toThrow();
        });

        it('should handle request without authorization header', () => {
            const mockExecutionContext = createMock<ExecutionContext>({
                switchToHttp: () => ({
                    getRequest: () => ({
                        headers: {}
                    })
                })
            });

            expect(() => {
                guard.canActivate(mockExecutionContext);
            }).not.toThrow();
        });
    });

    describe('guard instantiation', () => {
        it('should create an instance of JwtAuthGuard', () => {
            expect(guard).toBeInstanceOf(JwtAuthGuard);
        });
    });
});