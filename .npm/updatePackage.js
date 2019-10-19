import fs from 'fs';
import request from 'sync-request';
import file from './../package.json';

const res = request('GET', 'https://wc-guide.com/version.json');
const version = JSON.parse(res.getBody()).version;
const packageVersionNumbers = file.version.split('.');
const versionNumbers = version.split('.');

let subVersion = parseInt(versionNumbers[versionNumbers.length - 1]);
if (packageVersionNumbers[0] !== versionNumbers[0] || packageVersionNumbers[1] !== versionNumbers[1]) {
	subVersion = 0;
}
packageVersionNumbers[packageVersionNumbers.length - 1] = subVersion + 1;

const newVersion = packageVersionNumbers.join('.');

console.log('\x1b[36m%s\x1b[0m', `new Version: ${newVersion}`);
fs.writeFile('./src/version.json', JSON.stringify({ version: newVersion }), function (err) {
	if (err) return console.log('\x1b[31m', err);
});
