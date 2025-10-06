require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const AWS = require('aws-sdk');
const { PrismaClient } = require('@prisma/client');
const { App, ExpressReceiver } = require('@slack/bolt');

const prisma = new PrismaClient();

// ExpressReceiver dla Slack
const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  endpoints: '/slack/events',
});

// Express server z receiverem
const server = receiver.app;
server.use(cors());

// Konfiguracja AWS
if (process.env.AWS_PROFILE) {
  const credentials = new AWS.SharedIniFileCredentials({
    profile: process.env.AWS_PROFILE,
  });
  AWS.config.credentials = credentials;
}
const s3 = new AWS.S3({ region: process.env.AWS_REGION || 'eu-central-1' });
const ec2 = new AWS.EC2({ region: process.env.AWS_REGION || 'eu-central-1' });

// Slack App Configuration
const slackApp = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver: receiver,
});

// =============================
// 🤖 AWS Command Handlers
// =============================

async function handleListS3Buckets() {
  try {
    const data = await s3.listBuckets().promise();
    
    if (!data.Buckets || data.Buckets.length === 0) {
      return {
        success: true,
        message: '📦 Nie znaleziono żadnych S3 buckets',
        data: []
      };
    }

    const bucketList = data.Buckets.map((bucket, index) => 
      `${index + 1}. *${bucket.Name}* - utworzony: ${new Date(bucket.CreationDate).toLocaleDateString('pl-PL')}`
    ).join('\n');

    return {
      success: true,
      message: `📦 *Znaleziono ${data.Buckets.length} S3 bucket(s):*\n\n${bucketList}`,
      data: data.Buckets
    };
  } catch (error) {
    console.error('Error listing S3 buckets:', error);
    return {
      success: false,
      message: `❌ Błąd podczas listowania buckets: ${error.message}`,
      data: null
    };
  }
}

async function handleListEC2Instances() {
  try {
    const data = await ec2.describeInstances().promise();
    
    const instances = [];
    data.Reservations.forEach(reservation => {
      reservation.Instances.forEach(instance => {
        const name = instance.Tags?.find(tag => tag.Key === 'Name')?.Value || 'Unnamed';
        instances.push({
          id: instance.InstanceId,
          name: name,
          state: instance.State.Name,
          type: instance.InstanceType,
          ip: instance.PublicIpAddress || 'N/A'
        });
      });
    });

    if (instances.length === 0) {
      return {
        success: true,
        message: '🖥️ Nie znaleziono żadnych instancji EC2',
        data: []
      };
    }

    const instanceList = instances.map((inst, index) => 
      `${index + 1}. *${inst.name}* (${inst.id})\n   Status: ${inst.state} | Typ: ${inst.type} | IP: ${inst.ip}`
    ).join('\n\n');

    return {
      success: true,
      message: `🖥️ *Znaleziono ${instances.length} instancji EC2:*\n\n${instanceList}`,
      data: instances
    };
  } catch (error) {
    console.error('Error listing EC2 instances:', error);
    return {
      success: false,
      message: `❌ Błąd podczas listowania instancji: ${error.message}`,
      data: null
    };
  }
}

async function handleGetBucketInfo(bucketName) {
  try {
    await s3.headBucket({ Bucket: bucketName }).promise();
    
    const [location, versioning, encryption] = await Promise.all([
      s3.getBucketLocation({ Bucket: bucketName }).promise().catch(() => ({ LocationConstraint: 'N/A' })),
      s3.getBucketVersioning({ Bucket: bucketName }).promise().catch(() => ({ Status: 'N/A' })),
      s3.getBucketEncryption({ Bucket: bucketName }).promise().catch(() => null)
    ]);

    const objects = await s3.listObjectsV2({ Bucket: bucketName, MaxKeys: 1000 }).promise();
    
    const info = [
      `📦 *Informacje o bucket: ${bucketName}*`,
      ``,
      `🌍 Region: ${location.LocationConstraint || 'us-east-1'}`,
      `📊 Liczba obiektów: ${objects.KeyCount}${objects.IsTruncated ? '+' : ''}`,
      `🔄 Versioning: ${versioning.Status || 'Disabled'}`,
      `🔐 Encryption: ${encryption ? 'Enabled' : 'Disabled'}`
    ].join('\n');

    return {
      success: true,
      message: info,
      data: { location, versioning, encryption, objectCount: objects.KeyCount }
    };
  } catch (error) {
    console.error('Error getting bucket info:', error);
    return {
      success: false,
      message: `❌ Błąd: ${error.code === 'NoSuchBucket' ? 'Bucket nie istnieje' : error.message}`,
      data: null
    };
  }
}

