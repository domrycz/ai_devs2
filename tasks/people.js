import {fetchToken, getTaskData, postAnswer, systemInfo} from '../utils/utils.js';
import OpenAI from 'openai';

const taskName = 'people';

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
        return prepareAnswer(taskData);
    })
    .then(answer => {
        postAnswer(accessToken, answer);
    })
    .catch(error => {
        console.error(`# Error: ${error}`);
    })


const prepareAnswer = async (taskData) => {
    const database = await getData(taskData.data);
    const systemInstructionForFullName = 'Z podanego pytania zwróć tylko i wyłącznie imię i nazwisko osoby w mianowniku. ' +
        'Jeśli imię w pytaniu jest zdrobniałe, podaj pełne imię. np:\n Krysia = Krystyna \nJadzia = Jadwiga \nRomek = Roman';

    let fullName = await askModel(systemInstructionForFullName, taskData.question);
    fullName = fullName.replace('.','');
    const personData = database.get(fullName);

    if(!personData) {
        throw new Error(`Person ${fullName} not found in database`);
    }

    const systemInstructionForQuestion = 'Na podstawie podanego obiektu JSON zwróć odpowiedź na pytanie. \n' +
        `obiekt: ${JSON.stringify(personData)}`;
    return await askModel(systemInstructionForQuestion, taskData.question);
}

const getData = async (url) => {
    let database;
    try {
        const response = await fetch(url);
        const data = await response.json();
        database = prepareDatabase(data);
    } catch (error) {
        console.error(`Error fetching database: ${error}`);
    }
    return database;
}

const prepareDatabase = (data) => {
    const database = new Map();
    data.forEach(person => {
        database.set(`${person.imie} ${person.nazwisko}`, person);
    });
    return database;
}

const askModel = async (systemInstructions, question) => {
    let chatResponse;
    try {
        chatResponse = await openai.chat.completions.create({
            messages: [
                {role: "system", content: systemInstructions},
                {role: "user", content: question}
            ],
            model: "gpt-4",
        });
    } catch (error) {
        throw new Error(`Error asking Chat GPT ${question}: ${error}`);
    }
    return chatResponse.choices[0].message.content;
}