import express, { ErrorRequestHandler } from 'express';
import path from 'path';
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

app.get('/test', (req, res) => {
  return res.status(200).json('Hello World');
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


app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  return console.log(`Server is running on port ${PORT}`);
});
