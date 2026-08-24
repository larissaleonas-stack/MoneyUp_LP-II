import fs from "fs/promises";
import { Document, Packer, Paragraph, TextRun } from "docx";

async function run() {
  const md = await fs.readFile("docs/authentication.md", "utf8");
  const lines = md.split(/\r?\n/);
  const children = [];
  for (const line of lines) {
    if (line.startsWith("# ")) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: line.replace("# ", ""), bold: true, size: 28 }),
          ],
        }),
      );
    } else if (line.startsWith("## ")) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line.replace("## ", ""),
              bold: true,
              size: 24,
            }),
          ],
        }),
      );
    } else {
      children.push(
        new Paragraph({ children: [new TextRun({ text: line, size: 22 })] }),
      );
    }
  }
  const doc = new Document({
    creator: "MoneyUp",
    title: "Autenticação MoneyUp",
    sections: [{ children }],
  });
  const buffer = await Packer.toBuffer(doc);
  await fs.writeFile("docs/authentication.docx", buffer);
  console.log("Generated docs/authentication.docx");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
