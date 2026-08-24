import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
  const users = await prisma.usuario.findMany();
  for (const u of users) {
    const needsSenha =
      u.senhaHash === null || u.senhaHash === undefined || u.senhaHash === "";
    const needsEmail =
      u.email === null || u.email === undefined || u.email === "";
    const updates = {};
    if (needsSenha) {
      const tempPassword = "ChangeMe123!";
      updates.senhaHash = await bcrypt.hash(tempPassword, saltRounds);
      console.log(
        `Backfilled senhaHash for user id=${u.id} with temporary password`,
      );
    }
    if (needsEmail) {
      updates.email = `user${u.id}@local`;
      console.log(`Backfilled email for user id=${u.id} -> ${updates.email}`);
    }
    if (Object.keys(updates).length > 0) {
      await prisma.usuario.update({ where: { id: u.id }, data: updates });
    }
  }
  console.log(
    "Backfill concluído. Verifique os usuários e troque senhas temporárias.",
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
