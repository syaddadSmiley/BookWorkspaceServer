#Add Remote Github
- git init
- git remote add origin https://github.com/syaddadSmiley/serverUbis_test1.git
- git branch -M main
- git pull origin main

#Push Branch
- git add .
- git branch -M {nama branch}
- git commit -m "feat: developing auth login & signUp"
- git push origin {nama branch}
 

# Simple REST API with Node.js and Express

This project is a simple REST API built with Node.js and Express, following the MVC pattern. It consists of CRUD operations for items, where the data is stored in MySQL using Sequelize. JWT token authentication is implemented to secure the API, and end-to-end testing is performed using Supertest.

## Project Structure
- `controllers`: Contains the business logic for handling CRUD operations.
- `models`: Defines the data schema using Sequelize.
- `routes`: Defines the API routes for items and authentication.
- `tests`: Includes end-to-end tests for token authentication.
- `middleware`: Contains JWT authentication middleware.

## Why MVC Pattern?
The MVC pattern was chosen for its simplicity and organization. It separates concerns by organizing the codebase into models, views, and controllers. This makes the codebase more maintainable and scalable, especially for small to medium-sized projects.

```
dot_magang
├─ .eslintrc.json
├─ config
│  └─ config.json
├─ controllers
│  ├─ AuthController.js
│  ├─ BaseController.js
│  └─ ItemsController.js
├─ gulpfile.js
├─ index.js
├─ migration.js
├─ migrations
│  ├─ 1700729837795_users.js
│  └─ 1700730027433_items.js
├─ models
│  ├─ index.js
│  ├─ items.js
│  └─ users.js
├─ package.json
├─ README.md
├─ router
│  ├─ api
│  │  ├─ authRouter.js
│  │  ├─ index.js
│  │  └─ itemsRouter.js
│  └─ index.js
├─ tests
│  └─ e2e.test.js
└─ utils
   ├─ auth.js
   └─ RequestHandler.js

```