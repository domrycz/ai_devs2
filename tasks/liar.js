import { fetchInfo, fetchToken, postAnswer } from '../utils/utils.js';

const info = fetchInfo();

const taskName = 'liar';
const apikey = info.apikey;
const url = info.url;

const question = 'What is the biggest planet in our solar system?';
const correctAnswer = 'Jupiter';

let accessToken;

fetchToken(url, taskName, apikey)
    .then(token => {
        if (token) {
            accessToken = token;
            return sendQuestion(url, token, question);
        }
    }).then(modelAnswer => {
        const answer = modelAnswer.includes(correctAnswer) ? 'YES' : 'NO';
        postAnswer(url, accessToken, answer);
    }).catch(error => {
        console.error(`Error: ${error}`);
    })


const sendQuestion = async (url, token) => {
    try {
        const response = await fetch(`${url}/task/${token}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `question=${encodeURIComponent(question)}`
        });
        const data = await response.json();

        if (data.code !== 0) throw new Error(data.msg);

        return data.answer;
    } catch (error) {
        console.error(`Error sending question: ${error}`);
    }
}