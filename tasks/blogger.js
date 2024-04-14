import {fetchToken, getTaskData, postAnswer, systemInfo} from '../utils/utils.js';
import OpenAI from "openai";

const taskName = 'blogger';

const openAiKey = systemInfo.openAiKey;

let accessToken;

fetchToken(taskName)
    .then(token => {
        if (token) {
            accessToken = token;
            return getTaskData(accessToken);
        }
    })
    .then(taskData => {
        const chaptersTitles = taskData.blog;
        return writeContent(chaptersTitles, openAiKey);
    })
    .then(arrayWithChapters => {
        postAnswer(accessToken, arrayWithChapters);
    })
    .catch(error => {
        console.error(`# Error: ${error}`);
    })

const writeContent = async (chaptersTitles, openAiKey) => {
    const systemInstructions = 'You are a polish food blogger specialized in Italian cuisine. You respond to given instructions only with blog posts in polish language without any additional content.';
    const userInstructions = `Create blog post which contains these chapters: ${chaptersTitles.join(', ')}. At the end of content of every chapter put three hash (#) signs. Do not do it at the end of the last chapter.`;

    const openai = new OpenAI({apiKey: openAiKey});
    let chatResponse;
    try {
        chatResponse = await openai.chat.completions.create({
            messages: [
                {role: "system", content: systemInstructions},
                {role: "user", content: userInstructions}
            ],
            model: "gpt-3.5-turbo",
        });
    } catch (error) {
        throw new Error(`Error calling Chat GPT: ${error}`);
    }
    const chatMessage = chatResponse.choices[0].message.content;

    return chatMessage.replace(/###$/, '').split('###');
}