# WC Guide PWA
This is a progressive Web App for wc-guide.com

## Technology
It is based on [vueJS](https://vuejs.org/) and uses nodeJS and WebPack for the build process.

### Setup
To use the source code you need nodeJS (min v. 8.10) and npm (min v. 6.9).  
Then you can use `npm install` to install all dependencies.  
It also uses [Livereload](http://livereload.com/) to sync changes with your browser.

### Build process
There are several tasks configured:
* `npm start`: starts the development build process and the file watcher
* `npm prod`: runs the production build
* `npm update`: runs .npm/updatePackage.js script. It basicly just updates the package.json version and the version inside the src/version.json
* `npm deploy`: it updates the version, runs the production build and uploads everything to the FTP Server (.npm/deploy.js)

### PWA
This app is served as a PWA. That means its designed to work offline first (using IndexedDB and a ServiceWorker) and generates a manifest.json to make it installable.

## Backend
The app has several connections to the wc-guide.com Backend and to mapBox. They are all defined inside the [settings.js](https://github.com/wc-guide/wc-guide-pwa/blob/master/src/app/vendor/settings.js) (`const api`, `const mapBoxSettings`).  
There are no dependencies to other external ressources.