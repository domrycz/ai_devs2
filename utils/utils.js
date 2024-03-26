import fs from 'fs';

export const fetchInfo = () => {
    const data = fs.readFileSync('data.json', 'utf8');
    return JSON.parse(data);
}

export const fetchToken = async (url, taskName, apikey) => {
    try {
        const response = await fetch(`${url}/token/${taskName}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apikey })
        });
        const data = await response.json();

        if (data.code !== 0) throw new Error(data.msg);

        return data.token;
    } catch (error) {
        throw new Error(`Error fetching token: ${error}`);
    }
}

export const getTaskData = async (url, token) => {
    try {
        const response = await fetch(`${url}/task/${token}`);
        const data = await response.json();

        if (data.code !== 0) throw new Error(data.msg);

        console.log('Task data:', data);

        return data;
    } catch (error) {
        console.error(`Error fetching task data: ${error}`);
    }
}

export const postAnswer = async (url, token, answer) => {
    try {
        const response = await fetch(`${url}/answer/${token}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ answer: answer })
        });
        const data = await response.json();

        if (data.code !== 0) throw new Error(data.msg);

        console.log(`### Final result: ${data.msg}`);
    } catch (error) {
        console.error(`Error posting task answer: ${error}`);
    }
}