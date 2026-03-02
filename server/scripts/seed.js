require('dotenv/config');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const categories = [
  { name: 'Sport', slug: 'sport', color: '#E74C3C', icon: '⚽', description: 'Événements sportifs, compétitions, courses', sort_order: 1 },
  { name: 'Famille', slug: 'famille', color: '#8E44AD', icon: '👨‍👩‍👧‍👦', description: 'Activités familiales, loisirs enfants', sort_order: 2 },
  { name: 'Cinéma / Avant-premières', slug: 'cinema', color: '#2C3E50', icon: '🎬', description: 'Projections, avant-premières, ciné-plein air', sort_order: 3 },
  { name: 'Foires / Salons', slug: 'foires-salons', color: '#E67E22', icon: '🎪', description: 'Foires commerciales, salons thématiques', sort_order: 4 },
  { name: 'Marchés forains', slug: 'marches', color: '#D4AC0D', icon: '🧺', description: 'Marchés réguliers et marchés spéciaux', sort_order: 5 },
  { name: 'Expositions', slug: 'expositions', color: '#1ABC9C', icon: '🖼️', description: 'Expositions artistiques, photographiques', sort_order: 6 },
  { name: 'Théâtre / Humour', slug: 'theatre-humour', color: '#9B59B6', icon: '🎭', description: 'Pièces, one-man-shows, spectacles vivants', sort_order: 7 },
  { name: 'Musique / Concerts', slug: 'musique-concerts', color: '#E91E63', icon: '🎵', description: 'Concerts, showcases, soirées musicales', sort_order: 8 },
  { name: 'Festivals', slug: 'festivals', color: '#F39C12', icon: '🎉', description: 'Festivals multi-jours, grands événements culturels', sort_order: 9 },
  { name: 'Brocantes / Vide-greniers', slug: 'brocantes', color: '#795548', icon: '📦', description: 'Brocantes, vide-greniers, marchés aux puces', sort_order: 10 },
  { name: 'Fêtes / Traditions', slug: 'fetes-traditions', color: '#C0392B', icon: '🪔', description: 'Fêtes religieuses, culturelles, traditionnelles', sort_order: 11 },
  { name: 'Gastronomie', slug: 'gastronomie', color: '#FF5722', icon: '🍴', description: 'Fêtes culinaires, dégustations', sort_order: 12 },
  { name: 'Nature / Randonnées', slug: 'nature-rando', color: '#27AE60', icon: '🌿', description: 'Événements nature, sorties organisées', sort_order: 13 },
  { name: 'Conférences / Ateliers', slug: 'conferences-ateliers', color: '#3498DB', icon: '🎤', description: 'Conférences, ateliers, formations', sort_order: 14 },
  { name: 'Solidaire / Associatif', slug: 'solidaire', color: '#FF8A80', icon: '🤝', description: 'Collectes, événements caritatifs', sort_order: 15 },
  { name: 'Danse', slug: 'danse', color: '#AB47BC', icon: '💃', description: 'Spectacles de danse, bals, soirées', sort_order: 16 },
];

