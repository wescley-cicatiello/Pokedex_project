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
