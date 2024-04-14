import {fetchToken, postAnswer, systemInfo} from '../utils/utils.js';
import OpenAI from "openai";

const taskName = 'embedding';
const sentenceToProcess = 'Hawaiian pizza';

const openai = new OpenAI({apiKey: systemInfo.openAiKey});

let accessToken;

fetchToken(taskName)
    .then(token => {
        if (token) {
            accessToken = token;
            return getEmbedding(sentenceToProcess);
        }
    })
    .then(embedding => {
        postAnswer(accessToken, embedding);
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