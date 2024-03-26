import { fetchInfo, fetchToken, getTaskData, postAnswer } from '../utils/utils.js';
import { callModeration } from '../utils/open-ai-utils.js';

const info = fetchInfo();

const taskName = 'moderation';

const apikey = info.apikey;
const url = info.url;
const openAiKey = info.openAiKey;

let accessToken;

fetchToken(url, taskName, apikey)
    .then(token => {
        if(token) {
            accessToken = token;
            return getTaskData(url, accessToken);
        }
    })
    .then(taskData => {
        const input = taskData.input;
        return callModeration(openAiKey, input);
    })
    .then(moderationResults => {
        const answer =  processModerationResultsArray(moderationResults);
        postAnswer(url, accessToken, answer);
    })
    .catch(error => {
        console.log(`Error: ${error}`);
    });

const processModerationResultsArray = (moderationResults) => {
    return moderationResults.map(result => {
        return result.flagged ? 1 : 0;
    });
}