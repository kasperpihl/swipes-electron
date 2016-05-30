const packager = require('electron-packager');

// Package for linux
const linux = {
  arch: 'all',
  dir: '.',
  platform: 'linux',
  name: 'Swipes'
}

// Package for Windows
const windows = {
  arch: 'all',
  dir: '.',
  platform: 'win32',
  icon: './icons/logo-64.ico',
  name: 'Swipes'
}

// Package of OS X
const osx = {
  arch: 'all',
  dir: '.',
  platform: 'darwin',
  icon: './icons/logo-64.icns',
  name: 'Swipes'
}

packager(linux, function done_callback (err, appPaths) {
  if (err) {
    console.log(err);
    return;
  }

  packager(windows, function done_callback (err, appPaths) {
    if (err) {
      console.log(err);
      return;
    }

    packager(osx, function done_callback (err, appPaths) {
      if (err) {
        console.log(err);
      }

      console.log('ALL DONE');
    })
  })
})
