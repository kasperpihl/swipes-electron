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
  }
]);

const args = argv.run();
const os = args.options.os || args.targets[0];
if(!os){
  console.log('please add os as parameter');
  console.log('npm run build mac [windows, mac, linux]');
}
else {
  if (process.env.NODE_ENV === 'production') {
    config.appUrl = 'https://staging.swipesapp.com';
    config.env = 'production';
    jsonfile.writeFileSync('./config.json', config, {spaces: 2});
  }
  const defOptions = {
    arch: 'all',
    dir: '.',
    overwrite: true,
    name: 'Swipes',
    out: './dist'
  };
  const osOptions = {
    linux: Object.assign({
      platform: 'linux'
    }, defOptions),
    windows: Object.assign({
      platform: 'win32',
      icon: './icons/logo.ico'
    }, defOptions),
    osx: Object.assign({
      platform: 'darwin',
      'app-version': '0.0.4',
      'app-bundle-id': 'com.swipesapp.Swipes',
      icon: './icons/logo.icns'
    }, defOptions)
  }
  osOptions.win = osOptions.windows;
  osOptions.mac = osOptions.darwin = osOptions.osx;

  const buildOptions = osOptions[os];
  if (!buildOptions) {
    console.log('unknown os. Supported: [mac, osx, darwin, win, windows, linux]');
  }
  else {
    packager(buildOptions, function done_callback (err, appPaths) {
      // Reset the config
      jsonfile.writeFileSync('./config.json', origConfig, {spaces: 2});

      if (err) {
        console.log(err);
        process.exit(1);
      }
      if (buildOptions.platform === 'darwin') {
        console.log('Packaged App. Now creating DMG');
        const sign = require('electron-osx-sign');

        sign({
          app: 'dist/Swipes-darwin-x64/Swipes.app'
        }, function done (err) {
          console.log('signing', err || 'no errors');
          if (err) {
            // Handle the error
            return;
          }
          // Application signed
          const flat = require('electron-osx-sign').flat;

          flat({
            pkg: 'dist/Swipes-darwin-x64/SwipesInstaller.pkg',
            app: 'dist/Swipes-darwin-x64/Swipes.app'
          }, function done (err) {
            console.log('create installer', err || 'no errors');
            if(!err){
              console.log('ALL DONE');
            }
          })
        })
      }
      if (buildOptions.platform === 'win32') {
        console.log('Packaged App. Now creating windiows installer');
        const electronInstaller = require('electron-winstaller');
        const options = {
          appDirectory: 'dist/Swipes-win32-x64/',
          outputDirectory: 'builds/installers/',
          authors: 'Swipes Inc.',
          exe: 'Swipes.exe'
        }

        resultPromise = electronInstaller.createWindowsInstaller(options)
          .then(() => {
            console.log('Successfully created package at ' + options.outputDirectory);
          }, (err) => {
            if (err) {
              console.error(err, err.stack);
              process.exit(1);
            }
          });
      } else {
        console.log('ALL DONE');
      }
    })
  }
}
