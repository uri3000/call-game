import * as PlayHT from 'playht';
import express, { ErrorRequestHandler } from 'express';
import dotenv from 'dotenv';
import path from 'path';
const app = express();
import { streamGptText } from './streamGptText.js';
dotenv.config();

const PORT = process.env.PORT || 3000;

PlayHT.init({
  apiKey:
    process.env.PLAYHT_API_KEY ||
    (function () {
      throw new Error('PLAYHT_API_KEY not found in .env file. Please read .env.example to see how to create it.');
    })(),
  userId:
    process.env.PLAYHT_USER_ID ||
    (function () {
      throw new Error('PLAYHT_USER_ID not found in .env file. Please read .env.example to see how to create it.');
    })(),
});

app.use(express.static(path.join(__dirname, "../client")));

app.get('/test', (req, res) => {
  return res.status(200).json('Hello World');
});

app.get('/say-prompt', async (req, res, next) => {
  try {
    const { prompt } = req.query;

    if (!prompt || typeof prompt !== 'string') {
      res.status(400).send('ChatGPT prompt not provided in the request');
      return next();
    }

    res.setHeader('Content-Type', 'audio/mpeg');

    // Create a text stream from ChatGPT responses
    const gptStream = await streamGptText(prompt);
    // Generate a stream with PlayHT's API
    const stream = await PlayHT.stream(gptStream, {
      voiceEngine: 'PlayHT2.0-turbo',
      voiceId: 's3://peregrine-voices/oliver_narrative2_parrot_saad/manifest.json',
    });
    stream.pipe(res);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  const defaultError = {
    log: 'Uncaught Express middleware error has occured',
    status: 500,
    message: 'An unknown error has occurred'
  };
  const errorObj = Object.assign({}, defaultError, err);

  console.log(errorObj.log);
  return res.status(errorObj.status).json(errorObj.message);
};

app.use(errorHandler);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client', 'index.html'));
});

app.listen(PORT, () => {
  return console.log(`Server is running on port ${PORT}`);
});
