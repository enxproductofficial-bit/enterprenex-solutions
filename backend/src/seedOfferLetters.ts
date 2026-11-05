import { prisma } from './db';

export async function seedOfferLetters() {
  console.log('Seeding standard offer letters...');

  // 1. ENX-OFF-2026-0001
  await prisma.offerLetter.upsert({
    where: { offerLetterNo: 'ENX-OFF-2026-0001' },
    update: {
      status: 'Sent'
    },
    create: {
      id: 'off-101',
      offerLetterNo: 'ENX-OFF-2026-0001',
      employeeId: '202600000002',
      employeeName: 'POLAMREDDY REVANTH REDDY',
      employeeEmail: 'revanth@enterprenex.solutions',
      department: 'Engineering',
      designation: 'Full Stack Software Engineer',
      joiningDate: '2026-02-01',
      employmentType: 'Full-time',
      salaryMonthly: 100000,
      ctcAnnual: 1200000,
      probationPeriod: '3 Months',
      termsAndConditions: '1. Standard Enterprenex appointment terms.\n2. Working hours: 09:30 AM to 06:30 PM IST.\n3. 3-month probation period.',
      status: 'Sent'
    }
  });

  // 2. ENX-OFF-2026-0002 (Govindi) - ensure status is 'Sent' so Candidate or HR can Accept/Decline!
  await prisma.offerLetter.upsert({
    where: { offerLetterNo: 'ENX-OFF-2026-0002' },
    update: {
      status: 'Sent',
      sentAt: new Date()
    },
    create: {
      id: 'off-102',
      offerLetterNo: 'ENX-OFF-2026-0002',
      employeeId: '202600000003',
      employeeName: 'Govindi',
      employeeEmail: 'example@gmail.com',
      department: 'IT',
      designation: 'Web Development Intern',
      joiningDate: '2026-11-05',
      employmentType: 'Intern',
      salaryMonthly: 50000,
      ctcAnnual: 600000,
      probationPeriod: '3 Months',
      termsAndConditions: '1. Working Hours & Modality: Regular work hours are 09:30 AM to 06:30 PM IST, Monday through Friday, operating under a Hybrid arrangement.\n2. Probation Period: You will undergo a 3-month probation period evaluating technical capability, cultural alignment, and KPI benchmarks.',
      status: 'Sent',
      directorApprovedBy: 'Rohit Pawar (Managing Director)',
      directorApprovedAt: new Date(),
      sentAt: new Date()
    }
  });

  // 3. ENX-OFF-2026-0003 (Vikramaditya Patil) - status: 'Pending Approval' for Director review!
  await prisma.offerLetter.upsert({
    where: { offerLetterNo: 'ENX-OFF-2026-0003' },
    update: {
      status: 'Pending Approval'
    },
    create: {
      id: 'off-103',
      offerLetterNo: 'ENX-OFF-2026-0003',
      employeeId: '202600000004',
      employeeName: 'Vikramaditya Patil',
      employeeEmail: 'vikram.patil@enterprenex.solutions',
      department: 'Engineering',
      designation: 'DevOps & SRE Engineer',
      joiningDate: '2026-04-01',
      employmentType: 'Full-time',
      salaryMonthly: 80000,
      ctcAnnual: 960000,
      probationPeriod: '3 Months',
      termsAndConditions: '1. Standard Enterprenex SRE appointment terms.\n2. 24x7 rotation on-call allowance applicable.',
      status: 'Pending Approval'
    }
  });

  const all = await prisma.offerLetter.findMany({ select: { id: true, offerLetterNo: true, employeeName: true, status: true } });
  console.log('Seeded Offer Letters:', all);
}

if (require.main === module) {
  seedOfferLetters()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}

