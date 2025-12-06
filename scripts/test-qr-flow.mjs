/**
 * Manual QR Flow Test Script
 *
 * Tests the complete QR ticket generation and check-in flow
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const BASE_URL = process.env.BASE_URL || 'http://localhost:3004';

async function testQRFlow() {
  console.log('🎫 QR Functionality Manual Test\n');
  console.log('================================\n');

  try {
    // Step 1: Get a registration with approved payment
    console.log('📋 Step 1: Finding a valid registration...');

    const registration = await prisma.registration.findFirst({
      where: {
        guest: {
          guest_type: { in: ['vip', 'paying_single', 'paying_paired'] }
        }
      },
      include: {
        guest: true,
        payment: true,
        checkin: true,
      },
      orderBy: { registered_at: 'desc' }
    });

    if (!registration) {
      console.log('❌ No registrations found. Run: npx prisma db seed');
      return;
    }

    console.log(`   ✓ Found registration ID: ${registration.id}`);
    console.log(`   ✓ Guest: ${registration.guest.name} (${registration.guest.email})`);
    console.log(`   ✓ Type: ${registration.guest.guest_type}`);
    console.log(`   ✓ Ticket: ${registration.ticket_type}`);
    console.log(`   ✓ Current QR hash: ${registration.qr_code_hash ? 'exists' : 'none'}`);
    console.log(`   ✓ Already checked in: ${registration.checkin ? 'YES' : 'NO'}\n`);

    // Step 2: Generate QR ticket via API
    console.log('🔐 Step 2: Generating QR ticket via API...');

    const generateRes = await fetch(`${BASE_URL}/api/ticket/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        registration_id: registration.id,
        regenerate: true  // Force regenerate for testing
      })
    });

    const generateData = await generateRes.json();

    if (!generateData.success) {
      console.log(`   ❌ Failed to generate ticket: ${generateData.error}`);
      return;
    }

    console.log(`   ✓ Ticket generated successfully!`);
    console.log(`   ✓ Token length: ${generateData.ticket.token.length} chars`);
    console.log(`   ✓ QR Data URL: ${generateData.ticket.qr_code_data_url.substring(0, 50)}...`);

    const token = generateData.ticket.token;
    console.log(`\n   📱 Token (first 80 chars):\n   ${token.substring(0, 80)}...\n`);

    // Step 3: Validate the token via check-in API
    console.log('✅ Step 3: Validating token via check-in API...');

    const validateRes = await fetch(`${BASE_URL}/api/checkin/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qrToken: token })
    });

    const validateData = await validateRes.json();

    if (!validateData.valid) {
      console.log(`   ❌ Validation failed: ${validateData.error}`);
      return;
    }

    console.log(`   ✓ Token is VALID!`);
    console.log(`   ✓ Guest: ${validateData.guest.name}`);
    console.log(`   ✓ Ticket type: ${validateData.guest.ticketType}`);
    console.log(`   ✓ Partner: ${validateData.guest.partnerName || 'none'}`);
    console.log(`   ✓ Already checked in: ${validateData.alreadyCheckedIn ? 'YES' : 'NO'}`);

    if (validateData.previousCheckin) {
      console.log(`   ⚠️  Previous check-in at: ${validateData.previousCheckin.checkedInAt}`);
    }
    console.log('');

    // Step 4: Submit check-in
    console.log('🎉 Step 4: Submitting check-in...');

    const submitRes = await fetch(`${BASE_URL}/api/checkin/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        registrationId: validateData.registration.id,
        override: validateData.alreadyCheckedIn  // Override if already checked in
      })
    });

    const submitData = await submitRes.json();

    if (!submitData.success) {
      console.log(`   ❌ Check-in failed: ${submitData.error}`);
      return;
    }

    console.log(`   ✓ Check-in successful!`);
    console.log(`   ✓ Check-in ID: ${submitData.checkinId}`);
    console.log('');

    // Step 5: Verify in database
    console.log('📊 Step 5: Verifying in database...');

    const verifyCheckin = await prisma.checkin.findUnique({
      where: { registration_id: registration.id },
      include: {
        guest: { select: { name: true, email: true } },
        registration: { select: { ticket_type: true } }
      }
    });

    if (verifyCheckin) {
      console.log(`   ✓ Check-in record found in DB`);
      console.log(`   ✓ Checked in at: ${verifyCheckin.checked_in_at.toISOString()}`);
      console.log(`   ✓ Is override: ${verifyCheckin.is_override}`);
    }

    console.log('\n================================');
    console.log('✅ QR FLOW TEST COMPLETED SUCCESSFULLY!');
    console.log('================================\n');

    // Summary
    console.log('Test Summary:');
    console.log('-------------');
    console.log(`Registration ID: ${registration.id}`);
    console.log(`Guest: ${registration.guest.name}`);
    console.log(`Token generated: YES`);
    console.log(`Token validated: YES`);
    console.log(`Check-in recorded: YES`);
    console.log(`Check-in ID: ${submitData.checkinId}`);

  } catch (error) {
    console.error('❌ Test error:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testQRFlow();
