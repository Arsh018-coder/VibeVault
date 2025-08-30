const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const categories = [
  {
    name: 'Conference',
    slug: 'conference',
    description: 'Professional conferences and business events',
    color: '#3B82F6',
    sortOrder: 1
  },
  {
    name: 'Workshop',
    slug: 'workshop',
    description: 'Hands-on learning and skill development sessions',
    color: '#10B981',
    sortOrder: 2
  },
  {
    name: 'Concert',
    slug: 'concert',
    description: 'Musical performances and entertainment events',
    color: '#8B5CF6',
    sortOrder: 3
  },
  {
    name: 'Sports',
    slug: 'sports',
    description: 'Sporting events and competitions',
    color: '#F59E0B',
    sortOrder: 4
  },
  {
    name: 'Technology',
    slug: 'technology',
    description: 'Tech meetups, hackathons, and innovation events',
    color: '#EF4444',
    sortOrder: 5
  },
  {
    name: 'Arts & Culture',
    slug: 'arts-culture',
    description: 'Art exhibitions, cultural events, and creative gatherings',
    color: '#EC4899',
    sortOrder: 6
  }
];

async function main() {
  console.log('🌱 Seeding database...');

  // Create categories
  for (const category of categories) {
    const existingCategory = await prisma.category.findUnique({
      where: { slug: category.slug }
    });

    if (!existingCategory) {
      await prisma.category.create({
        data: category
      });
      console.log(`✅ Created category: ${category.name}`);
    } else {
      console.log(`⏭️  Category already exists: ${category.name}`);
    }
  }

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
