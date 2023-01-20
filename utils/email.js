const helper = require('sendgrid').mail;
const async = require('async');
const config = require('../config/appconfig');
const sg = require('sendgrid')(config.sendgrid.api_key);
const Logger = require('../utils/logger');

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(config.sendgrid.api_key);

const logger = new Logger();

module.exports = {

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

	sendEmail(
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
