import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Field images
const images = [
  'https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/209977/pexels-photo-209977.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/325355/pexels-photo-325355.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/46798/pexels-photo-46798.jpeg?auto=compress&cs=tinysrgb&w=800',
];

// Gallery images for academies
const galleryImages = [
  'https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/209977/pexels-photo-209977.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/325355/pexels-photo-325355.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/46798/pexels-photo-46798.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/3628912/pexels-photo-3628912.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/3628925/pexels-photo-3628925.jpeg?auto=compress&cs=tinysrgb&w=800',
];

async function main() {
  // Cleanup: delete all bookings, fields and academies
  await prisma.booking.deleteMany({});
  await prisma.field.deleteMany({});
  await prisma.academy.deleteMany({});

  // Create footacademy
  console.log('seeding footacademy..')
  const footacademy = await prisma.academy.create({
    data: {
      name: 'footacademy',
      location: 'Marrakesh 40130',
      rating: 4.4,
      phone: '+212 651195544',
      description: 'Centre de football moderne à Marrakech, offrant des terrains de qualité supérieure, un environnement convivial et des horaires flexibles pour tous les passionnés du ballon rond.',
      image: images[0],
      openingHours: '16:00 - 17:00',
      monthlyPrice: 500,
      gallery: galleryImages,
    },
  });
  // Fields for footacademy
  await prisma.field.create({ data: { type: '7v7 Field', capacity: 14, pricePerHour: 420, image: images[0], academyId: footacademy.id } });
  await prisma.field.create({ data: { type: '7v7 Field', capacity: 14, pricePerHour: 420, image: images[1], academyId: footacademy.id } });
  await prisma.field.create({ data: { type: '6v6 Field', capacity: 12, pricePerHour: 360, image: images[2], academyId: footacademy.id } });
  await prisma.field.create({ data: { type: '6v6 Field', capacity: 12, pricePerHour: 360, image: images[3], academyId: footacademy.id } });
  await prisma.field.create({ data: { type: '6v6 Field', capacity: 12, pricePerHour: 360, image: images[4], academyId: footacademy.id } });
  await prisma.field.create({ data: { type: '5v5 Field', capacity: 10, pricePerHour: 300, image: images[0], academyId: footacademy.id } });
  await prisma.field.create({ data: { type: '5v5 Field', capacity: 10, pricePerHour: 300, image: images[1], academyId: footacademy.id } });

  // Create kickoff academy
  console.log('seeding kickoff academy..')
  const kickoff = await prisma.academy.create({
    data: {
      name: 'kickoff academy',
      location: 'Casablanca 20000',
      rating: 4.6,
      phone: '+212 600112233',
      description: 'Kickoff Academy à Casablanca propose des terrains modernes, parfaits pour les matchs entre amis ou les entraînements professionnels.',
      image: images[0],
      openingHours: '16:00 - 17:00',
      monthlyPrice: 600,
      gallery: galleryImages,
    },
  });
  // Fields for kickoff academy
  await prisma.field.create({ data: { type: '7v7 Field', capacity: 14, pricePerHour: 420, image: images[0], academyId: kickoff.id } });
  await prisma.field.create({ data: { type: '7v7 Field', capacity: 14, pricePerHour: 420, image: images[1], academyId: kickoff.id } });
  await prisma.field.create({ data: { type: '6v6 Field', capacity: 12, pricePerHour: 360, image: images[2], academyId: kickoff.id } });
  await prisma.field.create({ data: { type: '6v6 Field', capacity: 12, pricePerHour: 360, image: images[3], academyId: kickoff.id } });
  await prisma.field.create({ data: { type: '6v6 Field', capacity: 12, pricePerHour: 360, image: images[4], academyId: kickoff.id } });
  await prisma.field.create({ data: { type: '5v5 Field', capacity: 10, pricePerHour: 300, image: images[0], academyId: kickoff.id } });
  await prisma.field.create({ data: { type: '5v5 Field', capacity: 10, pricePerHour: 300, image: images[1], academyId: kickoff.id } });

  // Create palmarena
  console.log('seeding palmarena..')
  const palmarena = await prisma.academy.create({
    data: {
      name: 'palmarena',
      location: 'Agadir 80000',
      rating: 4.2,
      phone: '+212 677889900',
      description: 'Palmarena à Agadir offre un environnement agréable et des terrains de football de haute qualité pour tous les âges.',
      image: images[0],
      openingHours: '16:00 - 17:00',
      monthlyPrice: 450,
      gallery: galleryImages,
    },
  });
  // Fields for palmarena
  await prisma.field.create({ data: { type: '7v7 Field', capacity: 14, pricePerHour: 420, image: images[0], academyId: palmarena.id } });
  await prisma.field.create({ data: { type: '7v7 Field', capacity: 14, pricePerHour: 420, image: images[1], academyId: palmarena.id } });
  await prisma.field.create({ data: { type: '6v6 Field', capacity: 12, pricePerHour: 360, image: images[2], academyId: palmarena.id } });
  await prisma.field.create({ data: { type: '6v6 Field', capacity: 12, pricePerHour: 360, image: images[3], academyId: palmarena.id } });
  await prisma.field.create({ data: { type: '6v6 Field', capacity: 12, pricePerHour: 360, image: images[4], academyId: palmarena.id } });
  await prisma.field.create({ data: { type: '5v5 Field', capacity: 10, pricePerHour: 300, image: images[0], academyId: palmarena.id } });
  await prisma.field.create({ data: { type: '5v5 Field', capacity: 10, pricePerHour: 300, image: images[1], academyId: palmarena.id } });

  // Create masterfoot
  console.log('seeding masterfoot..')
  const masterfoot = await prisma.academy.create({
    data: {
      name: 'masterfoot',
      location: 'Rabat 10000',
      rating: 4.5,
      phone: '+212 633221144',
      description: 'Masterfoot à Rabat, le choix idéal pour les passionnés de football recherchant des installations modernes et un accueil chaleureux.',
      image: images[0],
      openingHours: '16:00 - 17:00',
      monthlyPrice: 550,
      gallery: galleryImages,
    },
  });
  // Fields for masterfoot
  await prisma.field.create({ data: { type: '7v7 Field', capacity: 14, pricePerHour: 420, image: images[0], academyId: masterfoot.id } });
  await prisma.field.create({ data: { type: '7v7 Field', capacity: 14, pricePerHour: 420, image: images[1], academyId: masterfoot.id } });
  await prisma.field.create({ data: { type: '6v6 Field', capacity: 12, pricePerHour: 360, image: images[2], academyId: masterfoot.id } });
  await prisma.field.create({ data: { type: '6v6 Field', capacity: 12, pricePerHour: 360, image: images[3], academyId: masterfoot.id } });
  await prisma.field.create({ data: { type: '6v6 Field', capacity: 12, pricePerHour: 360, image: images[4], academyId: masterfoot.id } });
  await prisma.field.create({ data: { type: '5v5 Field', capacity: 10, pricePerHour: 300, image: images[0], academyId: masterfoot.id } });
  await prisma.field.create({ data: { type: '5v5 Field', capacity: 10, pricePerHour: 300, image: images[1], academyId: masterfoot.id } });

  // Create admin users
  console.log('Creating admin users...');
  
  // Super Admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: {
      email: 'admin@footbooking.com',
      password: adminPassword,
      name: 'Super Admin',
      role: 'ADMIN'
    }
  });

  // Academy Admin for footacademy
  const academy1Password = await bcrypt.hash('academy123', 10);
  await prisma.user.create({
    data: {
      email: 'academy1@footbooking.com',
      password: academy1Password,
      name: 'Footacademy Manager',
      role: 'ACADEMY_ADMIN',
      academyId: footacademy.id
    }
  });

  // Academy Admin for kickoff
  const academy2Password = await bcrypt.hash('academy123', 10);
  await prisma.user.create({
    data: {
      email: 'academy2@footbooking.com',
      password: academy2Password,
      name: 'Kickoff Manager',
      role: 'ACADEMY_ADMIN',
      academyId: kickoff.id
    }
  });

  // Academy Admin for palmarena
  const academy3Password = await bcrypt.hash('academy123', 10);
  await prisma.user.create({
    data: {
      email: 'academy3@footbooking.com',
      password: academy3Password,
      name: 'Palmarena Manager',
      role: 'ACADEMY_ADMIN',
      academyId: palmarena.id
    }
  });

  // Academy Admin for masterfoot
  const academy4Password = await bcrypt.hash('academy123', 10);
  await prisma.user.create({
    data: {
      email: 'academy4@footbooking.com',
      password: academy4Password,
      name: 'Masterfoot Manager',
      role: 'ACADEMY_ADMIN',
      academyId: masterfoot.id
    }
  });

  console.log('Admin users created successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 