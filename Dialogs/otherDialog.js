const { ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog, ConfirmPrompt, ChoicePrompt, ChoiceFactory } = require('botbuilder-dialogs');
const { rootDialog, helpDialog, applyLeaveDialog, payrollDialog, otherDialog } = require('../Constants/DialogIds');
const { CancelAndHelpDialog } = require('./CancelandHelpDialogs')
const INTERRUPT_DIALOG = 'INTERRUPT_DIALOG'
const ConfirmPromptDialog = 'ConfirmPromptDialog'
const ChoicePromptDialog = 'ChoicePromptDialog';
const { LuisRecognizer } = require('botbuilder-ai')

let luisConfig = {
    applicationId: '83ed5ad0-cc00-41f8-ac29-354a8262de77',
    endpointKey: '097932140af64c1f90c4a6955410c0a8',
    endpoint: 'https://trainingchatbotluis.cognitiveservices.azure.com/'
}

class OtherDialog extends CancelAndHelpDialog {
    constructor(conversationState, luisRecognizer) {
        super(otherDialog);

        this.recognizer = new LuisRecognizer(luisConfig, {
            apiVersion: 'v3'
        });

        if(!conversationState) throw new Error('ConversationState is required');
        this.conversationState = conversationState;
        this.luisRecognizer = luisRecognizer;
        if(!luisRecognizer) throw new Error('Other dialog luisRecognizer is missing');
        this.otherDialogStateAccessor = this.conversationState.createProperty('OtherDialogStateAccessor');

        this.addDialog(new ConfirmPrompt(ConfirmPromptDialog))
        this.addDialog(new WaterfallDialog(INTERRUPT_DIALOG, [
            this.intentStep.bind(this),
            this.summaryStep.bind(this),
            this.demoStep.bind(this)
        ]));

        this.initialDialogId = INTERRUPT_DIALOG;
    }

    async intentStep(stepContext) {
        // const text = stepContext.options;
        // console.log(stepContext.options)
        // switch(text) {
        //     case 'apply leave':
        //         return await stepContext.beginDialog(applyLeaveDialog);
        //     case 'payroll':
        //         return await stepContext.beginDialog(payrollDialog);
        // }
        const leaveDetails = {};
        let luisresponse = await this.luisRecognizer.excuteLuisQuery(stepContext.context);
        // console.log(luisresponse, '------luisResponseOf other dialog');
        // const details = {};
        const intent = stepContext.options.intent;
        // console.log(intent, 'intent in otherdialog');
        // console.log(LuisRecognizer.topIntent(luisResult), 'otherdialog')
        switch(intent) {
            case 'leaveapp': {
                const fromEntities = this.luisRecognizer.getFromEntities(luisresponse);
                // console.log(fromEntities, 'fromentities of other dialog');
                leaveDetails.leaveType = fromEntities.leaveType;
                leaveDetails.NoOfDays = fromEntities.NoOfDays;
                leaveDetails.date = fromEntities.date;

                // console.log('LUIS extracted these leaving details:', JSON.stringify(leaveDetails));
                await stepContext.beginDialog(applyLeaveDialog, leaveDetails);
                return { status: DialogTurnStatus.waiting };
            }
            case 'payroll': {
                const fromEntities = this.luisRecognizer.getFromEntities(luisresponse);
                // console.log(fromEntities,"payrollEntities in otherdialog");
                leaveDetails.serviceType = fromEntities.serviceType;
                leaveDetails.month = fromEntities.month;

                // console.log('LUIS extracted these leaving details:', JSON.stringify(leaveDetails));
                await stepContext.beginDialog(payrollDialog, leaveDetails);
                return { status: DialogTurnStatus.waiting };
            }
        }


    }

    // async summaryStep(stepContext) {
    //     await stepContext.prompt(ChoicePromptDialog, {
    //         prompt: `Do you want to continue previous flow`,
    //         choices: ChoiceFactory.toChoices(['Yes', 'No'])
    //     });
    //     return ComponentDialog.EndOfTurn;
    // }

    async summaryStep(stepContext) {
        return await stepContext.prompt(ConfirmPromptDialog, `You want to continue previous flow`);
    }

    // async demoStep(stepContext) {
    //     let dialogData = await this.otherDialogStateAccessor.get(stepContext.context, {});
    //     dialogData.promptSelected = stepContext.result.value;
    //     console.log(dialogData.promptSelected, 'bbbbbbbbbbbbbbbbbbbbbbbb');
    //     if(dialogData.promptSelected === 'Yes'){
    //         console.log(dialogData.promptSelected, 'uuuuuuuuuuuuuuuuuuuu')
    //         return await stepContext.continueDialog();
    //     } else if(dialogData.promptSelected === 'No') {
    //         await stepContext.context.sendActivity("What else can I do for you?");
    //         return await stepContext.parent.cancelAllDialogs();
    //     }
    // }   
    
    async demoStep(stepContext) {            
        console.log(stepContext.result)  
        if (stepContext.result) {
            console.log(stepContext.result, 'if parttttt');
             return await stepContext.endDialog();
        } else {
             await stepContext.context.sendActivity(`OK, please let me know if there is anything else I can do for you.`);
             return await stepContext.parent.cancelAllDialogs();
        }
   } 
}

module.exports.OtherDialog = OtherDialog;