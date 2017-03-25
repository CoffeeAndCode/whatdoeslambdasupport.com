const { handler } = require('./app/index');

require('dotenv').config();

process.env.OUTPUT_TO_FOLDER = 'dist';
handler({}, {}, (error, response) => {
  if (error) { console.error(error); return; }
  console.log(response);
});
