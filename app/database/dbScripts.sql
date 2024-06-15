-- Enable the uuid-ossp extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the project table if it doesn't exist
CREATE TABLE IF NOT EXISTS project (
    project_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_name VARCHAR(255) NOT NULL,
    project_description VARCHAR(255),
    owner_id VARCHAR(255) NOT NULL
);
