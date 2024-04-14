import {fetchToken, getTaskData, postAnswer, systemInfo} from '../utils/utils.js';
import OpenAI from 'openai';
import { writeFile } from 'node:fs/promises'
import { Readable } from 'node:stream'
import fs from 'fs';

const taskName = 'whisper';


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
        return getAudioFile(taskData.msg);
    })
    .then(() => {
        return sendFileToWhisper('audio.mp3');
    })
    .then(transcription => {
        postAnswer(accessToken, transcription);
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