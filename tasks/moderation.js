const utils = require('../utils/utils');
const openAiUtils = require('../utils/open-ai-utils');

const info = utils.fetchInfo();

const taskName = 'moderation';

const apikey = info.apikey;
const url = info.url;
const openAiKey = info.openAiKey;

let accessToken;

utils.fetchToken(url, taskName, apikey)
    .then(token => {
        if(token) {
            accessToken = token;
            return utils.getTaskData(url, accessToken);
        }
    })
    .then(taskData => {
        const input = taskData.input;
        return openAiUtils.callModeration(openAiKey, input);
    })
    .then(moderationResults => {
        const answer =  processModerationResultsArray(moderationResults);
        utils.postAnswer(url, accessToken, answer);
    })
    .catch(error => {
        console.log(`Error: ${error}`);
    });

processModerationResultsArray = (moderationResults) => {
    return moderationResults.map(result => {
        return result.flagged ? 1 : 0;
    });
}