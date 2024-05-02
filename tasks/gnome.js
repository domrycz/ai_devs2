import { fetchToken, getTaskData, postAnswer, systemInfo } from '../utils/utils.js';
import OpenAI from 'openai';

const taskName = 'gnome';

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
        return askGPTVision(taskData.url);
    })
    .then(answer => {
        postAnswer(accessToken, answer);
    })
    .catch(error => {
        console.error(`# Error: ${error}`);
    })


const askGPTVision = async (url) => {
    let chatResponse;
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: [
                {   role: "user",
                    content: [
                        { type: "text", text: "If there is a gnome on a given picture tell me what is the colour of his hat in Polish, otherwise return only word 'ERROR'" },
                        { type: "image_url", image_url: { "url": url } },
                    ],
                },
            ],
        });
        chatResponse = response.choices[0].message.content;
    } catch (error) {
        throw new Error(`Error calling GPT 4 Vision: ${error}`);
    }
    return chatResponse ?? 'ERROR';
}