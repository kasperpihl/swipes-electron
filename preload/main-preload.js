const config = require('../config.json');

config.env = config.env || 'dev';
window.electronConfig = config;
