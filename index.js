require('dotenv').config();
const { App } = require('@slack/bolt');
const AWS = require('aws-sdk');

// --- AWS Configuration ---
const DEFAULT_REGION = process.env.AWS_REGION || 'eu-central-1'; 
const s3 = new AWS.S3({ region: DEFAULT_REGION });
const ec2 = new AWS.EC2({ region: DEFAULT_REGION });

// List of AWS regions for the Select Menu
const AVAILABLE_REGIONS = [
    { label: 'Europe (Frankfurt) - eu-central-1', value: 'eu-central-1' },
    { label: 'US East (N. Virginia) - us-east-1', value: 'us-east-1' },
    { label: 'Europe (Ireland) - eu-west-1', value: 'eu-west-1' },
    { label: 'Asia Pacific (Sydney) - ap-southeast-2', value: 'ap-southeast-2' },
];

// --- Slack Bot Initialization ---
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

// --- POLICY HELPERS (Skipped for MVP) ---
function isAuthorized(userId, action) {
    return true; 
}

// --- EVENT AND COMMAND HANDLING ---

// 1. Bot responds to mentions (@)
app.event('app_mention', async ({ event, say }) => {
  await say(`Hello <@${event.user}> 👋 I'm your ChatOps Agent. Try: \`create bucket my-name in region eu-west-1 with versioning enabled\` or \`show ec2 instances\`.`);
});

// 2. Bot responds to "hello" messages
app.message('hello', async ({ message, say }) => {
  await say(`Hi <@${message.user}>! 👋 Ready for action!`);
});

// 3. 🚀 COMMAND: Create S3 Bucket with optional Versioning (Using RegEx)
app.message(/create bucket (\S+)(?: in region)? (\S+)(?:\s+with versioning enabled)?/i, async ({ message, say, context }) => {
    
    const bucketName = context.matches[1];
    const region = context.matches[2].toLowerCase(); 
    const userId = message.user;
    const enableVersioning = message.text.toLowerCase().includes('with versioning enabled');

    if (!isAuthorized(userId, 'CREATE_BUCKET')) {
      await say(`🚨 Sorry <@${userId}>, you are not authorized to create S3 buckets.`);
      return;
    }
    
    let responseText = `🤖 <@${userId}>, attempting to create bucket **${bucketName}** in region **${region}**...`;
    await say(responseText);

    try {
        const s3Client = new AWS.S3({ region: region }); 
        
        // 1. Create Bucket
        const createParams = {
            Bucket: bucketName,
            CreateBucketConfiguration: { LocationConstraint: region },
        };
        const createData = await s3Client.createBucket(createParams).promise();
        
        responseText = `✅ Success! Bucket **${bucketName}** was created successfully. Location: \`${createData.Location}\``;

        // 2. Enable Versioning
        if (enableVersioning) {
            await say(`⚙️ Enabling versioning for **${bucketName}**...`);
            const versioningParams = {
                Bucket: bucketName,
                VersioningConfiguration: { Status: 'Enabled' }
            };
            await s3Client.putBucketVersioning(versioningParams).promise();
            responseText += `\n*Versioning:* ✅ **Enabled**`;
        }
        
        await say(responseText);

    } catch (error) {
        console.error('Error creating S3 Bucket or setting versioning:', error);
        if (error.code === 'BucketAlreadyOwnedByYou') {
            await say(`⚠️ Error: Bucket **${bucketName}** already exists and is owned by you.`);
        } else {
            await say(`❌ Failed to create or configure bucket **${bucketName}**.\nAWS Error: \`${error.code}: ${error.message}\``);
        }
    }
});

// 4. 📂 COMMAND: List S3 Buckets (Uses Block Kit, listens for "list s3 buckets")
app.message(/list s3 buckets/i, async ({ say }) => {
  
  await say(`Checking S3 buckets on your account. This list is global. ⏳`);

  try {
    const data = await s3.listBuckets().promise(); 
    const buckets = data.Buckets;
    
    if (!buckets || buckets.length === 0) {
      await say(`No S3 buckets found on this AWS account.`);
      return;
    }

    const bucketBlocks = [];
    bucketBlocks.push({
        type: 'header',
        text: { type: 'plain_text', text: `Found ${buckets.length} S3 Buckets 📁` }
    });
    bucketBlocks.push({ type: 'divider' });

    buckets.forEach(b => {
      bucketBlocks.push({
        type: 'section',
        fields: [
            { type: 'mrkdwn', text: `*Name:*\n\`${b.Name}\`` },
            { type: 'mrkdwn', text: `*Created On:*\n${b.CreationDate.toISOString().split('T')[0]}` }
        ]
      });
    });

    await say({
      text: `List of S3 buckets:`, 
      blocks: bucketBlocks
    });

  } catch (error) {
    console.error('Error listing S3 buckets:', error);
    await say(`❌ An error occurred while fetching S3 data.\nAWS Error: \`${error.code}: ${error.message}\``);
  }
});


