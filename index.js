const restify = require('restify');
const { BotFrameworkAdapter, ConversationState, MemoryStorage } = require('botbuilder');
const { BotActivityHandler } = require('./BotActivityHandler')
const { RootDialog } = require('./Dialogs/RootDialogs')
const { Recognizer } = require('./Dialogs/Recognizer')

const adapter = new BotFrameworkAdapter({
    appId: '',
    appPassword: ''
})

adapter.onTurnError = async (context, error) => {
    await context.sendActivity('Error has been encountered by Bot');
    console.log('Error has been encountered', error);
}

let luisConfig = {
    applicationId: '83ed5ad0-cc00-41f8-ac29-354a8262de77',
    endpointKey: '097932140af64c1f90c4a6955410c0a8',
    endpoint: 'https://trainingchatbotluis.cognitiveservices.azure.com/'
}

const luisRecognizer = new Recognizer(luisConfig);

const server = restify.createServer();

server.listen(3978, () => {
    console.log(`${server.name} is listing to the port ${server.url}`);
})

const memory = new MemoryStorage();
let conversationState = new ConversationState(memory);
const rootDialog = new RootDialog(conversationState, luisRecognizer);
const mainBot = new BotActivityHandler(conversationState, rootDialog);


server.post('/api/messages', (req,res) => {
    adapter.processActivity(req,res, async(context) => {
        await mainBot.run(context);
    })
})