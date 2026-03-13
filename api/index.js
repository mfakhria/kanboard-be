const app = require('../dist/lambda');
module.exports = app.default || app;
