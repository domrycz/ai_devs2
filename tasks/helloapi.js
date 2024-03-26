import { fetchInfo, fetchToken, getTaskData, postAnswer } from '../utils/utils.js';

const info = fetchInfo();

const taskName = 'helloapi';

const apikey = info.apikey;
const url = info.url;

let accessToken;


fetchToken(url, taskName, apikey)
    .then(token => {
        if(token) {
            accessToken = token;
            return getTaskData(url, accessToken);
        }
    })
    .then((data) => {
        const cookie = data.cookie;
        postAnswer(url, accessToken, cookie);
    })
    .catch(error => {
        console.log(`Error: ${error}`);
    });