import fs from 'fs';
import request from 'sync-request';
import file from './../package.json';

const res = request('GET', 'https://wc-guide.com/version.json');
const version = JSON.parse(res.getBody()).version;

const versionNumbers = version.split('.');
versionNumbers[versionNumbers.length - 1]++;
const newVersion = versionNumbers.join('.');

file.version = newVersion;

fs.writeFile('./package.json', JSON.stringify(file), function (err) {
	if (err) return console.log('\x1b[31m', err);
	console.log('\x1b[36m%s\x1b[0m', `new Version: ${newVersion}`);
});

fs.writeFile('./src/version.json', JSON.stringify({ version: newVersion }), function (err) {
	if (err) return console.log('\x1b[31m', err);
});
