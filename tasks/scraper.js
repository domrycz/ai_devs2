import {fetchToken, getTaskData, postAnswer, systemInfo} from '../utils/utils.js';
import OpenAI from 'openai';

const taskName = 'scraper';

const openai = new OpenAI({apiKey: systemInfo.openAiKey});

let accessToken;
let question;

fetchToken(taskName)
    .then(token => {
        if (token) {
            accessToken = token;
            return getTaskData(accessToken);
        }
    })
    .then(taskData => {
        question = taskData.question;
        return fetchText(taskData.input);
    })
    .then(text => {
        return getAnswerFromModel(text, question);
    })
    .then(answer => {
        postAnswer(accessToken, answer);
    })
    .catch(error => {
        console.error(`# Error: ${error}`);
    })

const fetchText = async (url) => {
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36';
    const maxRetries = 5;
    let retries = 0;
    let success = false;
    let text;
    while (retries < maxRetries && !success) {
        const response = await fetch(url, {
            headers: {
                'User-Agent': userAgent
            }
        });
        if(response.status === 200) {
            success = true;
            text = await response.text();
        } else {
            console.error('Error fetching text:', response.status, response.statusText);
        }
        retries++;
    }

    return text;
}

const getAnswerFromModel = async (context, question) => {
    const systemInstructions = `Answer concisely questions based on the given context. Do not add any additional information.
    context: ### \n${context}\n###`;
    let modelAnswer;
    try {
        const chatResponse = await openai.chat.completions.create({
            messages: [
                {role: "system", content: systemInstructions},
                {role: "user", content: question}
            ],
            model: "gpt-3.5-turbo",
        });
        modelAnswer = chatResponse.choices[0].message.content;
    } catch (error) {
        throw new Error(`Error calling LLM to get an answer: ${error}`);
    }
    return modelAnswer;
}