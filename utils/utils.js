import fs from 'fs';

const readSystemInfoFromFile = () => {
    const infoFile = fs.readFileSync('data.json', 'utf8');
    console.log('### READ FILE ###');
    return JSON.parse(infoFile);
}

export const systemInfo = readSystemInfoFromFile();

export const fetchToken = async (taskName) => {
    const apikey = systemInfo.apikey;
    try {
        const response = await fetch(`${systemInfo.url}/token/${taskName}`, {
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

export const getTaskData = async (token) => {
    try {
        let response = await fetch(`${systemInfo.url}/task/${token}`);
        if(response.status === 429) {
            await sleep(10000);
            response = await fetch(`${systemInfo.url}/task/${token}`);
        }
        const data = await response.json();

        if (data.code !== 0) throw new Error(data.msg);

        console.log('Task data:', data);

        return data;
    } catch (error) {
        console.error(`Error fetching task data: ${error}`);
        throw error;
    }
}

export const postAnswer = async (token, answer) => {
    try {
        const response = await fetch(`${systemInfo.url}/answer/${token}`, {
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