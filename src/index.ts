import {resolve} from 'path';
import {config} from 'dotenv';
import {Octokit} from '@octokit/rest';
import {Configuration, OpenAIApi} from 'openai';

/**
 * get environment variable
 */
config({path: resolve(__dirname, '../.env')});

(async () => {
    // config openai
    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);

    // get a response
    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: "Give me a random quote",
        temperature: 0.6,
        max_tokens: 150,
        top_p: 1,
        frequency_penalty: 1,
        presence_penalty: 1,
    });

    const quote = response.data.choices[0].text;

    // write into gist
    const octokit = new Octokit({auth: `token ${process.env.GH_TOKEN}`});
    const gist = await octokit.gists.get({
        gist_id: process.env.GIST_ID
    }).catch(error => console.error(`Unable to update gist\n${error}`));
    if (!gist) return;

    const filename = Object.keys(gist.data.files)[0];
    await octokit.gists.update({
        gist_id: process.env.GIST_ID,
        files: {
            [filename]: {
                filename: "today's quote",
                content: quote,
            },
        },
    });
})();