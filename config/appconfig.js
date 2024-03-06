

require('dotenv').config();

// config.js
module.exports = {
	app: {
		port: process.env.DEV_APP_PORT || 3000,
		appName: process.env.APP_NAME || '',
		env: process.env.NODE_ENV || 'development',
	},
	db: {
		port: process.env.DB_PORT || 3306,
		database: process.env.DB_NAME || '',
		password: process.env.DB_PASS || '',
		username: process.env.DB_USER || '',
		host: process.env.DB_HOST || '127.0.0.1',
		dialect: 'mysql',
		logging: true,
	},
	winiston: {
		logpath: '/ubisnizLogs/logs/',
	},
	auth: {
		aes_iv: process.env.IV || '',
		aes_secret: process.env.AES_SECRET || '',
		jwt_secret: process.env.JWT_SECRET || '',
		jwt_expiresin: process.env.JWT_EXPIRES_IN || '1d',
		saltRounds: process.env.SALT_ROUND || 10,
		refresh_token_secret: process.env.REFRESH_TOKEN_SECRET || '',
		refresh_token_expiresin: process.env.REFRESH_TOKEN_EXPIRES_IN || '2d', // 2 days
	},
	sendgrid: {
		api_key: process.env.SEND_GRID_API_KEY || '',
		api_user: process.env.USERNAME || '',
		from_email: process.env.FROM_EMAIL || '',
	},
	office365: {
		host: process.env.OFFICE365_HOST || 'smtp.office365.com',
		port: process.env.OFFICE365_PORT || 587,
		secure: process.env.OFFICE365_SECURE || false,
		from: process.env.OFFICE365_FROM || '',
		auth: {
			user: '',
			pass: '',
		},
	}

};
