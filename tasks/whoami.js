import {fetchToken, getTaskData, postAnswer, systemInfo} from '../utils/utils.js';
import OpenAI from 'openai';

const taskName = 'whoami';

const openai = new OpenAI({apiKey: systemInfo.openAiKey});

let accessToken;

const findPerson = async () => {
    accessToken = await fetchToken(taskName);
    const personData = [];
    let taskData = await getTaskData(accessToken);
    personData.push(taskData.hint);

    let modelKnowsAnswer = false;
    let hintCalls = 0;

    while (!modelKnowsAnswer && hintCalls < 6) {
        const answer = await getAnswerFromModel(personData);
        if (answer !== 'Nie wiem.') {
            modelKnowsAnswer = true;
            return answer;
        } else {
            try {
                taskData = await getTaskData(accessToken);
                personData.push(taskData.hint);
            } catch (error) {
                console.log(`Error fetching hint: ${error}`)
            }

        }
        hintCalls++;
    }
    return null;
}

const getAnswerFromModel = async (context) => {
    const systemInstructions = 'Otrzymasz wskazówki na temat pewnej znanej osoby. Twoim zadaniem jest napisać kim jest ta osoba.' +
        ' Odpowiedź powinna być krótka i zwięzła - jeśli wiesz kto to jest, napisz tylko to. Jeśli nie wiesz lub nie jesteś pewien - odpowiedz tylko i wyłącznie "Nie wiem."';
    const userInstructions = `Podaj kim jest osoba na podstawie wskazówek: \n ${context.join('\n')}.`;
    let answer;
    try {
        const chatResponse = await openai.chat.completions.create({
            messages: [
                {role: "system", content: systemInstructions},
                {role: "user", content: userInstructions}
            ],
            model: "gpt-3.5-turbo",
        });
        answer = chatResponse.choices[0].message.content;
    } catch (error) {
        throw new Error(`Error calling OpenAI API: ${error}`);
    }
    return answer;
}

findPerson()
    .then(answer => {
        postAnswer(accessToken, answer);
    })
    .catch(error => {
        console.error(`# Error: ${error}`);
    })