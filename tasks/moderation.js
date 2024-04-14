import {fetchToken, getTaskData, postAnswer, systemInfo} from '../utils/utils.js';
import { callModeration } from '../utils/open-ai-utils.js';

const taskName = 'moderation';

let accessToken;

fetchToken(taskName)
    .then(token => {
        if(token) {
            accessToken = token;
            return getTaskData(accessToken);
        }
    })
    .then(taskData => {
        const input = taskData.input;
        return callModeration(systemInfo.openAiKey, input);
    })
    .then(moderationResults => {
        const answer =  processModerationResultsArray(moderationResults);
        postAnswer(accessToken, answer);
    })
    .catch(error => {
        console.log(`Error: ${error}`);
    });

const processModerationResultsArray = (moderationResults) => {
    return moderationResults.map(result => {
        return result.flagged ? 1 : 0;
    });
}