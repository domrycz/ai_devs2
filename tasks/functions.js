import {fetchInfo, fetchToken, getTaskData, postAnswer} from '../utils/utils.js';

const info = fetchInfo();

const taskName = 'functions';

const apikey = info.apikey;
const url = info.url;

let accessToken;

fetchToken(url, taskName, apikey)
    .then(token => {
        if (token) {
            accessToken = token;
            return getTaskData(url, accessToken);
        }
    })
    .then(() => {
        postAnswer(url, accessToken, buildFunctionDefinition());
    })
    .catch(error => {
        console.error(`# Error: ${error}`);
    })


const buildFunctionDefinition = () => {
    const functionDefinition = new FunctionDefinition('addUser', 'Add User');
    functionDefinition.addProperty('name', 'string', 'User first name');
    functionDefinition.addProperty('surname', 'string', 'User last name');
    functionDefinition.addProperty('year', 'integer', 'Year of birth');
    return functionDefinition;
}

class FunctionDefinition {
    parameters = {
        type: 'object',
        properties: {}
    };
    constructor(name, description) {
        this.name = name;
        this.description = description;
    }

    addProperty(name, type, description) {
        this.parameters.properties[name] = {
            type: type,
            description: description
        }
    }
}