async function parseAndExecuteCommand(commandText) {
  const text = commandText.toLowerCase().trim();

  if (text.includes('list s3') || text.includes('list buckets')) {
    return await handleListS3Buckets();
  }

  if (text.includes('list ec2') || text.includes('ec2 status') || text.includes('list instances')) {
    return await handleListEC2Instances();
  }

  const bucketInfoMatch = text.match(/bucket info (.+)/) || text.match(/info (.+)/);
  if (bucketInfoMatch) {
    const bucketName = bucketInfoMatch[1].trim();
    return await handleGetBucketInfo(bucketName);
  }

  if (text.includes('help') || text.includes('pomoc')) {
    return {
      success: true,
      message: `🤖 *Dostępne komendy:*\n\n` +
               `📦 *S3 Commands:*\n` +
               `• \`list s3 buckets\` - Lista wszystkich S3 buckets\n` +
               `• \`bucket info <nazwa>\` - Szczegóły bucket\n\n` +
               `🖥️ *EC2 Commands:*\n` +
               `• \`list ec2 instances\` - Lista instancji EC2\n` +
               `• \`ec2 status\` - Status instancji\n\n` +
               `❓ *Inne:*\n` +
               `• \`help\` - Ta wiadomość`,
      data: null
    };
  }

  return {
    success: false,
    message: `❓ Nieznana komenda: "${commandText}"\n\nWpisz \`help\` aby zobaczyć dostępne komendy.`,
    data: null
  };
}

// =============================
// 💬 Slack Event Handlers
// =============================

slackApp.event('app_mention', async ({ event, say, client }) => {
  try {
    console.log(`📩 App mention: ${event.text} (od ${event.user})`);

    const commandText = event.text.replace(/<@[A-Z0-9]+>/g, '').trim();

    await say('⏳ Przetwarzam komendę...');

    const result = await parseAndExecuteCommand(commandText);

    await prisma.commandHistory.create({
      data: {
        user: event.user,
        command: commandText,
        response: result.message,
        success: result.success,
      },
    }).catch(err => console.error('Error saving to history:', err));

    await say(result.message);

  } catch (error) {
    console.error('❌ Error handling app mention:', error);
    await say(`❌ Wystąpił błąd: ${error.message}`).catch(console.error);
  }
});

slackApp.message(async ({ message, say }) => {
  if (message.subtype || message.thread_ts) return;

  try {
    console.log(`📩 Direct message: ${message.text} (od ${message.user})`);

    const commandText = message.text.trim();

    await say('⏳ Przetwarzam komendę...');

    const result = await parseAndExecuteCommand(commandText);

    await prisma.commandHistory.create({
      data: {
        user: message.user,
        command: commandText,
        response: result.message,
        success: result.success,
      },
    }).catch(err => console.error('Error saving to history:', err));

    await say(result.message);

  } catch (error) {
    console.error('❌ Error handling message:', error);
    await say(`❌ Wystąpił błąd: ${error.message}`).catch(console.error);
  }
});

// =============================
// 🌐 HTTP API Routes
// =============================

// Dodaj express.json() tylko dla API routes
const apiRouter = express.Router();
apiRouter.use(express.json());

// Middleware do uwierzytelniania JWT
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

apiRouter.post('/register', async (req, res) => {
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

apiRouter.post('/login', async (req, res) => {
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

apiRouter.get('/history', authenticate, async (req, res) => {
  try {
    const history = await prisma.commandHistory.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(history);
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ error: 'Nie udało się pobrać historii' });
  }
});

apiRouter.get('/integrations', (req, res) => {
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

// Mount API router
server.use('/api', apiRouter);

// Health check
server.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    slackConnected: !!process.env.SLACK_BOT_TOKEN,
    awsConnected: !!(process.env.AWS_ACCESS_KEY_ID || process.env.AWS_PROFILE)
  });
});

// =============================
// 🚀 Start Server
// =============================

const PORT = process.env.PORT || 4000;
server.listen(PORT, async () => {
  console.log(`⚡️ ChatOps Backend running on port ${PORT}`);
  console.log(`📱 Slack Events: http://localhost:${PORT}/slack/events`);
  
  try {
    await prisma.$connect();
    console.log('🗄️  Connected with Prisma');
  } catch (err) {
    console.error('❌ Error during connecting with Prisma:', err);
  }

  console.log('\n🤖 Bot is ready! Available commands:');
  console.log('   • list s3 buckets');
  console.log('   • list ec2 instances');
  console.log('   • bucket info <nazwa>');
  console.log('   • help\n');
});