import {fetchInfo, fetchToken, getTaskData, postAnswer} from '../utils/utils.js';
import OpenAI from 'openai';
import { writeFile } from 'node:fs/promises'
import { Readable } from 'node:stream'
import fs from 'fs';

const info = fetchInfo();

const taskName = 'whisper';

const apikey = info.apikey;
const url = info.url;

const openai = new OpenAI({apiKey: info.openAiKey});

let accessToken;

fetchToken(url, taskName, apikey)
    .then(token => {
        if (token) {
            accessToken = token;
            return getTaskData(url, accessToken);
        }
    })
    .then(taskData => {
        return getAudioFile(taskData.msg);
    })
    .then(() => {
        return sendFileToWhisper('audio.mp3');
    })
    .then(transcription => {
        postAnswer(url, accessToken, transcription);
    })
    .catch(error => {
        console.error(`# Error: ${error}`);
    })

const sendFileToWhisper = async (filePath) => {
    let transcription;
    try {
        const whisperResponse = await openai.audio.transcriptions.create({
            file: fs.createReadStream(filePath),
            model: "whisper-1"
        });
        transcription = whisperResponse.text;
    } catch (error) {
        console.error(`Error sending file to Whisper: ${error}`);
    }
    return transcription;
}

const getAudioFile = async (message) => {
    const splittedMessage = message.split(' ');
    const url = splittedMessage[splittedMessage.length - 1];

    const response = await fetch(url);
    const body = Readable.fromWeb(response.body);
    return writeFile('audio.mp3', body);
}