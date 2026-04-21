const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const emailUser = (process.env.EMAIL_USER || "").trim();
const emailPass = (process.env.EMAIL_PASS || "").replace(/\s+/g, "");

// Email transporter (Gmail SMTP configuration)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: Number(process.env.EMAIL_PORT) === 465,
  auth: {
    user: emailUser,
    pass: emailPass
  }
});

// Generate verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification email
const sendVerificationEmail = async (email, code) => {
  try {
    const mailOptions = {
      from: emailUser || "your-email@gmail.com",
      to: email,
      subject: 'Vérification de votre compte BNA Assurances',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a365d;">Bienvenue chez BNA Assurances</h2>
          <p>Merci de vous être inscrit. Pour activer votre compte, veuillez utiliser le code de vérification suivant :</p>
          <div style="background-color: #f8fafc; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <h1 style="color: #00a67e; font-size: 32px; margin: 0; letter-spacing: 5px;">${code}</h1>
          </div>
          <p>Ce code expirera dans 10 minutes.</p>
          <p>Si vous n'avez pas demandé cette vérification, ignorez cet email.</p>
          <br>
          <p>Cordialement,<br>L'équipe BNA Assurances</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Verification email sent to:', email);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

const sendPasswordResetEmail = async (email, resetLink) => {
  try {
    const mailOptions = {
      from: emailUser || "your-email@gmail.com",
      to: email,
      subject: "Réinitialisation de votre mot de passe BNA Assurances",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a365d;">Réinitialisation du mot de passe</h2>
          <p>Nous avons reçu une demande de réinitialisation de votre mot de passe.</p>
          <p>Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${resetLink}" style="display:inline-block;background-color:#00a67e;color:white;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;">
              Réinitialiser mon mot de passe
            </a>
          </div>
          <p>Ce lien expirera dans 15 minutes.</p>
          <p>Si vous n'avez pas demandé cette action, ignorez cet email.</p>
          <br>
          <p>Cordialement,<br>L'équipe BNA Assurances</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log("Password reset email sent to:", email);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password, CIN, phone } = req.body;

    // Validation
    if (!name || !email || !password || !CIN || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const exist = await User.findOne({ email });
    if (exist) return res.status(400).json({ message: "Email already used" });

    const cinExists = await User.findOne({ CIN });
    if (cinExists) return res.status(400).json({ message: "CIN already used" });

    const phoneNumber = Number(phone);
    if (isNaN(phoneNumber) || phoneNumber <= 0) {
      return res.status(400).json({ message: "Phone must be a valid number" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = new User({
      name,
      email,
      password: hashedPassword,
      CIN,
      phone: phoneNumber,
      emailVerified: false,
      verificationCode,
      verificationCodeExpires
    });

    await user.save();

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationCode);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail registration if email fails, but log it
    }

    res.status(201).json({
      message: "User created successfully. Please check your email for verification code.",
      requiresVerification: true,
      email: email
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Verify email
exports.verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: "Email and verification code are required" });
    }

    const user = await User.findOne({
      email,
      verificationCode: code,
      verificationCodeExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification code" });
    }

    // Update user as verified
    user.emailVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    res.json({ message: "Email verified successfully" });
  } catch (err) {
    console.error("Verify email error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Resend verification code
exports.resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.verificationCode = verificationCode;
    user.verificationCodeExpires = verificationCodeExpires;
    await user.save();

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationCode);
      res.json({ message: "Verification code sent successfully" });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      res.status(500).json({ message: "Failed to send verification email" });
    }
  } catch (err) {
    console.error("Resend verification error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });

    // Always return success-style message for security reasons.
    if (!user) {
      return res.json({
        message: "Si cet email existe, un lien de réinitialisation a été envoyé."
      });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetLink = `${frontendUrl}/reset-password?token=${rawToken}`;
    await sendPasswordResetEmail(user.email, resetLink);

    return res.json({
      message: "Si cet email existe, un lien de réinitialisation a été envoyé."
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ error: err.message });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "Token and new password are required" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: "Lien invalide ou expiré" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.json({ message: "Mot de passe réinitialisé avec succès" });
  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({ error: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Wrong email" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Wrong password" });

    // Check if email is verified
    if (!user.emailVerified) {
      // Auto-send a fresh code whenever an unverified user tries to log in.
      const verificationCode = generateVerificationCode();
      user.verificationCode = verificationCode;
      user.verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      try {
        await sendVerificationEmail(user.email, verificationCode);
      } catch (emailError) {
        console.error("Failed to send verification code on login:", emailError);
      }

      return res.status(403).json({
        message: "Please verify your email. A new verification code has been sent.",
        requiresVerification: true,
        email: user.email
      });
    }

    const token = jwt.sign({ id: user._id }, "SECRET_KEY");
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ token, user: userResponse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};