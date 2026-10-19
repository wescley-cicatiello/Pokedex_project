CREATE TABLE IF NOT EXISTS pokemon (
    id SMALLINT PRIMARY KEY CHECK (id BETWEEN 1 AND 151),
    name VARCHAR(40) NOT NULL UNIQUE,
    types JSONB NOT NULL,
    height NUMERIC(5,2) NOT NULL,
    weight NUMERIC(6,2) NOT NULL,
    abilities JSONB NOT NULL,
    stats JSONB NOT NULL,
    image TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS pokemon_profiles (
    pokemon_id SMALLINT NOT NULL REFERENCES pokemon(id),
    reference VARCHAR(20) NOT NULL CHECK (reference = 'letsgo'),
    data JSONB NOT NULL,
    PRIMARY KEY (pokemon_id, reference)
);
CREATE TABLE IF NOT EXISTS game_datasets (
    reference VARCHAR(20) PRIMARY KEY CHECK (reference = 'letsgo'),
    data JSONB NOT NULL
);
CREATE TABLE IF NOT EXISTS game_versions (
    version VARCHAR(24) PRIMARY KEY,
    data JSONB NOT NULL
);
CREATE TABLE IF NOT EXISTS version_pokemon (
    version VARCHAR(24) NOT NULL REFERENCES game_versions(version),
    pokemon_id SMALLINT NOT NULL CHECK (pokemon_id BETWEEN 1 AND 809),
    data JSONB NOT NULL,
    PRIMARY KEY (version, pokemon_id)
);
CREATE TABLE IF NOT EXISTS version_atlases (
    version VARCHAR(24) PRIMARY KEY REFERENCES game_versions(version),
    data JSONB NOT NULL
);
