const helper = require('sendgrid').mail;
const async = require('async');
const config = require('../config/appconfig');
const sg = require('sendgrid')(config.sendgrid.api_key);
const Logger = require('../utils/logger');

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(config.sendgrid.api_key);

const nodemailer = require('nodemailer');

const logger = new Logger();

module.exports = {
	async otpContent(cleanedName, otpCode){
		const htmlContent = `
				<!DOCTYPE html>
				<html>
				<head>
					<title>Verification Email</title>
				</head>
				<body>
					<h1>Verification Email</h1>
					<p>Hi ${cleanedName},</p>
					<p>Thank you for registering to our application. Please use this code to verify your account.</p>
					<p>Code: <b>${otpCode}</b></p>
					<p>Regards,</p>
					<p>Team</p>
				</body>
				</html>
				`;

		return htmlContent;
	},

	async constructMailOptions(to, subject, textContent, htmlContent) {
		return {
			from: config.office365.from,
			to: to,
			subject: subject,
			text: textContent,
			html: htmlContent,
		};
	},

	async sendEmail(parentCallback, to, subject, textContent, htmlContent) {
		const errorEmails = [];
		const successfulEmails = [];
		async function constructMailOptions(to, subject, textContent, htmlContent) {
			return {
				from: config.office365.from,
				to: to,
				subject: subject,
				text: textContent,
				html: htmlContent,
			};
		}
		const mailOptions = await constructMailOptions(to, subject, textContent, htmlContent);
		async.parallel([
			function one(callback) {
				const transporter = nodemailer.createTransport({
					host: config.office365.host,
					port: config.office365.port,
					secure: config.office365.secure,
					auth: {
						user: config.office365.auth.user,
						pass: config.office365.auth.pass,
					},
				});
				transporter.sendMail(mailOptions, (error, info) => {
					if (error) {
						const stringError = error.toString();
						logger.log(stringError, 'error');
					} else {
						logger.log(`Email sent: ${info.response} |||| and Accepted by => ${info.accepted} | Rejected by	=> ${info.rejected}`, 'info');
					}
				});

				callback(null, {
					successfulEmails: 1,
					errorEmails: 0,
				});
			},
		], (err, results) => {
			if (err) {
				logger.log(`error ,Error during processing request at : ${new Date()} details message: ${err.message}`, 'error');
			} else {
				logger.log(`an email has been sent: ${new Date()} with results: SENDING....`, 'info');
			}
			console.log('Done');
		});
		parentCallback(null,
			{
				successfulEmails,
				errorEmails,
			});
	},

	async sendEmailVerification(to, codeOTP){

		const msg = {
			to: to,
			from: config.sendgrid.from_email,
			subject: 'Email Verification',
			html: '<p>Please click the link below to verify your email address:</p>' +
				`<p><a href="http://localhost:3000/verify?token=${codeOTP}">http://localhost:3000/verify?token=${codeOTP}</a></p>`,
		};

		return sgMail.send(msg);
	},

	sendEmailSendgrid(
		parentCallback,
		fromEmail,
		toEmails,
		subject,
		textContent,
		htmlContent,
	) {
		const errorEmails = [];
		const successfulEmails = [];
		async.parallel([
			function one(callback) {
				// Add to emails
				for (let i = 0; i < toEmails.length; i += 1) {
					// Add from emails
					const senderEmail = new helper.Email(fromEmail);
					// Add to email
					const toEmail = new helper.Email(toEmails[i]);
					// HTML Content
					const content = new helper.Content('text/html', htmlContent);
					const mail = new helper.Mail(senderEmail, subject, toEmail, content);
					const request = sg.emptyRequest({
						method: 'POST',
						path: '/v3/mail/send',
						body: mail.toJSON(),
					});
					sg.API(request, (error, response) => {
						if (error) {
							logger.log(`error ,Error during processing request at : ${new Date()} details message: ${error.message}`, 'error');
						}
						console.log(response.statusCode);
						console.log(response.body);
						console.log(response.headers);
					});
				}
				// return
				callback(null, true);
			},
		], (err, results) => {
			if (err) {
				logger.log(`error ,Error during processing request at : ${new Date()} details message: ${err.message}`, 'error');
			} else {
				logger.log(`an email has been sent: ${new Date()} with results: ${results}`, 'info');
			}
			console.log('Done');
		});
		parentCallback(null,
			{
				successfulEmails,
				errorEmails,
			});
	},
};
