import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Vetic - Featured Vet
  const veticPassword = await hash('vetic123', 12);
  const vetic = await prisma.user.upsert({
    where: { email: 'vetic@pawzr.com' },
    update: {},
    create: {
      email: 'vetic@pawzr.com',
      password: veticPassword,
      name: 'Vetic Pet Clinic',
      role: 'VET',
      avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400',
      phone: '9876543210',
      countryCode: '+91',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      zipCode: '400001',
      bio: 'Vetic is India\'s leading pet healthcare provider with 24/7 vet consultations, home visits, and comprehensive pet care services.',
      verified: true,
      profileComplete: true,
      aadhaarVerified: true,
      vetProfile: {
        create: {
          clinicName: 'Vetic Pet Clinic',
          clinicAddress: 'Bandra West, Mumbai',
          clinicPhone: '9876543210',
          hours: JSON.stringify({
            monday: '9:00 AM - 9:00 PM',
            tuesday: '9:00 AM - 9:00 PM',
            wednesday: '9:00 AM - 9:00 PM',
            thursday: '9:00 AM - 9:00 PM',
            friday: '9:00 AM - 9:00 PM',
            saturday: '10:00 AM - 6:00 PM',
            sunday: '10:00 AM - 4:00 PM'
          }),
          license: 'MH-VET-2024-001',
          licenseVerified: true,
          specializations: 'Surgery, Dermatology, Internal Medicine, Emergency Care',
          videoCallRate: 499,
          services: JSON.stringify(['General Checkup', 'Vaccination', 'Surgery', 'Dental Care', 'Emergency Care', 'Video Consultation'])
        }
      }
    }
  });
  console.log('✅ Created Vetic vet');

  // Create more vets
  const drPriya = await prisma.user.upsert({
    where: { email: 'drpriya@pawzr.com' },
    update: {},
    create: {
      email: 'drpriya@pawzr.com',
      password: await hash('priya123', 12),
      name: 'Dr. Priya Sharma',
      role: 'VET',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400',
      phone: '9876543211',
      city: 'Delhi',
      state: 'Delhi',
      bio: 'Specialized in pet dermatology and nutrition. 10+ years of experience.',
      verified: true,
      profileComplete: true,
      vetProfile: {
        create: {
          clinicName: 'PawCare Clinic',
          clinicAddress: 'South Delhi',
          clinicPhone: '9876543211',
          license: 'DL-VET-2024-002',
          licenseVerified: true,
          specializations: 'Dermatology, Nutrition',
          videoCallRate: 399
        }
      }
    }
  });

  // Create Pet Lovers (Walkers/Sitters)
  const rahul = await prisma.user.upsert({
    where: { email: 'rahul@pawzr.com' },
    update: {},
    create: {
      email: 'rahul@pawzr.com',
      password: await hash('rahul123', 12),
      name: 'Rahul Verma',
      role: 'LOVER',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      phone: '9876543212',
      city: 'Mumbai',
      state: 'Maharashtra',
      bio: 'Dog lover with 5+ years of pet sitting experience. Your pets are safe with me!',
      verified: true,
      profileComplete: true,
      aadhaarVerified: true,
      loverProfile: {
        create: {
          experience: '5 years of professional pet care',
          hourlyRate: 299,
          serviceRadius: 10,
          availability: JSON.stringify({ weekdays: true, weekends: true })
        }
      }
    }
  });

  const anita = await prisma.user.upsert({
    where: { email: 'anita@pawzr.com' },
    update: {},
    create: {
      email: 'anita@pawzr.com',
      password: await hash('anita123', 12),
      name: 'Anita Desai',
      role: 'LOVER',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      phone: '9876543213',
      city: 'Bangalore',
      state: 'Karnataka',
      bio: 'Certified pet sitter and dog trainer. Specialized in anxious pets.',
      verified: true,
      profileComplete: true,
      aadhaarVerified: true,
      loverProfile: {
        create: {
          experience: '3 years, certified trainer',
          hourlyRate: 349,
          serviceRadius: 15,
          certifications: 'Pet First Aid, Dog Training Certificate'
        }
      }
    }
  });

  // Create Groomers
  const furryTails = await prisma.user.upsert({
    where: { email: 'furrytails@pawzr.com' },
    update: {},
    create: {
      email: 'furrytails@pawzr.com',
      password: await hash('furry123', 12),
      name: 'Furry Tails Salon',
      role: 'GROOMER',
      avatar: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=400',
      phone: '9876543214',
      city: 'Mumbai',
      state: 'Maharashtra',
      bio: 'Premium pet grooming salon with spa services. Making pets look fabulous!',
      verified: true,
      profileComplete: true,
      groomerProfile: {
        create: {
          salonName: 'Furry Tails Grooming Salon',
          salonAddress: 'Andheri West, Mumbai',
          salonPhone: '9876543214',
          hours: JSON.stringify({ weekdays: '10 AM - 8 PM', weekends: '9 AM - 6 PM' }),
          services: JSON.stringify([
            { name: 'Basic Bath', price: 599 },
            { name: 'Full Grooming', price: 1299 },
            { name: 'Haircut & Styling', price: 899 },
            { name: 'Nail Trim', price: 199 },
            { name: 'Spa Treatment', price: 1999 }
          ])
        }
      }
    }
  });

  // Create Suppliers
  const petStore = await prisma.user.upsert({
    where: { email: 'petstore@pawzr.com' },
    update: {},
    create: {
      email: 'petstore@pawzr.com',
      password: await hash('store123', 12),
      name: 'PawMart Store',
      role: 'SUPPLIER',
      avatar: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400',
      phone: '9876543215',
      city: 'Delhi',
      state: 'Delhi',
      bio: 'Your one-stop shop for premium pet food, toys, and accessories.',
      verified: true,
      profileComplete: true,
      supplierProfile: {
        create: {
          storeName: 'PawMart',
          description: 'Premium pet supplies at affordable prices',
          website: 'https://pawmart.com'
        }
      }
    }
  });

  // Create Products
  const products = [
    { name: 'Royal Canin Adult Dog Food', description: 'Premium nutrition for adult dogs', price: 2499, category: 'Food', inventory: 50 },
    { name: 'Whiskas Cat Food', description: 'Delicious meals for cats', price: 899, category: 'Food', inventory: 100 },
    { name: 'Kong Classic Dog Toy', description: 'Durable chew toy for dogs', price: 699, category: 'Toys', inventory: 30 },
    { name: 'Cat Scratching Post', description: 'Premium sisal scratching post', price: 1299, category: 'Accessories', inventory: 20 },
    { name: 'Pet Bed - Large', description: 'Comfortable orthopedic pet bed', price: 1999, category: 'Bedding', inventory: 15 },
    { name: 'Dog Leash & Collar Set', description: 'Adjustable nylon leash and collar', price: 599, category: 'Accessories', inventory: 40 },
    { name: 'Pet Grooming Kit', description: 'Complete grooming set with brush, comb, and nail clipper', price: 799, category: 'Grooming', inventory: 25 },
    { name: 'Pedigree Dentastix', description: 'Daily dental treats for dogs', price: 449, category: 'Treats', inventory: 60 }
  ];

  for (const product of products) {
    await prisma.product.create({
      data: {
        ...product,
        supplierId: petStore.id,
        photos: JSON.stringify(['https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400'])
      }
    });
  }
  console.log('✅ Created products');

  // Create Services
  const services = [
    { providerId: rahul.id, type: 'WALKING', name: 'Dog Walking - 30 mins', description: 'Daily dog walking service', price: 299, duration: 30 },
    { providerId: rahul.id, type: 'SITTING', name: 'Pet Sitting - Per Day', description: 'Full day pet sitting at your home', price: 899, duration: 480 },
    { providerId: anita.id, type: 'WALKING', name: 'Premium Dog Walking', description: 'Walking with training exercises', price: 449, duration: 45 },
    { providerId: anita.id, type: 'BOARDING', name: 'Pet Boarding', description: 'Overnight stay at my pet-friendly home', price: 1299, duration: 1440 },
    { providerId: vetic.id, type: 'VET', name: 'Video Consultation', description: '15-min video call with our vets', price: 499, duration: 15 },
    { providerId: vetic.id, type: 'VET', name: 'General Checkup', description: 'Complete health examination', price: 799, duration: 30 }
  ];

  for (const service of services) {
    await prisma.service.create({ data: service });
  }
  console.log('✅ Created services');

  // Create Test Pet Owner (for App Store review)
  const testPetOwner = await prisma.user.upsert({
    where: { email: 'petowner@pawzr.com' },
    update: {},
    create: {
      email: 'petowner@pawzr.com',
      password: await hash('PawzrOwner2026!', 12),
      name: 'Sarah Johnson',
      role: 'OWNER',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      phone: '9876543221',
      countryCode: '+91',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      zipCode: '400001',
      bio: 'Pet lover with 2 adorable fur babies! Looking for the best care for Max and Luna.',
      verified: true,
      profileComplete: true,
      aadhaarVerified: true
    }
  });
  console.log('✅ Created Test Pet Owner (petowner@pawzr.com)');

  // Create Test Pet Lover (for App Store review)
  const testPetLover = await prisma.user.upsert({
    where: { email: 'petlover@pawzr.com' },
    update: {},
    create: {
      email: 'petlover@pawzr.com',
      password: await hash('PawzrLover2026!', 12),
      name: 'Amit Patel',
      role: 'LOVER',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      phone: '9876543222',
      countryCode: '+91',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      zipCode: '400001',
      bio: 'Professional pet care specialist with 5+ years experience. Certified in pet first aid. Your pets are in safe hands!',
      verified: true,
      profileComplete: true,
      aadhaarVerified: true,
      loverProfile: {
        create: {
          experience: '5+ years professional pet care, certified trainer',
          hourlyRate: 349,
          serviceRadius: 15,
          certifications: 'Pet First Aid Certified, CPDT-KA Dog Training',
          availability: JSON.stringify({ weekdays: true, weekends: true, evenings: true })
        }
      }
    }
  });
  console.log('✅ Created Test Pet Lover (petlover@pawzr.com)');

  // Create a demo pet owner
  const demoOwner = await prisma.user.upsert({
    where: { email: 'demo@pawzr.com' },
    update: {},
    create: {
      email: 'demo@pawzr.com',
      password: await hash('demo123', 12),
      name: 'Demo User',
      role: 'OWNER',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
      phone: '9876543220',
      city: 'Mumbai',
      state: 'Maharashtra',
      verified: true,
      profileComplete: true
    }
  });

  // Create pets for Test Pet Owner (Max and Luna)
  await prisma.pet.createMany({
    data: [
      {
        ownerId: testPetOwner.id,
        name: 'Max',
        species: 'dog',
        breed: 'Golden Retriever',
        age: 3,
        weight: 28,
        photo: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400',
        vaccinated: true,
        neutered: true,
        medicalNotes: 'Healthy, regular checkups. Loves walks!'
      },
      {
        ownerId: testPetOwner.id,
        name: 'Luna',
        species: 'cat',
        breed: 'Persian',
        age: 2,
        weight: 4,
        photo: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400',
        vaccinated: true,
        neutered: false,
        medicalNotes: 'Indoor cat, sensitive stomach'
      }
    ]
  });
  console.log('✅ Created pets for Test Pet Owner (Max & Luna)');

  // Create services for Test Pet Lover
  const testLoverServices = [
    { providerId: testPetLover.id, type: 'WALKING', name: 'Dog Walking - 30 mins', description: 'Professional dog walking with exercise', price: 299, duration: 30 },
    { providerId: testPetLover.id, type: 'SITTING', name: 'Pet Sitting - Per Day', description: 'Full day care at your home', price: 999, duration: 480 },
    { providerId: testPetLover.id, type: 'BOARDING', name: 'Day Care', description: 'Day care at my pet-friendly home', price: 599, duration: 480 },
  ];
  for (const service of testLoverServices) {
    await prisma.service.create({ data: service });
  }
  console.log('✅ Created services for Test Pet Lover');

  // Create sample booking between Test Pet Owner and Test Pet Lover
  const testPetLoverService = await prisma.service.findFirst({ where: { providerId: testPetLover.id } });
  if (testPetLoverService) {
    // Upcoming booking
    await prisma.booking.create({
      data: {
        ownerId: testPetOwner.id,
        providerId: testPetLover.id,
        providerType: 'LOVER',
        serviceId: testPetLoverService.id,
        date: new Date('2026-01-20'),
        time: '10:00 AM',
        duration: 30,
        status: 'CONFIRMED',
        price: 299,
        notes: 'Please walk Max around the park. He loves to play fetch!'
      }
    });

    // Completed booking with review
    const completedBooking = await prisma.booking.create({
      data: {
        ownerId: testPetOwner.id,
        providerId: testPetLover.id,
        providerType: 'LOVER',
        serviceId: testPetLoverService.id,
        date: new Date('2026-01-10'),
        time: '2:00 PM',
        duration: 30,
        status: 'COMPLETED',
        price: 299
      }
    });

    // Add review for completed booking
    await prisma.review.create({
      data: {
        reviewerId: testPetOwner.id,
        targetId: testPetLover.id,
        bookingId: completedBooking.id,
        rating: 5,
        comment: 'Amit was fantastic with Max! Very professional and caring. Max loved his walk and came back happy. Highly recommend!'
      }
    });
    console.log('✅ Created bookings and review for Test accounts');
  }

  // Create conversation between Test Pet Owner and Test Pet Lover
  const testConversation = await prisma.conversation.create({
    data: {
      participants: {
        create: [
          { userId: testPetOwner.id },
          { userId: testPetLover.id }
        ]
      }
    }
  });

  // Add messages to the conversation
  const conversationMessages = [
    { senderId: testPetOwner.id, content: 'Hi Amit! I saw your profile and you seem great with dogs. I have a Golden Retriever named Max who needs regular walks.', createdAt: new Date('2026-01-08T10:00:00') },
    { senderId: testPetLover.id, content: 'Hello Sarah! Thanks for reaching out. I\'d love to help with Max! Golden Retrievers are wonderful - how old is he?', createdAt: new Date('2026-01-08T10:05:00') },
    { senderId: testPetOwner.id, content: 'He\'s 3 years old, very friendly and loves playing fetch. He needs about 30 mins of walking daily.', createdAt: new Date('2026-01-08T10:10:00') },
    { senderId: testPetLover.id, content: 'Perfect! I have experience with retrievers and can definitely include some fetch time during walks. Would mornings work for you?', createdAt: new Date('2026-01-08T10:15:00') },
    { senderId: testPetOwner.id, content: 'Mornings would be great! Can we start with a trial walk this week?', createdAt: new Date('2026-01-08T10:20:00') },
    { senderId: testPetLover.id, content: 'Absolutely! I\'ve just accepted your booking for January 20th at 10 AM. Looking forward to meeting Max! 🐕', createdAt: new Date('2026-01-08T10:25:00') },
  ];

  for (const msg of conversationMessages) {
    await prisma.message.create({
      data: {
        conversationId: testConversation.id,
        senderId: msg.senderId,
        content: msg.content,
        createdAt: msg.createdAt,
        read: true
      }
    });
  }
  console.log('✅ Created conversation with messages for Test accounts');

  // Create demo pets
  await prisma.pet.createMany({
    data: [
      {
        ownerId: demoOwner.id,
        name: 'Bruno',
        species: 'dog',
        breed: 'Golden Retriever',
        age: 3,
        weight: 30,
        photo: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400',
        vaccinated: true,
        neutered: true
      },
      {
        ownerId: demoOwner.id,
        name: 'Whiskers',
        species: 'cat',
        breed: 'Persian',
        age: 2,
        weight: 4,
        photo: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400',
        vaccinated: true
      }
    ]
  });
  console.log('✅ Created demo pets');

  // Create Events
  await prisma.event.createMany({
    data: [
      {
        title: 'Pet Adoption Drive',
        description: 'Find your furry companion! Dogs and cats available for adoption.',
        date: new Date('2026-02-01'),
        location: 'Central Park, Mumbai',
        city: 'Mumbai',
        image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800',
        featured: true,
        maxAttendees: 200,
        createdById: vetic.id
      },
      {
        title: 'Dog Training Workshop',
        description: 'Learn basic obedience training techniques from expert trainers.',
        date: new Date('2026-02-15'),
        location: 'Pet Paradise, Delhi',
        city: 'Delhi',
        image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800',
        featured: true,
        maxAttendees: 50,
        createdById: anita.id
      },
      {
        title: 'Pet Health Camp',
        description: 'Free health checkups and vaccination camp by Vetic.',
        date: new Date('2026-02-20'),
        location: 'Vetic Clinic, Bandra',
        city: 'Mumbai',
        image: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=800',
        featured: false,
        maxAttendees: 100,
        createdById: vetic.id
      }
    ]
  });
  console.log('✅ Created events');

  // Create some reviews
  const veticService = await prisma.service.findFirst({ where: { providerId: vetic.id } });
  if (veticService) {
    const booking = await prisma.booking.create({
      data: {
        ownerId: demoOwner.id,
        providerId: vetic.id,
        providerType: 'VET',
        serviceId: veticService.id,
        date: new Date('2026-01-10'),
        time: '10:00 AM',
        duration: 30,
        status: 'COMPLETED',
        price: 499
      }
    });

    await prisma.review.create({
      data: {
        reviewerId: demoOwner.id,
        targetId: vetic.id,
        bookingId: booking.id,
        rating: 5,
        comment: 'Excellent service! The vet was very knowledgeable and caring with my pet.'
      }
    });
  }
  console.log('✅ Created reviews');

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
