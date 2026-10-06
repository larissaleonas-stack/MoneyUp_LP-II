import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT ?? 587);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpFrom = process.env.SMTP_FROM ?? "no-reply@moneyup.local";
const emailMode =
  process.env.EMAIL_MODE ??
  (process.env.NODE_ENV === "production"
    ? "smtp"
    : process.env.NODE_ENV === "test"
      ? "disabled"
      : "ethereal");
let etherealAccountPromise:
  | ReturnType<typeof nodemailer.createTestAccount>
  | undefined;

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

export async function sendWelcomeEmail(to: string, nome: string) {
  if (emailMode === "disabled") {
    console.info("Envio de e-mail desabilitado neste ambiente.");
    return { sent: false, skipped: true };
  }

  try {
    let transporter: nodemailer.Transporter;

    if (emailMode === "ethereal") {
      etherealAccountPromise ??= nodemailer.createTestAccount();
      const account = await etherealAccountPromise;
      transporter = nodemailer.createTransport({
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: { user: account.user, pass: account.pass },
      });
    } else {
      if (!smtpHost || !smtpUser || !smtpPass) {
        throw new Error(
          "SMTP_HOST, SMTP_USER e SMTP_PASS devem estar configurados",
        );
      }
      transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass },
      });
    }

    const safeName = escapeHtml(nome);
    const info = await transporter.sendMail({
      from: smtpFrom,
      to,
      subject: "Bem-vindo ao MoneyUp",
      html: `
        <h2>Olá, ${safeName}!</h2>
        <p>Seu cadastro no MoneyUp foi realizado com sucesso.</p>
        <p>Agora você pode começar a controlar seus gastos com segurança.</p>
      `,
      text: `Olá, ${nome}! Seu cadastro no MoneyUp foi realizado com sucesso.`,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl)
      console.info(`Prévia do e-mail de boas-vindas: ${previewUrl}`);

    return { sent: true, skipped: false };
  } catch (error) {
    console.error("Erro ao enviar e-mail de boas-vindas:", error);
    return { sent: false, skipped: false };
  }
}

export default { sendWelcomeEmail };
