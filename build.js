'use strict';

const argv = require('argv');
const packager = require('electron-packager');
const debianInstaller = require('electron-installer-debian')
const version = require('./package.json').version;
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
let name = 'Swipes';
let bundleId = 'com.swipesapp.mac';
const args = argv.run();
const os = args.options.os || args.targets[0];
if (!os) {
  console.log('please add os as parameter');
  console.log('npm run build mac [windows, mac, linux]');
}
else {
  if (process.env.NODE_ENV === 'staging') {
    config.appUrl = 'https://staging.swipesapp.com';
    config.env = 'staging';
    name += 'Staging';
    bundleId += 'staging';
    jsonfile.writeFileSync('./config.json', config, { spaces: 2 });
  }
  if (process.env.NODE_ENV === 'production') {
    config.appUrl = 'https://workspace.swipesapp.com';
    config.env = 'production';
    jsonfile.writeFileSync('./config.json', config, { spaces: 2 });
  }
  const defOptions = {
    arch: 'all',
    dir: '.',
    overwrite: true,
    name,
    out: './dist'
  };
  const osOptions = {
    linux: Object.assign({}, defOptions, {
      platform: 'linux',
      arch: 'x64'
    }),
    windows: Object.assign({}, defOptions, {
      platform: 'win32',
      icon: './icons/logo.ico',
      arch: 'ia32'
    }),
    osx: Object.assign({}, defOptions, {
      platform: 'darwin',
      'appVersion': version,
      'appBundleId': bundleId,
      icon: './icons/logo.icns'
    })
  }
  osOptions.win = osOptions.win32 = osOptions.windows;
  osOptions.mac = osOptions.darwin = osOptions.osx;

  const buildOptions = osOptions[os];
  if (!buildOptions) {
    console.log('unknown os. Supported: [mac, osx, darwin, win, win32, windows, linux]');
  }
  else {
    packager(buildOptions, function done_callback(err, appPaths) {
      // Reset the config
      jsonfile.writeFileSync('./config.json', origConfig, { spaces: 2 });

      if (err) {
        console.log(err);
        process.exit(1);
      }
      console.log(buildOptions);
      if (buildOptions.platform === 'darwin') {
        console.log('Packaged App. Signing..');
        const sign = require('electron-osx-sign');

        sign({
          app: 'dist/' + name + '-darwin-x64/' + name + '.app'
        }, function done(err) {

          if (err) {
            console.log('Error signing', err);
            // Handle the error
            return;
          }
          console.log('Signed App. Creating installer..');
          // Application signed
          const flat = require('electron-osx-sign').flat;
          flat({
            pkg: 'dist/' + name + '-darwin-x64/' + name + 'Installer.pkg',
            app: 'dist/' + name + '-darwin-x64/' + name + '.app'
          }, function done(err) {
            if (!err) {
              console.log('ALL DONE');
            } else {
              console.log('Error creating installer', err);
            }
          })

        })
      } else if (buildOptions.platform === 'win32') {
        console.log('Packaged App. Now creating windiows installer');
        const electronInstaller = require('electron-winstaller');
        const options = {
          appDirectory: 'dist/' + name + '-win32-x64/',
          outputDirectory: 'builds/installers/',
          authors: 'Swipes Incorporated',
          exe: `${name} (${version}).exe`;
        }

        const resultPromise = electronInstaller.createWindowsInstaller(options)
          .then(() => {
            console.log('Successfully created package at ' + options.outputDirectory);
          }, (err) => {
            if (err) {
              console.error(err, err.stack);
              process.exit(1);
            }
          });
      } else if(buildOptions.platform === 'linux') {

        var debOptions = {
          src: 'dist/' + name + '-linux-x64/',
          dest: 'dist/installers/',
          arch: 'amd64'
        }

        console.log('Creating package (this may take a while)')

        debianInstaller(debOptions, function (err) {
          if (err) {
            console.error(err, err.stack)
            process.exit(1)
          }

          console.log('Successfully created package at ' + debOptions.dest)
        })
      }
      else {
        console.log('ALL DONE');
      }
    })
  }
}
