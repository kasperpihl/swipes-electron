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
      if(buildOptions.platform === 'darwin'){
        console.log('Packaged App. Now creating DMG');
        var appdmg = require('appdmg');
        var ee = appdmg({
          source: './dmg/spec.json',
          target: 'dist/Swipes-darwin-x64/Swipes.dmg',
        });
        ee.on('progress', function (info) {
          if(info.title){
            console.log('[ ' + info.current + '/' + info.total + '] ' + info.title);
          }

          // info.current is the current step
          // info.total is the total number of steps
          // info.type is on of 'step-begin', 'step-end'

          // 'step-begin'
          // info.title is the title of the current step

          // 'step-end'
          // info.status is one of 'ok', 'skip', 'fail'

        });

        ee.on('finish', function () {
          console.log('ALL DONE');
          // There now is a `test.dmg` file
        });

        ee.on('error', function (err) {
          console.log('Error making DMG', err);
          // An error occurred
        });
      }
      else{
        console.log('ALL DONE');
      }

    })
  }

}
