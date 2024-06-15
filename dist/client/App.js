"use strict";
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
const react_1 = __importDefault(require("react"));
const react_2 = require("react");
const assemblyai_1 = require("assemblyai");
const use_debounce_1 = require("use-debounce");
const recordrtc_1 = __importDefault(require("recordrtc"));
require("./App.css");
const DEFAULT_TEXT = 'Tell me a joke about AI.';
function App() {
    const [audioSrc, setAudioSrc] = (0, react_2.useState)('');
    const [loading, setLoading] = (0, react_2.useState)(false);
    const audioRef = (0, react_2.useRef)(null);
    const realtimeTranscriber = (0, react_2.useRef)(null);
    const recorder = (0, react_2.useRef)(null);
    const [isRecording, setIsRecording] = (0, react_2.useState)(false);
    const [transcript, setTranscript] = (0, react_2.useState)('');
    const getToken = () => __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch('/api/aatoken');
        const data = yield response.json();
        if (data.error) {
            alert(data.error);
        }
        return data.token;
    });
    const debouncedTranscription = (0, use_debounce_1.useDebouncedCallback)(() => __awaiter(this, void 0, void 0, function* () {
        console.log("Sending text: ", transcript);
        yield endTranscription(null);
        sayPrompt(transcript);
    }), 1500);
    (0, react_2.useEffect)(() => {
        debouncedTranscription();
    }, [transcript]);
    const startTranscription = () => __awaiter(this, void 0, void 0, function* () {
        realtimeTranscriber.current = new assemblyai_1.RealtimeTranscriber({
            token: yield getToken(),
            sampleRate: 16000,
        });
        if (!realtimeTranscriber.current) {
            console.error("Failed to initialize the RealtimeTranscriber.");
            return; // Exit if not properly initialized
        }
        const texts = {};
        realtimeTranscriber.current.on('transcript', transcript => {
            let msg = '';
            texts[transcript.audio_start] = transcript.text;
            const keys = Object.keys(texts).map(Number);
            ;
            keys.sort((a, b) => a - b);
            for (const key of keys) {
                if (texts[key]) {
                    msg += ` ${texts[key]}`;
                    console.log(msg);
                }
            }
            setTranscript(msg);
        });
        realtimeTranscriber.current.on('error', event => {
            console.error(event);
            if (realtimeTranscriber.current) {
                realtimeTranscriber.current.close();
                realtimeTranscriber.current = null;
            }
        });
        realtimeTranscriber.current.on('close', (code, reason) => {
            console.log(`Connection closed: ${code} ${reason}`);
            realtimeTranscriber.current = null;
        });
        yield realtimeTranscriber.current.connect();
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then((stream) => {
            recorder.current = new recordrtc_1.default(stream, {
                type: 'audio',
                mimeType: 'audio/webm;codecs=pcm',
                recorderType: recordrtc_1.default.StereoAudioRecorder,
                timeSlice: 250,
                desiredSampRate: 16000,
                numberOfAudioChannels: 1,
                bufferSize: 4096,
                audioBitsPerSecond: 128000,
                ondataavailable: (blob) => __awaiter(this, void 0, void 0, function* () {
                    if (!realtimeTranscriber.current)
                        return;
                    const buffer = yield blob.arrayBuffer();
                    realtimeTranscriber.current.sendAudio(buffer);
                }),
            });
            recorder.current.startRecording();
        })
            .catch((err) => console.error(err));
        setIsRecording(true);
    });
    const endTranscription = (event) => __awaiter(this, void 0, void 0, function* () {
        event && event.preventDefault();
        setIsRecording(false);
        if (realtimeTranscriber && realtimeTranscriber.current) {
            yield realtimeTranscriber.current.close();
            realtimeTranscriber.current = null;
        }
        if (recorder && recorder.current) {
            recorder.current.pauseRecording();
            recorder.current = null;
        }
    });
    const sayPrompt = (prompt) => {
        if (!audioRef.current)
            return;
        const onError = (error) => {
            setLoading(false);
            console.error('Error loading audio');
            console.error(error);
        };
        const onAudioEnd = () => {
            console.log('Audio playback completed');
            setLoading(false);
            startTranscription();
        };
        try {
            const audioElement = audioRef.current;
            audioElement.pause();
            audioElement.currentTime = 0;
            const searchParams = new URLSearchParams();
            searchParams.set('prompt', prompt);
            setAudioSrc(`/say-prompt?${searchParams.toString()}`);
            setLoading(true);
            audioElement.load();
            const playAudio = () => {
                audioElement.play();
                setLoading(false);
            };
            audioElement.addEventListener('loadeddata', playAudio);
            audioElement.addEventListener('error', onError);
            audioElement.addEventListener('ended', onAudioEnd);
            return () => {
                audioElement.removeEventListener('loadeddata', playAudio);
                audioElement.removeEventListener('error', onError);
                audioElement.removeEventListener('ended', onAudioEnd);
            };
        }
        catch (error) {
            onError();
        }
    };
    return (react_1.default.createElement("div", { className: "App" },
        react_1.default.createElement("header", null,
            react_1.default.createElement("h1", { className: "header__title" }, "Real-Time Transcription"),
            react_1.default.createElement("p", { className: "header__sub-title" }, "Try AssemblyAI's new real-time transcription endpoint!")),
        react_1.default.createElement("div", { className: "real-time-interface" },
            react_1.default.createElement("p", { id: "real-time-title", className: "real-time-interface__title" }, "Click start to begin recording!"),
            isRecording ? (react_1.default.createElement("button", { className: "real-time-interface__button", onClick: endTranscription }, "Stop recording")) : (react_1.default.createElement("button", { className: "real-time-interface__button", onClick: startTranscription }, "Record"))),
        react_1.default.createElement("div", { className: "real-time-interface__message" }, transcript),
        react_1.default.createElement("p", null,
            react_1.default.createElement("audio", { className: "w-full", ref: audioRef, src: audioSrc, controls: true }))));
}
exports.default = App;
//# sourceMappingURL=App.js.map