require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const AWS = require('aws-sdk');
const { PrismaClient } = require('@prisma/client');
const { App, ExpressReceiver } = require('@slack/bolt');

const prisma = new PrismaClient();
const server = express();
server.use(cors());
server.use(express.json());

const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

const slackApp = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver,
});

if (process.env.AWS_PROFILE) {
  const credentials = new AWS.SharedIniFileCredentials({
    profile: process.env.AWS_PROFILE,
  });
  AWS.config.credentials = credentials;
}
const s3 = new AWS.S3({ region: process.env.AWS_REGION || 'eu-central-1' });
const ec2 = new AWS.EC2({ region: process.env.AWS_REGION || 'eu-central-1' });


// middleware do uwierzytelniania JWT
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Brak tokenu' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_default_secret');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Nieprawidłowy token' });
  }
}


slackApp.use(async ({ message, next }) => {
  if (message?.text) {
    console.log(`📩 Slack command: ${message.text} (od ${message.user})`);
    try {
      await prisma.commandHistory.create({
        data: {
          user: message.user,
          command: message.text,
          response: "Processing...",
          success: true,
        },
      });
    } catch (error) {
      console.error('❌ Błąd zapisu komendy:', error);
    }
  }
  await next();
});

// =============================
// 🔐 Rejestracja użytkownika
// =============================
server.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email i hasło są wymagane' });

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res.status(409).json({ error: 'Użytkownik o tym emailu już istnieje' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword },
    });

    res.status(201).json({
      message: '✅ User created successfully',
      userId: user.id,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Coś poszło nie tak przy rejestracji' });
  }
});


server.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email i hasło są wymagane' });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return res.status(401).json({ error: 'Nieprawidłowe dane logowania' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ error: 'Nieprawidłowe dane logowania' });

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'your_default_secret',
      { expiresIn: '1h' }
    );

    res.json({ message: '✅ Zalogowano pomyślnie', token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Coś poszło nie tak przy logowaniu' });
  }
});


server.get('/api/history', authenticate, async (req, res) => {
  try {
    const history = await prisma.commandHistory.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    res.json(history);
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ error: 'Nie udało się pobrać historii' });
  }
});


server.get('/api/integrations', (req, res) => {
  const integrations = [
    {
      name: 'AWS',
      status: process.env.AWS_ACCESS_KEY_ID || process.env.AWS_PROFILE
        ? 'Connected'
        : 'Not Connected',
      details: process.env.AWS_PROFILE
        ? `Profile used: ${process.env.AWS_PROFILE}`
        : 'IAM keys configured',
    },
    {
      name: 'Slack',
      status: process.env.SLACK_BOT_TOKEN ? 'Connected' : 'Not Connected',
      details: process.env.SLACK_BOT_TOKEN
        ? 'Bot token configured'
        : 'No Slack Token',
    },
  ];
  res.json(integrations);
});

server.use('/slack/events', receiver.router);


const PORT = process.env.PORT || 4000;
server.listen(PORT, async () => {
  console.log(`⚡️ ChatOps Backend running on port ${PORT}`);
  try {
    await prisma.$connect();
    console.log('🗄️  Connected with Prisma');
  } catch (err) {
    console.error('❌ Error during connecting with Prisma: ', err);
  }
});
