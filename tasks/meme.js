import { fetchToken, getTaskData, postAnswer, systemInfo } from '../utils/utils.js';

const taskName = 'meme';

let accessToken;

fetchToken(taskName)
    .then(token => {
        if (token) {
            accessToken = token;
            return getTaskData(accessToken);
        }
    })
    .then(taskData => {
        return renderImage(taskData.image, taskData.text);
    })
    .then(generatedImageUrl => {
        postAnswer(accessToken, generatedImageUrl);
    })
    .catch(error => {
        console.error(`# Error: ${error}`);
    })


const renderImage = async (baseImageUrl, text) => {
    const data = {
        template: 'cold-badgers-search-loudly-1561',
        data: {
            "text.text": text,
            "image.src": baseImageUrl
        }
    };

    let generatedMemeUrl;
    try {
        const response = await fetch('https://get.renderform.io/api/v2/render', {
            method: 'POST',
            headers: {
                'X-API-KEY': systemInfo.renderFormApiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        const responseData = await response.json();
        generatedMemeUrl = responseData.href;
    } catch (error) {
        throw new Error(`Error rendering image: ${error}`);
    }

    return generatedMemeUrl;
}