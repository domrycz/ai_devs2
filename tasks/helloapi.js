import { fetchToken, getTaskData, postAnswer } from '../utils/utils.js';

const taskName = 'helloapi';

let accessToken;

fetchToken(taskName)
    .then(token => {
        if(token) {
            accessToken = token;
            return getTaskData(accessToken);
        }
    })
    .then((data) => {
        const cookie = data.cookie;
        postAnswer(accessToken, cookie);
    })
    .catch(error => {
        console.log(`# Error: ${error}`);
    });