import fs from 'fs';
import file from './../package.json';

const versionNumbers = file.version.split('.');
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
