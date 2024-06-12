"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const PlayHT = __importStar(require("playht"));
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const streamGptText_js_1 = require("./streamGptText.js");
dotenv_1.default.config();
const PORT = process.env.PORT || 3000;
PlayHT.init({
    apiKey: process.env.PLAYHT_API_KEY ||
        (function () {
            throw new Error('PLAYHT_API_KEY not found in .env file. Please read .env.example to see how to create it.');
        })(),
    userId: process.env.PLAYHT_USER_ID ||
        (function () {
            throw new Error('PLAYHT_USER_ID not found in .env file. Please read .env.example to see how to create it.');
        })(),
});
app.use(express_1.default.static(path_1.default.join(__dirname, "../client")));
app.get('/test', (req, res) => {
    return res.status(200).json('Hello World');
});
app.get('/say-prompt', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { prompt } = req.query;
        if (!prompt || typeof prompt !== 'string') {
            res.status(400).send('ChatGPT prompt not provided in the request');
            return next();
        }
        res.setHeader('Content-Type', 'audio/mpeg');
        // Create a text stream from ChatGPT responses
        const gptStream = yield (0, streamGptText_js_1.streamGptText)(prompt);
        // Generate a stream with PlayHT's API
        const stream = yield PlayHT.stream(gptStream, {
            voiceEngine: 'PlayHT2.0-turbo',
            voiceId: 's3://peregrine-voices/oliver_narrative2_parrot_saad/manifest.json',
        });
        stream.pipe(res);
    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
}));
const errorHandler = (err, req, res, next) => {
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
    res.sendFile(path_1.default.join(__dirname, '../client', 'index.html'));
});
app.listen(PORT, () => {
    return console.log(`Server is running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map