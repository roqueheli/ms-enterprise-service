-- Crear la base de datos
CREATE DATABASE enterprise_service_db;

-- Conectar a la base de datos
\c enterprise_service_db;

-- Extensión para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear enum para tipos de generación de reportes
CREATE TYPE report_generation_type AS ENUM ('immediate', 'batch');

-- Crear enum para tipos de acceso a reportes
CREATE TYPE report_access_type AS ENUM ('free', 'paid');

-- Tabla de administradores
CREATE TABLE admins (
    admin_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de empresas
CREATE TABLE enterprises (
    enterprise_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    website VARCHAR(255),
    industry VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(admin_id) ON DELETE RESTRICT
);

-- Tabla de configuraciones de empresas
CREATE TABLE enterprise_settings (
    setting_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enterprise_id UUID NOT NULL UNIQUE,
    report_generation_type report_generation_type DEFAULT 'immediate',
    batch_processing_time TIME,
    candidate_report_access_type report_access_type DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (enterprise_id) REFERENCES enterprises(enterprise_id) ON DELETE CASCADE
);

-- Función para actualizar el timestamp de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$ language 'plpgsql';

-- Triggers para actualizar updated_at automáticamente
CREATE TRIGGER update_admin_updated_at
    BEFORE UPDATE ON admins
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enterprise_updated_at
    BEFORE UPDATE ON enterprises
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enterprise_settings_updated_at
    BEFORE UPDATE ON enterprise_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Índices para mejorar el rendimiento
CREATE INDEX idx_admins_email ON admins(email);
CREATE INDEX idx_enterprises_admin_id ON enterprises(admin_id);
CREATE INDEX idx_enterprises_name ON enterprises(name);
CREATE INDEX idx_enterprise_settings_enterprise_id ON enterprise_settings(enterprise_id);

-- Comentarios en las tablas
COMMENT ON TABLE admins IS 'Tabla que almacena los administradores del sistema';
COMMENT ON TABLE enterprises IS 'Tabla que almacena la información de las empresas';
COMMENT ON TABLE enterprise_settings IS 'Tabla que almacena las configuraciones específicas de cada empresa';

-- Comentarios en las columnas
COMMENT ON COLUMN admins.admin_id IS 'Identificador único del administrador';
COMMENT ON COLUMN admins.email IS 'Correo electrónico del administrador (único)';
COMMENT ON COLUMN admins.password_hash IS 'Hash de la contraseña del administrador';

COMMENT ON COLUMN enterprises.enterprise_id IS 'Identificador único de la empresa';
COMMENT ON COLUMN enterprises.admin_id IS 'ID del administrador que creó/gestiona la empresa';
COMMENT ON COLUMN enterprises.name IS 'Nombre de la empresa';

COMMENT ON COLUMN enterprise_settings.setting_id IS 'Identificador único de la configuración';
COMMENT ON COLUMN enterprise_settings.report_generation_type IS 'Tipo de generación de reportes: immediate o batch';
COMMENT ON COLUMN enterprise_settings.candidate_report_access_type IS 'Tipo de acceso a reportes: free o paid';