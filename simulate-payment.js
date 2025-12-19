const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function simulateSuccessfulPayment() {
  // Find the test guest
  const guest = await prisma.guest.findFirst({
    where: { email: { contains: "paros-teszt" } },
    include: {
      registration: {
        include: { payment: true }
      }
    },
    orderBy: { id: "desc" }
  });

  if (!guest || !guest.registration || !guest.registration.payment) {
    console.log("Nem található fizetésre váró regisztráció");
    return;
  }

  // Update payment to paid
  await prisma.payment.update({
    where: { id: guest.registration.payment.id },
    data: {
      payment_status: "paid",
      paid_at: new Date()
    }
  });

  // Update guest status
  await prisma.guest.update({
    where: { id: guest.id },
    data: { registration_status: "approved" }
  });

  // Generate QR code hash if not exists
  if (!guest.registration.qr_code_hash) {
    const crypto = require("crypto");
    const qrHash = crypto.randomBytes(32).toString("hex");
    await prisma.registration.update({
      where: { id: guest.registration.id },
      data: {
        qr_code_hash: qrHash,
        qr_code_generated_at: new Date()
      }
    });
  }

  console.log("=".repeat(50));
  console.log("FIZETÉS SZIMULÁLVA - SIKERES!");
  console.log("=".repeat(50));
  console.log("Guest:", guest.name);
  console.log("Email:", guest.email);
  console.log("Amount:", Number(guest.registration.payment.amount), "HUF");
  console.log("Status: PAID");
  console.log("");
  console.log("A vendég most már 'approved' státuszú.");
  console.log("QR jegy generálva.");

  await prisma.$disconnect();
}

simulateSuccessfulPayment().catch(console.error);
