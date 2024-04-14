import { fetchToken, postAnswer, systemInfo } from '../utils/utils.js';

const taskName = 'liar';

const question = 'What is the biggest planet in our solar system?';
const correctAnswer = 'Jupiter';

let accessToken;

fetchToken(taskName)
    .then(token => {
        if (token) {
            accessToken = token;
            return sendQuestion(token);
        }
    }).then(modelAnswer => {
        const answer = modelAnswer.includes(correctAnswer) ? 'YES' : 'NO';
        postAnswer(accessToken, answer);
    }).catch(error => {
        console.error(`Error: ${error}`);
    })


const sendQuestion = async (token) => {
    try {
        const response = await fetch(`${systemInfo.url}/task/${token}`, {
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