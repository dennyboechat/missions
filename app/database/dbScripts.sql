-- Enable the uuid-ossp extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS app_user (
    user_id VARCHAR(255) NOT NULL PRIMARY KEY,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS project (
    project_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_name VARCHAR(255) NOT NULL,
    project_description VARCHAR(255),
    owner_id VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS project_user (
    project_user_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    is_user_active BOOLEAN NOT NULL,
    CONSTRAINT fk_project FOREIGN KEY(project_id) REFERENCES project(project_id) ON DELETE CASCADE,
    CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES app_user(user_id) ON DELETE CASCADE
);