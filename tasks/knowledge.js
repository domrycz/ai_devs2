import {fetchToken, getTaskData, postAnswer, systemInfo} from '../utils/utils.js';
import OpenAI from 'openai';

const taskName = 'knowledge';

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
        return handleQuestion(taskData.question);
    })
    .then(answer => {
        postAnswer(accessToken, answer);
    })
    .catch(error => {
        console.error(`# Error: ${error}`);
    })


const handleQuestion = async (question) => {
    const systemInstructions = 'Dostaniesz pytanie na które  odpowiesz obiektem JSON według wzoru:\n' +
        '1. Jeśli pytanie jest o populację kraju: {\"population":"<nazwa kraju w języku angielskim>"}\n' +
        '2. Jeśli pytanie jest o kurs waluty {"currency":"<kod waluty>"}\n' +
        '3. Jeśli nie jest to nic z powyższych: {"answer":"<odpowiedź na pytanie w jednym zdaniu>"}';
    let classificationAnswer = await askModel(systemInstructions, question);
    classificationAnswer = JSON.parse(classificationAnswer);

    if(classificationAnswer.population) {
        const country = classificationAnswer.population;
        const countryData = await fetchCountryData(country);
        return countryData[0].population;
    } else if (classificationAnswer.currency) {
        const currencyCode = classificationAnswer.currency;
        const currencyData = await fetchCurrencyData(currencyCode);
        return currencyData.rates[0].mid;
    } else if (classificationAnswer.answer) {
        return classificationAnswer.answer;
    } else {
        throw new Error(`Invalid classification: ${classificationAnswer}`);
    }
}

const fetchCountryData = async (country) => {
    let countryData;
    try {
        const response = await fetch(`https://restcountries.com/v3.1/name/${country}`);
        countryData = await response.json();
    } catch (error) {
        console.error(`Error fetching country data: ${error}`);
    }
    return countryData;
}

const fetchCurrencyData = async (currencyCode) => {
    let currencyData;
    try {
        const response = await fetch(`https://api.nbp.pl/api/exchangerates/rates/A/${currencyCode}?format=json`);
        currencyData = await response.json();
    } catch (error) {
        console.error(`Error fetching country data: ${error}`);
    }
    return currencyData;
}

const askModel = async (systemInstructions, question) => {
    let chatResponse;
    try {
        chatResponse = await openai.chat.completions.create({
            messages: [
                {role: "system", content: systemInstructions},
                {role: "user", content: question}
            ],
            model: "gpt-3.5-turbo",
        });
    } catch (error) {
        throw new Error(`Error asking Chat GPT ${question}: ${error}`);
    }
    return chatResponse.choices[0].message.content;
}