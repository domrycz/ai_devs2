import { fetchToken, getTaskData, postAnswer, systemInfo } from '../utils/utils.js';
import OpenAI from 'openai';
import {askOpenAIModel} from "../utils/open-ai-utils.js";
const openai = new OpenAI({apiKey: systemInfo.openAiKey});

const taskName = 'optimaldb';

let accessToken;

fetchToken(taskName)
    .then(token => {
        if (token) {
            accessToken = token;
            return getTaskData(accessToken);
        }
    })
    .then(taskData => {
        return getDatabase(taskData.database);
    })
    .then(database => {
        return optimizeDatabase(database);
    })
    .then(optimizedDatabase => {
        postAnswer(accessToken, JSON.stringify(optimizedDatabase));
    })
    .catch(error => {
        console.error(`# Error: ${error}`);
    })

const optimizeDatabase = async (rawDatabase) => {
    const optimizedDatabase = {};
    const systemPrompt = 'You will be given an array with strings which are information about one person. ' +
        'This array is to big for the User so you have to make it smaller without losing any important information. ' +
        'Try to reduce the number of characters by 70% and return only optimized array without any additional text or comments.';
    const zygfrydData = await askOpenAIModel(openai, 'gpt-4', systemPrompt, JSON.stringify(rawDatabase.zygfryd));
    optimizedDatabase.zygfryd = JSON.parse(zygfrydData);
    const stefanData = await askOpenAIModel(openai, 'gpt-4', systemPrompt, JSON.stringify(rawDatabase.stefan));
    optimizedDatabase.stefan = JSON.parse(stefanData);
    const aniaData = await askOpenAIModel(openai, 'gpt-4', systemPrompt, JSON.stringify(rawDatabase.ania));
    optimizedDatabase.ania = JSON.parse(aniaData);
    return optimizedDatabase;
}


const getDatabase = async (url) => {
    let rawDatabase;
    try {
        const response = await fetch(url);
        rawDatabase = await response.json();
    } catch (error) {
        throw new Error(`Error fetching database: ${error}`);
    }
    return rawDatabase;
}