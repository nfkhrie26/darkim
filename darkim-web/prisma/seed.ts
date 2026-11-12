import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();
const SECRET = process.env.ADMIN_JWT_SECRET || 'darkim_super_secret_jwt_key_2026';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + SECRET).digest('hex');
}

async function main() {
  console.log('🌱 Seeding DARKIM PostgreSQL Database...');

  // 1. Seed Default Admin
  const admin = await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@darkim.id',
      passwordHash: hashPassword('admin123'),
      name: 'Administrator DARKIM',
    },
  });
  console.log(`✅ Admin created: ${admin.username} (${admin.email})`);

  // 2. Seed Initial Local Products
  const sampleProducts = [
    {
      barcode: '8992753123456',
      name: 'Ultra Milk Susu UHT Rasa Cokelat Segar - 250ml',
      brand: 'Ultrajaya',
      category: 'Minuman Susu UHT',
      energy: 160,
      carbohydrates: 22,
      sugars: 18,
      fiber: 0,
      proteins: 6,
      fat: 4.5,
      saturatedFat: 3,
      sodium: 70,
      salt: 0.18,
      calcium: 300,
    },
    {
      barcode: '8991234567890',
      name: 'Nestlé Koko Krunch Sereal Cokelat Gandum - 170g',
      brand: 'Nestlé',
      category: 'Makanan Ringan / Sereal',
      energy: 110,
      carbohydrates: 24,
      sugars: 9,
      fiber: 2,
      proteins: 2,
      fat: 1.5,
      saturatedFat: 0.6,
      sodium: 45,
      salt: 0.11,
      calcium: 120,
    },
    {
      barcode: '8998866200256',
      name: 'Teh Botol Sosro Original - 250ml',
      brand: 'Sosro',
      category: 'Minuman Teh Melati',
      energy: 60,
      carbohydrates: 16,
      sugars: 15,
      fiber: 0,
      proteins: 0,
      fat: 0,
      saturatedFat: 0,
      sodium: 15,
      salt: 0.04,
      calcium: 0,
    },
    {
      barcode: '089686010924',
      name: 'Indomie Mi Goreng Spesial Instan - 85g',
      brand: 'Indofood',
      category: 'Makanan Instan',
      energy: 380,
      carbohydrates: 54,
      sugars: 4,
      fiber: 1,
      proteins: 8,
      fat: 17,
      saturatedFat: 8,
      sodium: 1070,
      salt: 2.68,
      calcium: 20,
    },
    {
      barcode: '7613035889981',
      name: 'Susu Steril Bear Brand Murni - 189ml',
      brand: 'Nestlé',
      category: 'Minuman Susu Murni',
      energy: 120,
      carbohydrates: 9,
      sugars: 0,
      fiber: 0,
      proteins: 6,
      fat: 7,
      saturatedFat: 4.5,
      sodium: 85,
      salt: 0.21,
      calcium: 240,
    },
    {
      barcode: '8992760136012',
      name: 'Oreo Biskuit Sandwich Krim Vanilla - 133g',
      brand: 'Mondelez',
      category: 'Makanan Biskuit & Snack',
      energy: 140,
      carbohydrates: 21,
      sugars: 14,
      fiber: 1,
      proteins: 1,
      fat: 6,
      saturatedFat: 3.5,
      sodium: 140,
      salt: 0.35,
      calcium: 10,
    },
    {
      barcode: '8999999000001',
      name: 'Rokok Bani Hanyut Rasa Blueberry - 250 batang',
      brand: 'Bani Hanyut',
      category: 'Produk Khusus',
      energy: 180,
      carbohydrates: 30,
      sugars: 24,
      fiber: 0,
      proteins: 0,
      fat: 4,
      saturatedFat: 2,
      sodium: 25,
      salt: 0.03,
      calcium: 0,
    },
  ];

  for (const prod of sampleProducts) {
    await prisma.product.upsert({
      where: { barcode: prod.barcode },
      update: prod,
      create: prod,
    });
  }

  console.log(`✅ Successfully seeded ${sampleProducts.length} local products.`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

