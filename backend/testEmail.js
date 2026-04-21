require("dotenv").config();
const nodemailer = require("nodemailer");
const emailUser = (process.env.EMAIL_USER || "").trim();
const emailPass = (process.env.EMAIL_PASS || "").replace(/\s+/g, "");

// Test Gmail SMTP connection
async function testEmailConnection() {
  console.log("Testing Gmail Email Connection...\n");

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: {
      user: emailUser,
      pass: emailPass
    }
  });

  try {
    // Verify connection
    console.log("📡 Verifying SMTP connection...");
    await transporter.verify();
    console.log("✅ SMTP connection successful!\n");

    // Send test email
    console.log("📧 Sending test verification email...");
    const testCode = "123456";
    
    const info = await transporter.sendMail({
      from: "noreply@bnaassurances.com",
      to: "test@example.com",
      subject: "Test - Vérification de votre compte BNA Assurances",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a365d;">Bienvenue chez BNA Assurances</h2>
          <p>Merci de vous être inscrit. Pour activer votre compte, veuillez utiliser le code de vérification suivant :</p>
          <div style="background-color: #f8fafc; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <h1 style="color: #00a67e; font-size: 32px; margin: 0; letter-spacing: 5px;">${testCode}</h1>
          </div>
          <p>Ce code expirera dans 10 minutes.</p>
          <p>Ceci est un email de test - ignorez si dans un environnement de test.</p>
          <br>
          <p>Cordialement,<br>L'équipe BNA Assurances</p>
        </div>
      `
    });

    console.log("✅ Email sent successfully!");
    console.log(`📨 Message ID: ${info.messageId}\n`);
    console.log("📊 Test Summary:");
    console.log("   ✓ SMTP Connection: OK");
    console.log("   ✓ Email Template: OK");
    console.log("   ✓ Gmail SMTP Integration: OK\n");
    console.log("🎉 All tests passed! Your email system is ready to use.\n");
    console.log("💡 Check your Gmail sent folder to confirm delivery.");

  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error("\n📊 Debug Information:");
    console.error("   HOST:", process.env.EMAIL_HOST);
    console.error("   PORT:", process.env.EMAIL_PORT);
    console.error("   USER:", process.env.EMAIL_USER ? "✓ Configured" : "✗ Missing");
    console.error("   PASS:", process.env.EMAIL_PASS ? "✓ Configured" : "✗ Missing");
  }

  process.exit();
}

testEmailConnection();
