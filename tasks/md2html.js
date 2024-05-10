import { fetchToken, getTaskData, postAnswer, systemInfo } from '../utils/utils.js';
import OpenAI from 'openai';
import {askOpenAIModel} from "../utils/open-ai-utils.js";
const openai = new OpenAI({apiKey: systemInfo.openAiKey});

const taskName = 'md2html';

let accessToken;

fetchToken(taskName)
    .then(token => {
        if (token) {
            accessToken = token;
            return getTaskData(accessToken);
        }
    })
    .then(taskData => {
        return convertMdToHtml(taskData.input);
    })
    .then(htmlData => {
       postAnswer(accessToken, htmlData);
    })
    .catch(error => {
        console.error(`# Error: ${error}`);
    })

const convertMdToHtml = async (text) => {
    const systemPrompt  = 'tryb md2html';
    return await askOpenAIModel(openai, 'ft:gpt-3.5-turbo-0125:personal:c05l04v2:9NJDF7pl', systemPrompt, text);
}