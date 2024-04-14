import { fetchToken, getTaskData, postAnswer, systemInfo } from '../utils/utils.js';
import OpenAI from 'openai';

const taskName = 'inprompt';

const openai = new OpenAI({apiKey: systemInfo.openAiKey});

let accessToken;
let inputFromTask;
let question;

fetchToken(taskName)
    .then(token => {
        if (token) {
            accessToken = token;
            return getTaskData(accessToken);
        }
    })
    .then(taskData => {
        inputFromTask = taskData.input;
        question = taskData.question;
        return getName(question);
    })
    .then(name => {
        const context = inputFromTask.filter(sentence => sentence.includes(name));
        return getAnswerFromModel(context, question);
    })
    .then(modelAnswer => {
        postAnswer(accessToken, modelAnswer);
    })
    .catch(error => {
        console.error(`# Error: ${error}`);
    })

const getName = async (question) => {
    const systemInstructions = 'Return only and exclusively one word, without any comments and this word should be valid name from the given polish sentence.';
    const userInstructions = question;
    let name;
    try {
        const chatResponse = await openai.chat.completions.create({
            messages: [
                {role: "system", content: systemInstructions},
                {role: "user", content: userInstructions}
            ],
            model: "gpt-3.5-turbo",
        });
        name = chatResponse.choices[0].message.content.replace('.', '');
        if(!containsOnlyLetters(name)) {
            throw new Error(`Name is not valid: ${name}`);
        }
    } catch (error) {
        throw new Error(`Error calling LLM to get name: ${error}`);
    }
    return name;
}

const getAnswerFromModel = async (context, question) => {
    const systemInstructions = `Answer questions based on the given context. Do not add any additional information.
    context: ### \n${context.join('\n')}\n###`;
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

const containsOnlyLetters = (inputString) => {
    return /^[a-zA-Z]*$/.test(inputString);
}