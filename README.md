# Pollarizing App

If you or someone you love struggles with making quick and effective decisions, we have the perfect app for you. Simply follow the setup instructions below and create polls based on the predicament you find yourself in, including all possible options. You can then send links to friends, family members, and acquaintances so they can vote on options and take the burden of decision-making off your shoulders. An admin link will be provided to the creator to keep track of results and receive updates when a submission has been made.

Thank you for trying our app, and we hope it helps you make the right decision!

### Short demo video
![Demovideo](/public/images/demo11.gif)

### The main page
![Main page](/public/images/home.png)

### Create poll
![Main page](/public/images/create.png)

### Share poll
![Main page](/public/images/share.png)

### Vote page with drag and drop functionality
![Main page](/public/images/vote.png)

### Vote result
![Main page](/public/images/result.png)

## Setup Instructions
- Clone the repository to a new folder using git clone <new folder>
- Install dependencies using npm i
- Within a psql environment, create a new database with create database <db name> owner <user>;
- Create a .env file in the root folder and add the following:
  - DB_HOST=<host>
  - DB_USER=<user>
  - DB_PASS=<pass>
  - DB_NAME=<db name>
  - DB_SSL=true if using Heroku
  - DB_PORT=5432
  - API_KEY=<mailgun key>
  - DOMAIN=<mailgun domain>
  - Run the app locally using npm run local
  - Open your browser and navigate to http://localhost:8080

## Dependencies
- chalk: 2.4.2
- dotenv: 2.0.0
- ejs: 2.6.2
- express: 4.17.1
- mailer: 0.6.7
- mailgun-js: 0.22.0
- morgan: 1.9.1
- pg: 8.5.0
- sass: 1.35.1

