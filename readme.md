# chekListBot

Getting Started:

1. Clone repo, install dependencies

`git clone <git-repo-url> && cd <chekListBot> && npm i`

2. Set up local environment variables

`cp .env.example .env`

3. Fix "@2bad" lib to wotk with items

`node_modules/@2bad/bitrix/build/main/client/methods/list.js:39
fix "...r" to "...r.items"`

4. Run migrations

`npm run up`

5. Sync cars

`npm run refreshcars`

6. Install PM2 

`sudo npm install pm2@latest -g`

7. Start process with PM2, save it to start with PM2 and make PM2 starts on boot
`pm2 start ecosystem.config.js`
`pm2 save`
`pm2 startup`

