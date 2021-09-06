const { ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog, ConfirmPrompt } = require('botbuilder-dialogs');
const { rootDialog, helpDialog, applyLeaveDialog, payrollDialog } = require('../Constants/DialogIds');
const { HelpDialog } = require('./helpDialog');
const { ApplyLeaveDialog } = require('./applyLeave')
const { PayrollDialog } = require('./payrollDialog')
const { OtherDialog } = require('./otherDialog')
const { LuisRecognizer } = require('botbuilder-ai')

let luisConfig = {
    applicationId: '83ed5ad0-cc00-41f8-ac29-354a8262de77',
    endpointKey: '097932140af64c1f90c4a6955410c0a8',
    endpoint: 'https://trainingchatbotluis.cognitiveservices.azure.com/'
}

const parseMessage = 'parseMessage';
const CONFIRM_PROMPT = 'CONFIRM_PROMPT'

class RootDialog extends ComponentDialog {
    constructor(conversationState, luisRecognizer) {
        super(rootDialog);
        if(!conversationState) throw new Error('ConversationState is required');
        this.conversationState = conversationState;
        this.luisRecognizer = luisRecognizer;

        this.recognizer = new LuisRecognizer(luisConfig, {
            apiVersion: 'v3'
        });

        this.addDialog(new WaterfallDialog(parseMessage, [
            this.routeMessage.bind(this)
        ]));


        this.addDialog(new HelpDialog(conversationState));
        this.addDialog(new ApplyLeaveDialog(conversationState));
        this.addDialog(new PayrollDialog(conversationState));
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
        this.addDialog(new OtherDialog(conversationState));

        this.initialDialogId = parseMessage;

    }

    async run(context, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dContext = await dialogSet.createContext(context);
        const result = await dContext.continueDialog();
        if(result.status === DialogTurnStatus.empty){
            await dContext.beginDialog(this.id);
        }
    }

    // async routeMessage(stepContext) {
    //     switch(stepContext.context.activity.text.toLowerCase()) {
    //         case 'apply leave':
    //             console.log('hiiiiiiiiiii');
    //             return await stepContext.beginDialog(applyLeaveDialog);
    //         case 'leave status':
    //             break;
    //         case 'help':
    //             return await stepContext.beginDialog(helpDialog);
    //         case 'payroll':
    //             return await stepContext.beginDialog(payrollDialog);
    //         default:
    //             await stepContext.context.sendActivity('You have entered something wrong');
    //     }
    //     return await stepContext.endDialog();
    // }
    

    async routeMessage(stepContext) {

        const leaveDetails = {};
        let luisresponse = await this.luisRecognizer.excuteLuisQuery(stepContext.context);
        console.log(luisresponse);
        console.log(LuisRecognizer.topIntent(luisresponse).toLowerCase())

        switch(LuisRecognizer.topIntent(luisresponse).toLowerCase()) {
            case 'leaveapp': {

                const fromEntities = this.luisRecognizer.getFromEntities(luisresponse);
                console.log(fromEntities, ')))))))))))))))))leaveapp Entities')
                leaveDetails.leaveType = fromEntities.leaveType;
                leaveDetails.NoOfDays = fromEntities.NoOfDays;
                leaveDetails.date = fromEntities.date;

                console.log('LUIS extracted these leaving details:', JSON.stringify(leaveDetails));
                return await stepContext.beginDialog(applyLeaveDialog, leaveDetails);
                
            }
            case 'leave status':
                break;
            case 'help':
                return await stepContext.beginDialog(helpDialog);
            case 'payroll': {

                const fromEntities = this.luisRecognizer.getFromEntities(luisresponse);
                console.log(fromEntities,"++++++++++++payrollEntities");
                leaveDetails.serviceType = fromEntities.serviceType;
                leaveDetails.month = fromEntities.month;

                console.log('LUIS extracted these leaving details:', JSON.stringify(leaveDetails));
                // console.log(leaveDetails.serviceType, '----------------------------------service type');
                // console.log(leaveDetails.month, '----------------month');
                return await stepContext.beginDialog(payrollDialog, leaveDetails);
            }
            default:
                await stepContext.context.sendActivity('You have entered something wrong');
        }
    }
}

module.exports.RootDialog = RootDialog;