// 5. 🌐 COMMAND: Ask for EC2 Region via Select Menu (Listens for "show ec2 instances")
app.message(/show ec2 instances/i, async ({ message, say }) => {
    const userId = message.user;

    await say({
        text: `Hello <@${userId}>, please choose the AWS region to check for EC2 instances.`,
        blocks: [
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: '🌐 *Please select the AWS region to check:*'
                },
                accessory: {
                    type: 'static_select',
                    placeholder: {
                        type: 'plain_text',
                        text: 'Select a region...'
                    },
                    // KEY: This action_id is handled in the next block
                    action_id: 'ec2_region_select', 
                    options: AVAILABLE_REGIONS.map(r => ({
                        text: { type: 'plain_text', text: r.label },
                        value: r.value
                    }))
                }
            }
        ]
    });
});

// 6. 🎣 ACTION HANDLER: Process the region selected from the menu (Handles 'ec2_region_select')
app.action('ec2_region_select', async ({ ack, body, say, client }) => {
    await ack(); 

    const selectedRegion = body.actions[0].selected_option.value;
    const userId = body.user.id;

    // Send an immediate acknowledgement message to the channel
    await client.chat.postMessage({
        channel: body.channel.id,
        text: `Checking EC2 instances in region **${selectedRegion}**. One moment... 🕒`,
    });

    try {
        const ec2Client = new AWS.EC2({ region: selectedRegion });
        const data = await ec2Client.describeInstances().promise();
        const instances = data.Reservations.flatMap(r => r.Instances);

        if (instances.length === 0) {
            await client.chat.postMessage({
                channel: body.channel.id,
                text: `No active EC2 instances found in the **${selectedRegion}** region.`,
            });
            return;
        }

        const ec2Blocks = [];
        ec2Blocks.push({
            type: 'header',
            text: { type: 'plain_text', text: `Found ${instances.length} EC2 Instances in ${selectedRegion} 🖥️` }
        });
        ec2Blocks.push({ type: 'divider' });

        instances.forEach(i => {
            const nameTag = i.Tags ? i.Tags.find(tag => tag.Key === 'Name') : null;
            const instanceName = nameTag ? nameTag.Value : 'No Name Tag';
            
            ec2Blocks.push({
                type: 'section',
                fields: [
                    { type: 'mrkdwn', text: `*Name:* ${instanceName}` },
                    { type: 'mrkdwn', text: `*State:* ${i.State.Name}` },
                    { type: 'mrkdwn', text: `*ID:* \`${i.InstanceId}\`` },
                    { type: 'mrkdwn', text: `*Type:* ${i.InstanceType}` },
                ]
            });

            // Add interactive buttons if running
            if (i.State.Name === 'running') {
                 ec2Blocks.push({
                    type: 'actions',
                    elements: [
                        { type: 'button', text: { type: 'plain_text', text: '🛑 Stop Instance' }, style: 'danger', action_id: `ec2_stop_${i.InstanceId}_${selectedRegion}` },
                        { type: 'button', text: { type: 'plain_text', text: '🔄 Reboot Instance' }, style: 'primary', action_id: `ec2_reboot_${i.InstanceId}_${selectedRegion}` }
                    ]
                });
            }
            ec2Blocks.push({ type: 'divider' }); 
        });
        
        await client.chat.postMessage({
            channel: body.channel.id,
            text: `List of EC2 instances in ${selectedRegion}:`,
            blocks: ec2Blocks
        });

    } catch (error) {
        console.error('Error listing EC2 via select menu:', error);
        await client.chat.postMessage({
            channel: body.channel.id,
            text: `❌ An error occurred while fetching instances in region **${selectedRegion}**.\nAWS Error: \`${error.code}: ${error.message}\``,
        });
    }
});

// 7. ⚡️ ACTION HANDLER: Process Button Clicks (Stop/Reboot)
app.action(/ec2_(stop|reboot)_(\S+)_(\S+)/, async ({ ack, body, say, context }) => {
    await ack(); 

    const actionType = context.matches[1]; 
    const instanceId = context.matches[2]; 
    const region = context.matches[3];
    const userId = body.user.id;
    
    const verb = (actionType === 'stop') ? 'stop' : 'reboot';
    const awsMethod = (actionType === 'stop') ? 'stopInstances' : 'rebootInstances';
    const verbPast = (actionType === 'stop') ? 'stopped' : 'rebooted';

    await say(`🤖 <@${userId}>, attempting to **${verb}** instance \`${instanceId}\` in region **${region}**...`);

    try {
        const ec2Client = new AWS.EC2({ region: region });
        await ec2Client[awsMethod]({ InstanceIds: [instanceId] }).promise();

        await say(`✅ Success! Instance \`${instanceId}\` was successfully requested to be **${verbPast}**.`);

    } catch (error) {
        console.error(`Error during ${actionType} EC2 instance:`, error);
        await say(`❌ Failed to **${verb}** instance \`${instanceId}\`.\nAWS Error: \`${error.code}: ${error.message}\``);
    }
});


// --- Start Server ---

(async () => {
  try {
    await app.start(process.env.PORT || 4000);
    console.log('⚡️ Slack bot is running on port 4000!');
  } catch (error) {
    console.error('Error starting Slack bot:', error);
  }
})();