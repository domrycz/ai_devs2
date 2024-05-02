import { fetchToken, getTaskData, postAnswer, systemInfo } from '../utils/utils.js';
import {askOpenAIModel} from '../utils/open-ai-utils.js';
import OpenAI from 'openai';

const taskName = 'tools';

const openai = new OpenAI({apiKey: systemInfo.openAiKey});

let accessToken;

fetchToken(taskName)
    .then(token => {
        if (token) {
            accessToken = token;
            return getTaskData(accessToken);
        }
    })
    .then(taskData => {
        return classifyTask(taskData.question);
    })
    .then(answer => {
        postAnswer(accessToken, answer);
    })
    .catch(error => {
        console.error(`# Error: ${error}`);
    })


const classifyTask = async (question) => {
    const today = new Date().toISOString().split('T')[0];
    const systemPrompt = 'For given task classify it using structure ' +
        '{"tool":"name of tool here", "desc":"task content", "date":"date only for Calendar tasks in format YYYY-MM-DD"} from examples as one of the following: \n' +
        '###1. Tasks ToDo - if it is a task that needs to be done without any particular date. Example input: "Przypomnij mi że muszę iść do fryzjera" Example output: {"tool":"ToDo","desc":"Idź do fryzjera" }' +
        '2. Calendar tasks - if it is a task that needs to be done on a specific date. Example input: "Przypomnij mi żeby kupić prezent na urodziny mamy 20 maja" Example output: {"tool":"Calendar","desc":"Kup prezent na urodziny mamy","date":"2024-05-20"}\n' +
        `Remember that Today is ${today}###`;

    const modelAnswer = await askOpenAIModel(openai, 'gpt-4', systemPrompt, question);
    return JSON.parse(modelAnswer);
}