const utils = require('../utils/utils');

const info = utils.fetchInfo();

const taskName = 'helloapi';

const apikey = info.apikey;
const url = info.url;

let accessToken;


utils.fetchToken(url, taskName, apikey)
    .then(token => {
        if(token) {
            accessToken = token;
            return utils.getTaskData(url, accessToken);
        }
    })
    .then((data) => {
        const cookie = data.cookie;
        utils.postAnswer(url, accessToken, cookie);
    })
    .catch(error => {
        console.log(`Error: ${error}`);
    });