import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();
const prisma = new PrismaClient();

async function backfill() {
  try {
    const users = await prisma.usuario.findMany();
    console.log(`Found ${users.length} users`);
    const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);

    for (const u of users) {
      const updates = {};
      if (!u.email) {
        updates.email = `user+${u.id}@local.invalid`;
      }
      if (!u.senhaHash) {
        // create a random temporary password and hash it
        const temp = `TempPass!${u.id}${Date.now()}`;
        updates.senhaHash = await bcrypt.hash(temp, SALT_ROUNDS);
        console.log(`User ${u.id} temp password: ${temp}`);
      }
      if (Object.keys(updates).length) {
        await prisma.usuario.update({ where: { id: u.id }, data: updates });
        console.log(`Updated user ${u.id}`);
      }
    }

    console.log("Backfill complete");
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

backfill();
