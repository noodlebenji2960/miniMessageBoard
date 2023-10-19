import express from 'express';
import { Readable } from 'stream';

var router = express.Router();

let messages = [];
const messageStream = new Readable({
  read() {}
});

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: "Mini Messageboard", messages: messages });
});

router.post('/', function (req, res, next) {
  const newMessage = {
    text: req.body.messageText,
    user: req.body.messageUser.charAt(0).toUpperCase() + req.body.messageUser.slice(1),
    added: new Date()
  };

  messages.push(newMessage);
  messageStream.push(`data: ${JSON.stringify(newMessage)}\n\n`);
  res.status(204).end();
});

router.get('/sse', function (req, res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Send initial data
  messages.forEach(message => {
    res.write(`data: ${JSON.stringify(message)}\n\n`);
  });

  function handleData(data) {
    res.write(data);
  }

  // Subscribe to messages and send updates to the client
  messageStream.on('data', handleData);

  // Handle client disconnect
  req.on('close', () => {
    // Clean up resources, if necessary
    // Also, remove the listener to prevent memory leaks
    messageStream.removeListener('data', handleData);
  });
});

export default router;