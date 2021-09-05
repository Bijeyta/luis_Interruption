const { ComponentDialog, WaterfallDialog,ChoicePrompt, ChoiceFactory, TextPrompt } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('./CancelAndHelpDialogs')
const { helpDialog } = require('../Constants/DialogIds')

const helpDialogWF1 = 'helpDialogWF1';
const ChoicePromptDialog = 'ChoicePromptDialog';
const TextPromptDialog = 'TextPromptDialog';

class HelpDialog extends CancelAndHelpDialog {
    constructor(conversationState) {
        super(helpDialog);
        if(!conversationState) throw new Error('ConversationState is required');

        this.conversationState = conversationState;

        this.helpDeskStateAccessor = this.conversationState.createProperty('HelpDeskStateAccessor');

        this.addDialog(new ChoicePrompt(ChoicePromptDialog));
        this.addDialog(new TextPrompt(TextPromptDialog));

        this.addDialog(new WaterfallDialog(helpDialogWF1, [
            this.sendHelpSuggesstions.bind(this),
            this.askanything.bind(this)
        ]));

        this.initialDialogId = helpDialogWF1;
    }

    async sendHelpSuggesstions(stepContext) {
        return await stepContext.prompt(ChoicePromptDialog, {
            prompt: 'Select from the below option, which type of help you need?',
            choices: ChoiceFactory.toChoices(['Apply Leave', 'PayRoll', 'Rembrishment'])
        })

    }

    async askanything(stepContext) {
        let dialogData = await this.helpDeskStateAccessor.get(stepContext.context, {});
        dialogData.promptSelected = stepContext.result.value;
        return await stepContext.prompt(TextPromptDialog, `This is some flow i am make to test the flow of ${dialogData.promptSelected}`)
    }
}

module.exports.HelpDialog = HelpDialog