const communes = [
  // Nord
  { name: 'Saint-Denis', slug: 'saint-denis', micro_region: 'Nord', latitude: -20.8789, longitude: 55.4481, postal_code: '97400' },
  { name: 'Sainte-Marie', slug: 'sainte-marie', micro_region: 'Nord', latitude: -20.9060, longitude: 55.5367, postal_code: '97438' },
  { name: 'Sainte-Suzanne', slug: 'sainte-suzanne', micro_region: 'Nord', latitude: -20.9079, longitude: 55.6041, postal_code: '97441' },
  // Est
  { name: 'Saint-André', slug: 'saint-andre', micro_region: 'Est', latitude: -20.9614, longitude: 55.6544, postal_code: '97440' },
  { name: 'Bras-Panon', slug: 'bras-panon', micro_region: 'Est', latitude: -21.0000, longitude: 55.6833, postal_code: '97412' },
  { name: 'Saint-Benoît', slug: 'saint-benoit', micro_region: 'Est', latitude: -21.0367, longitude: 55.7167, postal_code: '97470' },
  { name: 'Sainte-Rose', slug: 'sainte-rose', micro_region: 'Est', latitude: -21.1167, longitude: 55.7833, postal_code: '97439' },
  { name: 'La Plaine-des-Palmistes', slug: 'plaine-des-palmistes', micro_region: 'Est', latitude: -21.1333, longitude: 55.6333, postal_code: '97431' },
  { name: 'Salazie', slug: 'salazie', micro_region: 'Est', latitude: -21.0500, longitude: 55.5333, postal_code: '97433' },
  // Sud
  { name: 'Saint-Pierre', slug: 'saint-pierre', micro_region: 'Sud', latitude: -21.3393, longitude: 55.4781, postal_code: '97410' },
  { name: 'Le Tampon', slug: 'le-tampon', micro_region: 'Sud', latitude: -21.2783, longitude: 55.5180, postal_code: '97430' },
  { name: 'Saint-Louis', slug: 'saint-louis', micro_region: 'Sud', latitude: -21.2833, longitude: 55.4167, postal_code: '97450' },
  { name: 'Cilaos', slug: 'cilaos', micro_region: 'Sud', latitude: -21.1333, longitude: 55.4667, postal_code: '97413' },
  { name: 'Entre-Deux', slug: 'entre-deux', micro_region: 'Sud', latitude: -21.2500, longitude: 55.4833, postal_code: '97414' },
  { name: 'Saint-Joseph', slug: 'saint-joseph', micro_region: 'Sud', latitude: -21.3833, longitude: 55.6167, postal_code: '97480' },
  { name: 'Petite-Île', slug: 'petite-ile', micro_region: 'Sud', latitude: -21.3667, longitude: 55.5667, postal_code: '97429' },
  { name: 'Saint-Philippe', slug: 'saint-philippe', micro_region: 'Sud', latitude: -21.3583, longitude: 55.7667, postal_code: '97442' },
  // Ouest
  { name: 'Saint-Paul', slug: 'saint-paul', micro_region: 'Ouest', latitude: -21.0100, longitude: 55.2700, postal_code: '97460' },
  { name: 'Le Port', slug: 'le-port', micro_region: 'Ouest', latitude: -20.9356, longitude: 55.2939, postal_code: '97420' },
  { name: 'La Possession', slug: 'la-possession', micro_region: 'Ouest', latitude: -20.9333, longitude: 55.3333, postal_code: '97419' },
  { name: 'Trois-Bassins', slug: 'trois-bassins', micro_region: 'Ouest', latitude: -21.1000, longitude: 55.3000, postal_code: '97426' },
  { name: 'Saint-Leu', slug: 'saint-leu', micro_region: 'Ouest', latitude: -21.1667, longitude: 55.2833, postal_code: '97436' },
  { name: 'Les Avirons', slug: 'les-avirons', micro_region: 'Ouest', latitude: -21.2333, longitude: 55.3333, postal_code: '97425' },
  { name: "L'Étang-Salé", slug: 'etang-sale', micro_region: 'Ouest', latitude: -21.2667, longitude: 55.3500, postal_code: '97427' },
];

async function seed() {
  const client = await pool.connect();
  try {
    // Seed catégories
    for (const cat of categories) {
      await client.query(
        `INSERT INTO categories (name, slug, color, icon, description, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (slug) DO NOTHING`,
        [cat.name, cat.slug, cat.color, cat.icon, cat.description, cat.sort_order]
      );
    }
    console.log(`✅ ${categories.length} catégories insérées`);

    // Seed communes
    for (const com of communes) {
      await client.query(
        `INSERT INTO communes (name, slug, micro_region, latitude, longitude, postal_code)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (slug) DO NOTHING`,
        [com.name, com.slug, com.micro_region, com.latitude, com.longitude, com.postal_code]
      );
    }
    console.log(`✅ ${communes.length} communes insérées`);

    // Seed admin
    const adminEmail = 'admin@alealon.re';
    const { rows } = await client.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
    if (rows.length === 0) {
      const hash = await bcrypt.hash('admin1234', 12);
      await client.query(
        'INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4)',
        [adminEmail, hash, 'Administrateur', 'admin']
      );
      console.log(`✅ Admin créé : ${adminEmail} / admin1234`);
    } else {
      console.log('⏭️  Admin existe déjà');
    }

    // Seed scraping sources
    const sources = [
      { name: 'Guide Réunion', url: 'https://www.guide-reunion.fr/evenements/', tier: 1, frequency: 'daily' },
      { name: 'Azenda.re', url: 'https://azenda.re', tier: 1, frequency: 'daily' },
      { name: '974 Agenda Culturel', url: 'https://974.agendaculturel.fr', tier: 1, frequency: 'daily' },
      { name: 'Bongou.re', url: 'https://bongou.re/sorties', tier: 1, frequency: 'daily' },
      { name: 'Office Tourisme Ouest', url: 'https://www.ouest-lareunion.com/agenda', tier: 1, frequency: 'daily' },
      { name: 'Office Tourisme Est', url: 'https://www.reunionest.fr/agenda-et-evenements', tier: 1, frequency: 'daily' },
      { name: 'MonTicket.re', url: 'https://monticket.re', tier: 1, frequency: 'daily' },
    ];

    for (const src of sources) {
      await client.query(
        `INSERT INTO scraping_sources (name, url, tier, frequency, active)
         VALUES ($1, $2, $3, $4, false)
         ON CONFLICT DO NOTHING`,
        [src.name, src.url, src.tier, src.frequency]
      );
    }
    console.log(`✅ ${sources.length} sources de scraping insérées (inactives)`);

    console.log('\n🎉 Seed terminé !');
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(err => {
  console.error('Erreur seed:', err);
  process.exit(1);
});
