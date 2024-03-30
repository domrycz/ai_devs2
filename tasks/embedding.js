import { fetchInfo, fetchToken, postAnswer } from '../utils/utils.js';
import OpenAI from "openai";

const info = fetchInfo();

const taskName = 'embedding';
const sentenceToProcess = 'Hawaiian pizza';

const apikey = info.apikey;
const url = info.url;

const openai = new OpenAI({apiKey: info.openAiKey});

let accessToken;

fetchToken(url, taskName, apikey)
    .then(token => {
        if (token) {
            accessToken = token;
            return getEmbedding(sentenceToProcess);
        }
    })
    .then(embedding => {
        postAnswer(url, accessToken, embedding);
    })
    .catch(error => {
        console.error(`# Error: ${error}`);
    })

const getEmbedding = async (sentenceToProcess) => {
    let embedding;
    try {
        const embeddingResponse = await openai.embeddings.create({
           input: sentenceToProcess,
           model: "text-embedding-ada-002"
        });
        embedding = embeddingResponse.data[0].embedding;
    } catch (error) {
        console.error(`Error fetching embedding: ${error}`);
    }
    return embedding;
}