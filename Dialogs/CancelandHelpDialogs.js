
const { InputHints } = require('botbuilder');
const { LuisRecognizer } = require('botbuilder-ai');
const { ComponentDialog, DialogTurnStatus } = require('botbuilder-dialogs');
const { Recognizer } = require('./Recognizer')
const { payrollDialog, applyLeaveDialog, helpDialog, otherDialog } = require('../Constants/DialogIds')

class CancelAndHelpDialog extends ComponentDialog {
    async onContinueDialog(innerDc) {
        const result = await this.interrupt(innerDc);
        if (result) {
            return result;
        }
        return await super.onContinueDialog(innerDc);
    }

    async interrupt(innerDc) {
        if (innerDc.context.activity.text) {
            let luisConfig = {
                    applicationId: '83ed5ad0-cc00-41f8-ac29-354a8262de77',
                    endpointKey: '097932140af64c1f90c4a6955410c0a8',
                    endpoint: 'https://trainingchatbotluis.cognitiveservices.azure.com/'
                }
            const luisRecognizer = new Recognizer(luisConfig);
            const luisResult = await luisRecognizer.excuteLuisQuery(innerDc.context);
            console.log(luisResult, 'InCancelAndHelpDialog------------->');
            console.log(luisResult.intents,'scoooooooooooreeeeeeee');

            const text = innerDc.context.activity.text.toLowerCase();
            console.log(text);
            switch (text) {
            case 'help':
            case '?': {
                const helpMessageText = 'Show help here';
                await innerDc.context.sendActivity(helpMessageText, helpMessageText, InputHints.ExpectingInput);
                return { status: DialogTurnStatus.waiting };
            }
            case 'cancel':
            case 'quit': {
                const cancelMessageText = 'Cancelling...';
                await innerDc.context.sendActivity(cancelMessageText, cancelMessageText, InputHints.IgnoringInput);
                return await innerDc.cancelAllDialogs();
            }
            // case 'apply leave': {
            //     return await innerDc.beginDialog(applyLeaveDialog);
            // }
            // case 'payroll': {
            //     return await innerDc.beginDialog(payrollDialog);
            // }
            default: {
                // if(text === 'apply leave' || text === 'payroll') {
                //     console.log('Heloooo');
                //     return await innerDc.beginDialog(otherDialog,text);
                // }
                console.log(luisResult.text, 'yessssssssssssssssssssssssss')
                if(luisResult.text != 'Yes' || luisResult.text != 'No') {
                    if(LuisRecognizer.topIntent(luisResult) != 'None' ){
                        console.log(LuisRecognizer.topIntent(luisResult), '======luisresult is here');
                        const intent = LuisRecognizer.topIntent(luisResult);
                        return await innerDc.beginDialog(otherDialog, {intent: intent, luisResult: luisResult});
                        // return { status: DialogTurnStatus.waiting };
                    }
                }


                // if(LuisRecognizer.topIntent(luisResult) != 'None' ){
                //     console.log(LuisRecognizer.topIntent(luisResult), '======luisresult is here');
                //     const intent = LuisRecognizer.topIntent(luisResult);
                //     await innerDc.beginDialog(otherDialog, {intent: intent, luisResult: luisResult});
                //     return { status: DialogTurnStatus.waiting };
                // }
                   

                
                
            
            
        }}}
    }
}

module.exports.CancelAndHelpDialog = CancelAndHelpDialog;