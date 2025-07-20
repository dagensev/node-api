const cron = require('node-cron');
const { Client, GatewayIntentBits, Events } = require('discord.js');
const { promptChatGpt } = require('../../utils/chatgpt');
const QuizModel = require('../../models/quizModel');

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const ADMIN_USER_ID = process.env.DISCORD_ADMIN_USER_ID;
const MOTHERSHIP_GUILD_ID = process.env.DISCORD_MOTHERSHIP_GUILD_ID;

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages],
    partials: ['CHANNEL'], // Needed to receive DMs
});

client.once(Events.ClientReady, () => {
    console.log(`Discord bot logged in as ${client.user.tag}`);
});

async function handleQuizTopic(topic) {
    try {
        // Quiz Generation prompt
        const prompt = {
            id: 'pmpt_687d3c8f3eec8194841faef637bc6861020e8e43137e03c7',
            version: '2',
            variables: {
                topic,
                number_of_questions: '5',
                format: 'multiple_choice',
                number_of_selections: '5',
            },
        };
        const model = 'gpt-4.1-mini';
        const chatGptResponse = await promptChatGpt({ prompt, model });

        let quizData;
        try {
            quizData = JSON.parse(chatGptResponse);
            await QuizModel.insertQuiz(quizData);
        } catch (err) {
            console.error('Failed to parse ChatGPT JSON or insert quiz:', err);
        }
    } catch (err) {
        console.error('Error calling ChatGPT:', err);
    }
}

async function requestQuizTopic() {
    try {
        const guild = await client.guilds.fetch(MOTHERSHIP_GUILD_ID);
        const adminUser = await client.users.fetch(ADMIN_USER_ID);
        if (!guild || !adminUser) throw new Error('Guild or admin user not found');

        // Send DM
        const dmChannel = await adminUser.createDM();
        await dmChannel.send("What topic should be used for today's daily quiz? Please reply within 10 minutes.");

        // Wait for reply (10 min = 600000 ms)
        const filter = (msg) => msg.author.id === ADMIN_USER_ID;
        const collected = await dmChannel.awaitMessages({ filter, max: 1, time: 600000, errors: ['time'] }).catch(() => null);

        let topic = null;
        if (collected && collected.size > 0) {
            topic = collected.first().content;
            console.log('Received topic:', topic);

            await handleQuizTopic(topic);
        } else {
            await dmChannel.send('No topic received in 10 minutes. Timing out.');
            console.log('No topic received, timed out.');
        }
    } catch (err) {
        console.error('Error in quiz topic request:', err);
    }
}

cron.schedule('0 7 * * *', async () => {
    await requestQuizTopic();
});

client.login(BOT_TOKEN);

// Uncomment the following lines to manually trigger for testing:
// client.once(Events.ClientReady, async () => {
//     await requestQuizTopic();
// });
