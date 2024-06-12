"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const PORT = 3000;
app.use(express_1.default.static(path_1.default.join(__dirname, "public")));
app.get('/test', (req, res) => {
    return res.status(200).json('Hello World');
});
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
app.get("*", function (req, res) {
    res.sendFile(path_1.default.join(__dirname, "public", "index.html"));
});
app.listen(PORT, () => {
    return console.log(`Server is running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map