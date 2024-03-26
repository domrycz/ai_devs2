export const callModeration = async (openAiKey, inputToCheck) => {
    try {
        const moderationResponse = await fetch('https://api.openai.com/v1/moderations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openAiKey}`
            },
            body: JSON.stringify({
                input: inputToCheck
            })
        });
        const moderationResult = await moderationResponse.json();

        if(!moderationResult.results) {
            throw new Error(`Error. Response: ${JSON.stringify(moderationResult)}`);
        }
        return moderationResult.results;

    } catch (error) {
        throw new Error(`Error calling moderation: ${error}`);
    }
}