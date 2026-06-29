import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  await prisma.gasto.deleteMany();
  await prisma.categoria.deleteMany();
  await prisma.formaPagamento.deleteMany();

  await prisma.categoria.createMany({
    data: [
      { nome: "Alimentação" },
      { nome: "Lazer" },
      { nome: "Transporte" },
      { nome: "Saúde" },
      { nome: "Educação" },
      { nome: "Moradia" },
      { nome: "Compras" },
      { nome: "Beleza" },
      { nome: "Tecnologia" },
      { nome: "Pets" },
      { nome: "Presentes" },
      { nome: "Contas e Serviços" },
      { nome: "Investimentos" },
      { nome: "Outros" },
    ],
  });

  await prisma.formaPagamento.createMany({
    data: [
      { nome: "Dinheiro" },
      { nome: "Pix" },
      { nome: "Cartão de Crédito" },
      { nome: "Cartão de Débito" },
    ],
  });

  console.log("Seed executada com sucesso!");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
