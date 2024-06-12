"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_2 = require("react");
require("./App.css");
const PlayhtLogo_1 = require("./components/PlayhtLogo");
const Spinner_1 = require("./components/Spinner");
const DEFAULT_TEXT = 'Tell me a joke about AI.';
function App() {
    const [audioSrc, setAudioSrc] = (0, react_2.useState)('');
    const [prompt, setPrompt] = (0, react_2.useState)(DEFAULT_TEXT);
    const [loading, setLoading] = (0, react_2.useState)(false);
    const audioRef = (0, react_2.useRef)(null);
    const sayPrompt = () => {
        if (!audioRef.current)
            return;
        const onError = () => {
            setLoading(false);
            console.error('Error loading audio');
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
            return () => {
                audioElement.removeEventListener('loadeddata', playAudio);
                audioElement.removeEventListener('error', onError);
            };
        }
        catch (error) {
            onError();
        }
    };
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(PlayhtLogo_1.PlayhtLogo, null),
        react_1.default.createElement("h1", { className: "pb-8 max-sm:text-2xl font-bold" }, "PlayHT SDK ChatGPT Example"),
        react_1.default.createElement("div", { className: "font-bold text-lg pb-4" }, "Enter prompt for ChatGPT"),
        react_1.default.createElement("textarea", { className: "w-full h-32 bg-inherit resize-none border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg", value: prompt, onChange: (e) => setPrompt(e.target.value) }),
        react_1.default.createElement("button", { className: "disabled:text-neutral-500 mt-6 mb-8 py-4 px-8 bg-green-600 text-white font-bold text-xl enabled:hover:bg-green-400 transition-all", onClick: sayPrompt, disabled: loading || !prompt || prompt.length === 0 },
            react_1.default.createElement("div", { className: "inline-flex h-full w-full items-center justify-center" },
                loading && react_1.default.createElement(Spinner_1.Spinner, null),
                " ",
                react_1.default.createElement("span", { className: "bold" }, "Speak"))),
        react_1.default.createElement("p", null,
            react_1.default.createElement("audio", { className: "w-full", ref: audioRef, src: audioSrc, controls: true }))));
}
exports.default = App;
//# sourceMappingURL=App.js.map