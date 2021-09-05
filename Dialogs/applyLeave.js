const { ComponentDialog, WaterfallDialog, ChoicePrompt, ChoiceFactory, NumberPrompt, TextPrompt } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('./CancelAndHelpDialogs')
const { applyLeaveDialog } = require('../Constants/DialogIds')
const { CardFactory } = require('botbuilder');
const { confirmleave } = require('../cards/cards');

const { LuisRecognizer } = require('botbuilder-ai');

let luisConfig = {
    applicationId: '83ed5ad0-cc00-41f8-ac29-354a8262de77',
    endpointKey: '097932140af64c1f90c4a6955410c0a8',
    endpoint: 'https://trainingchatbotluis.cognitiveservices.azure.com/'
}

const applyLeaveDialogWF1 = 'helpDialogWF1';
const ChoicePromptDialog = 'ChoicePromptDialog';
const NumberPromptDialog = 'NumberPromptDialog';
const TextPromptDialog = 'TextPromptDialog';

class ApplyLeaveDialog extends CancelAndHelpDialog {
    constructor(conversationState) {
        super(applyLeaveDialog);
        if(!conversationState) throw new Error('ConversationState is required');

        this.conversationState = conversationState;
        this.applyLeaveStateAccessor = this.conversationState.createProperty('ApplyLeaveState');

        this.addDialog(new ChoicePrompt(ChoicePromptDialog));
        this.addDialog(new NumberPrompt(NumberPromptDialog));
        this.addDialog(new TextPrompt(TextPromptDialog));
        
        this.addDialog(new WaterfallDialog(applyLeaveDialogWF1, [
            this.askleavetype.bind(this),
            this.askNoOfDays.bind(this),
            this.askleavedate.bind(this),
            this.applyLeave.bind(this),
            this.applyApplication.bind(this)
        ]));

        this.recognizer = new LuisRecognizer(luisConfig, {
            apiVersion: 'v3'
        })

        this.initialDialogId = applyLeaveDialogWF1;
    }

    async askleavetype(stepContext) {

        const dialogData = stepContext.options
        if(!dialogData.leaveType) {
            await stepContext.prompt(ChoicePromptDialog, {
                prompt: 'Please help me with the type of leave you want to apply',
                choices: ChoiceFactory.toChoices(['Sick Leave', 'Causal Leave', 'Earned Leave'])
            });
            return ComponentDialog.EndOfTurn;
        }
        return await stepContext.next(dialogData.leaveType);
    }

    async askNoOfDays(stepContext) {

        const dialogData = stepContext.options;
        console.log(dialogData, 'All data in npOfdays');
        dialogData.leaveType = stepContext.result;
        console.log(dialogData.leaveType, 'finding leave type in noOfDays');

        if(!dialogData.NoOfDays) {
            return await stepContext.prompt(NumberPromptDialog, `Enetr the number of Days you want to apply for leave ${dialogData.leaveType}`);
        }
        return await stepContext.next(dialogData.NoOfDays);

        // let dialogData = await this.applyLeaveStateAccessor.get(stepContext.context, {});
        // dialogData.leaveType = stepContext.result.value;
        // return await stepContext.prompt(NumberPromptDialog, `Enter the number of days you want to applu for leave ${dialogData.leaveType}`)
    }

    async askleavedate(stepContext) {

        const dialogData = stepContext.options
        dialogData.NoOfDays = stepContext.result;
        console.log(dialogData, 'ask leave date')

        if(!dialogData.date) {
            return await stepContext.prompt(TextPromptDialog, `From which date you want to apply ${dialogData.leaveType} application`);
        }
        return stepContext.next(dialogData.date)

        // let dialogData = await this.applyLeaveStateAccessor.get(stepContext.context);
        // dialogData.leavedays = stepContext.result;
        // return await stepContext.prompt(TextPromptDialog, `Enter the date from which you want to apply for the ${dialogData.leaveType}`);
    }

    async applyLeave(stepContext) {
        const dialogData = stepContext.options
        dialogData.date = stepContext.result;
        console.log(dialogData, 'Dialogdata')
        
        await stepContext.context.sendActivity(`You had applied leave for ${dialogData.leaveType} from ${dialogData.date} for ${dialogData.NoOfDays} `);
        await stepContext.prompt(ChoicePromptDialog, {
            prompt: 'Do you really want to apply leave?',
            choices: ChoiceFactory.toChoices(['Yes', 'No'])
        })
        return ComponentDialog.EndOfTurn;
    }

    async applyApplication(stepContext) {
        // let dialogData = await this.applyLeaveStateAccessor.get(stepContext.context);
        // dialogData.leavedate = stepContext.result; 
        let dialogData = stepContext.options;
        dialogData.applyApplication = stepContext.result.value;
        console.log(dialogData)
        if(dialogData.applyApplication == 'Yes') {
            await stepContext.context.sendActivity({
                attachments: [
                    CardFactory.adaptiveCard(confirmleave(dialogData.leaveType, dialogData.leavedays, dialogData.leavedate))
                ]
            });
            await stepContext.context.sendActivity('You had applied for the leave successfully');
            return stepContext.endDialog();
        } else {
            await stepContext.context.sendActivity({
                attachments: [CardFactory.heroCard(
                    'Here are some suggesstion that you can try',
                    null,
                    CardFactory.actions([
                        {
                            type: 'imBack',
                            title: 'HR Help Desk',
                            value: 'HR Help'
                        },
                        {
                            type: 'imBack',
                            title: 'IT Help Desk',
                            value: 'IT Help'
                        },
                        {
                            type: 'imBack',
                            title: 'Sales',
                            value: 'Sales'
                        },
                        {
                            type: 'imBack',
                            title: 'Admin',
                            value: 'Admin'
                        }
                    ])
                )]
            })
        }
        return await stepContext.endDialog();
    }

}

module.exports.ApplyLeaveDialog = ApplyLeaveDialog   