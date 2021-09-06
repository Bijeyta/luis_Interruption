const { LuisRecognizer } = require('botbuilder-ai');

class Recognizer {
    constructor(config) {
        const luisIsConfigured = config && config.applicationId && config.endpointKey && config.endpoint;
        if (luisIsConfigured) {

            const recognizerOptions = {
                apiVersion: 'v3'
            };

            this.recognizer = new LuisRecognizer(config, recognizerOptions);
        } 
    }
    get isConfigured() {
        return (this.recognizer !== undefined);
    }

    async excuteLuisQuery(context) {
        // console.log('hello')
        return await this.recognizer.recognize(context)
    }

    getFromEntities(result) {
        let date, NoOfDays, leaveType, serviceType, month
        // console.log(result, 'result');
        console.log(result.entities.$instance.datetime[0].text, "Hii")

        if(result.entities.$instance.datetime[1]) {
            if(result.entities.$instance.datetime[0].type == 'builtin.datetimeV2.duration') {
                NoOfDays = result.entities.$instance.datetime[0].text;
                console.log(result.entities.$instance.datetime[0].text, 'NoOfDays')
            }
         
            if(result.entities.$instance.datetime[1].type == 'builtin.datetimeV2.date') {
                // console.log(result.entities.$instance.datetime, 'uidgllllllllllllllll')
                date = result.entities.$instance.datetime[1].text
                console.log(result.entities.$instance.datetime[1].text, 'Date')
            }
    
            if(result.entities.$instance.datetime[1].type == 'builtin.datetimeV2.daterange') {
                NoOfDays = result.entities.$instance.datetime[0].text
            }
        }
        // console.log(result.entities.$instance.leaveType[0], 'leaveType')

        if(result.entities.$instance.leaveType) {
            console.log(result.entities.$instance.leaveType[0].text, 'leaveType')
            leaveType = result.entities.$instance.leaveType[0].text
            console.log(leaveType, ']]]]]]]]]]]]]')
            
        }

        if(result.entities.$instance.serviceType) {
            console.log(result.entities.$instance.serviceType[0].text, 'service text')
            serviceType = result.entities.$instance.serviceType[0].text
        }

        if(result.entities.$instance.datetime) {
            console.log(result.entities.$instance.datetime[0].text, 'service month')
            month = result.entities.$instance.datetime[0].text; 
        }
        return { leaveType: leaveType, date: date, NoOfDays: NoOfDays, serviceType: serviceType, month: month }
    }

}

module.exports.Recognizer = Recognizer;