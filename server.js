const express = require('express');
const app = express();
const port = 3000;

// Placeholder for any middleware or routes you might have

function startServer() {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
  });
}

startServer();
