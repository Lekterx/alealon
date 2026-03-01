-- Migration 001: Schema initial Alé Alon

-- Table de suivi des migrations
CREATE TABLE IF NOT EXISTS migrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Utilisateurs (admin)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Catégories d'événements
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  color VARCHAR(7) NOT NULL,
  icon VARCHAR(10) NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Communes de La Réunion
CREATE TABLE IF NOT EXISTS communes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  micro_region VARCHAR(10) NOT NULL,
  latitude DECIMAL(9,6),
  longitude DECIMAL(9,6),
  postal_code VARCHAR(5)
);

-- Événements
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(300) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  date_start TIMESTAMPTZ NOT NULL,
  date_end TIMESTAMPTZ,
  recurrence VARCHAR(20) DEFAULT 'unique',
  address TEXT NOT NULL,
  commune_id INT REFERENCES communes(id),
  latitude DECIMAL(9,6),
  longitude DECIMAL(9,6),
  image_url TEXT,
  external_link TEXT,
  price VARCHAR(100),
  organizer VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  source VARCHAR(20) NOT NULL DEFAULT 'manual',
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_date_start ON events(date_start);
CREATE INDEX IF NOT EXISTS idx_events_commune ON events(commune_id);
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_featured ON events(featured);
CREATE INDEX IF NOT EXISTS idx_events_source ON events(source);

-- Relation N:N événements <-> catégories
CREATE TABLE IF NOT EXISTS event_categories (
  event_id INT REFERENCES events(id) ON DELETE CASCADE,
  category_id INT REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, category_id)
);

-- Soumissions d'événements par les visiteurs
CREATE TABLE IF NOT EXISTS submissions (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category_ids TEXT,
  date_start TIMESTAMPTZ NOT NULL,
  date_end TIMESTAMPTZ,
  address TEXT NOT NULL,
  commune_id INT REFERENCES communes(id),
  image_url TEXT,
  external_link TEXT,
  price VARCHAR(100),
  organizer VARCHAR(255),
  contact_email VARCHAR(255),
  submitter_email VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending',
  rejection_reason TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);

-- Campagnes publicitaires
CREATE TABLE IF NOT EXISTS ad_campaigns (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  advertiser VARCHAR(255) NOT NULL,
  image_url TEXT,
  destination_url TEXT NOT NULL,
  date_start DATE NOT NULL,
  date_end DATE NOT NULL,
  placements TEXT[] NOT NULL,
  impressions_bought INT,
  priority VARCHAR(10) DEFAULT 'normal',
  target_communes TEXT,
  target_categories TEXT,
  status VARCHAR(20) DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tracking impressions pub
CREATE TABLE IF NOT EXISTS ad_impressions (
  id SERIAL PRIMARY KEY,
  campaign_id INT REFERENCES ad_campaigns(id) ON DELETE CASCADE,
  placement VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ad_impressions_campaign ON ad_impressions(campaign_id);

-- Tracking clics pub
CREATE TABLE IF NOT EXISTS ad_clicks (
  id SERIAL PRIMARY KEY,
  campaign_id INT REFERENCES ad_campaigns(id) ON DELETE CASCADE,
  placement VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ad_clicks_campaign ON ad_clicks(campaign_id);

-- Mises en avant payantes d'événements
CREATE TABLE IF NOT EXISTS event_boosts (
  id SERIAL PRIMARY KEY,
  event_id INT REFERENCES events(id) ON DELETE CASCADE,
  boost_type VARCHAR(20) NOT NULL,
  date_start DATE NOT NULL,
  date_end DATE NOT NULL,
  amount DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sources de scraping
CREATE TABLE IF NOT EXISTS scraping_sources (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  tier INT DEFAULT 1,
  frequency VARCHAR(20) DEFAULT 'daily',
  field_mapping JSONB,
  category_mapping JSONB,
  active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Logs de scraping
CREATE TABLE IF NOT EXISTS scraping_logs (
  id SERIAL PRIMARY KEY,
  source_id INT REFERENCES scraping_sources(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL,
  events_found INT DEFAULT 0,
  events_created INT DEFAULT 0,
  events_duplicated INT DEFAULT 0,
  errors TEXT,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_scraping_logs_source ON scraping_logs(source_id);
