'use strict';

const argv = require('argv');
const packager = require('electron-packager');
const jsonfile = require('jsonfile');
const config = require('./config.json');

const origConfig = Object.assign({}, config);

argv.option([
  {
  	name: 'os',
  	type: 'string',
  	description: '(required) Which operationg system - osx, linux, windows',
  	example: "'node build.js --os=osx'"
  },
  {
  	name: 'env',
  	type: 'string',
  	description: 'Which environment - dev (default), production',
  	example: "'node build.js --env=dev'"
  },
]);

const args = argv.run();
const env = args.options.env || 'dev';
const os = args.options.os;

if (!os) {
  console.log('os option is required');
  process.exit(1);
}

if (env === 'staging') {
  config.appUrl = 'https://staging.swipesapp.com';
  config.env = 'staging';
  jsonfile.writeFileSync('./config.json', config, {spaces: 2});
}

if (env === 'production') {
  config.appUrl = 'https://dev.swipesapp.com';
  config.env = 'production';
  jsonfile.writeFileSync('./config.json', config, {spaces: 2});
}

const osOptions = {
  linux: {
    arch: 'all',
    dir: '.',
    platform: 'linux',
    name: 'Swipes Workspace',
    out: './builds'
  },
  windows: {
    arch: 'all',
    dir: '.',
    platform: 'win32',
    icon: './icons/logo.ico',
    name: 'Swipes Workspace',
    out: './builds'
  },
  osx: {
    arch: 'all',
    dir: '.',
    platform: 'darwin',
    icon: './icons/logo.icns',
    name: 'Swipes Workspace',
    out: './builds'
  }
}

const buildOptions = osOptions[os];

packager(buildOptions, function done_callback (err, appPaths) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  // Reset the config
  jsonfile.writeFileSync('./config.json', origConfig, {spaces: 2});
  console.log('ALL DONE');
})
