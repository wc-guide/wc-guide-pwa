import FtpDeploy from "ftp-deploy";
import dotenv from 'dotenv';
dotenv.config();
const env = process.env;
const ftpDeploy = new FtpDeploy();
const config = {
	user: env.FTP_USER,
	password: env.FTP_PASSWORD,
	host: env.FTP_HOST,
	port: env.FTP_PORT,
	localRoot: __dirname + env.FTP_LOCALROOT,
	remoteRoot: env.FTP_REMOTEROOT,
	include: ['*', '**/*', '**/.*'],
	exclude: ["**/*.map", "node_modules/**", "node_modules/**/.*"],
	deleteRemote: false,
	forcePasv: true
};

console.log('\x1b[36m%s\x1b[0m', `FTP upload to ${env.FTP_HOST} started..`);
ftpDeploy.deploy(config)
	.then(res => {
		console.log('\x1b[36m%s\x1b[0m', 'FTP upload finished');
	})
	.catch(err => {
		console.log('\x1b[31m', 'Error!');
		console.log(err);
	});