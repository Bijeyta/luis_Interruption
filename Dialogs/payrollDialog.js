const { ComponentDialog, WaterfallDialog,ChoicePrompt, ChoiceFactory, TextPrompt, ConfirmPrompt } = require('botbuilder-dialogs');
const { CardFactory } =require('botbuilder')
const { CancelAndHelpDialog } = require('./CancelAndHelpDialogs')
const { payrollDialog } = require('../Constants/DialogIds')
// const { LuisRecognizer } = require('botbuilder-ai');

const payrollDialogWF1 = 'helpDialogWF1';
const ChoicePromptDialog = 'ChoicePromptDialog';
const TextPromptDialog = 'TextPromptDialog';
const CONFIRM_PROMPT = 'CONFIRM_PROMPT';

// let luisConfig = {
//     applicationId: '83ed5ad0-cc00-41f8-ac29-354a8262de77',
//     endpointKey: '097932140af64c1f90c4a6955410c0a8',
//     endpoint: 'https://trainingchatbotluis.cognitiveservices.azure.com/'
// }

class PayrollDialog extends CancelAndHelpDialog {
    constructor(conversationState) {
        super(payrollDialog);
        if(!conversationState) throw new Error('ConversationState is required');

        this.conversationState = conversationState;

        this.payrollStateAccessor = this.conversationState.createProperty('PayrollStateAccessor');

        this.addDialog(new ChoicePrompt(ChoicePromptDialog));
        this.addDialog(new TextPrompt(TextPromptDialog));
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
        
        this.addDialog(new WaterfallDialog(payrollDialogWF1, [
            this.someSuggesstions.bind(this),
            this.selectmonth.bind(this),
            this.showslip.bind(this)
            // this.askanything.bind(this),
            // this.someSuggesstions.bind(this),
            // this.payrollreturn.bind(this),
            // this.askfurtherprocess.bind(this)
        ]));

        // this.recognizer = new LuisRecognizer(luisConfig, {
        //     apiVersion: 'v3'
        // })

        this.initialDialogId = payrollDialogWF1;
    }

    async someSuggesstions(stepContext) {

        const dialogData = stepContext.options;
        // dialogData.someSuggesstions = stepContext.result.value;
        console.log(dialogData)
        if(!dialogData.serviceType) {
            await stepContext.prompt(ChoicePromptDialog, {
                prompt: 'Please help me with the type of option you want for the Payroll',
                choices: ChoiceFactory.toChoices(['RTF', 'CTF', 'MTF'])
            });
            return ComponentDialog.EndOfTurn;
        }
        return await stepContext.next(dialogData.serviceType);

    }

    async selectmonth(stepContext) {
        const dialogData = stepContext.options
        if(!dialogData.month) {
            dialogData.promptSelected = stepContext.result.value;
            let msgCard = await createCard();
            return await stepContext.context.sendActivity({
                attachments: [CardFactory.adaptiveCard(msgCard)]
            })
        }
        return stepContext.next(dialogData.month);
        // let dialogData = await this.payrollStateAccessor.get(stepContext.context, {});
        
        // return Dialog.EndOfTurn;
    }

    async showslip(stepContext) {
        console.log("---------------------> ", stepContext.context.activity.value)
        await stepContext.context.sendActivity(`Your gratuity amount for your selected month is $15000`);
        return stepContext.endDialog();
    }

    // async askanything(stepContext) {
    //     let dialogData = await this.payrollStateAccessor.get(stepContext.context, {});
    //     dialogData.promptSelected = stepContext.result.value;
    //     await stepContext.context.sendActivity(`So you have choosen this prompt ${dialogData.promptSelected}`)
    //     return stepContext.endDialog();

    // }


    // async askfurtherprocess(step) {
    //     await step.context.sendActivity(CONFIRM_PROMPT, `You want to continue previous flow`);
    //     return ComponentDialog.EndOfTurn;
    // }
}

function createCard() {
    return new Promise((resolve, reject) => {
        let monthList = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
    let card = {
        "type": "AdaptiveCard",
        "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
        "version": "1.3",
        "body": [
            {
                "type": "ColumnSet",
                "separator": true,
                "columns": [
                    {
                        "type": "Column",
                        "width": "stretch",
                        "items": [
                            {
                                "type": "Image",
                                "url": "https://www.celebaltech.com/assets/img/celebal.webp",
                                "size": "Medium"
                            }
                        ]
                    },
                    {
                        "type": "Column",
                        "width": "stretch",
                        "items": [
                            {
                                "type": "TextBlock",
                                "text": "Celebal Technology",
                                "wrap": true,
                                "horizontalAlignment": "Center",
                                "weight": "Bolder",
                                "color": "Dark",
                                "size": "Medium"
                            }
                        ]
                    }
                ]
            },
            {
                "type": "TextBlock",
                "wrap": true,
                "separator": true,
                "text": "Month",
                "weight": "Bolder",
                "color": "Dark"
            },
            {
                "type": "Input.ChoiceSet",
                "choices": [],
                "placeholder": "---select salaryslip month---",
                "id": "month"
            },
            {
                "type": "ActionSet",
                "actions": [
                    {
                        "type": "Action.Submit",
                        "title": "Submit",
                        "id": "subm",
                        "style": "positive"
                    }
                ],
                "id": "sub"
            }
        ]
    }

    monthList.forEach((data, index) => {
        card.body[2].choices.push( {
            "title": `${data}`,
            "value": `${data}`
        })
        if(index === monthList.length - 1) {
            resolve(card);
        }
    })
    })

}

module.exports.PayrollDialog = PayrollDialog;