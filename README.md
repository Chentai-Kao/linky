# Linky
Linky is an open sourced Go Link service with extremely intuitive UI.

Don't know what a Go Link service is? Maybe a SasS service like
[Go Links](https://www.golinks.io/) can help you understand.

## Alternatives to Linky
### If you just want to use Go Link personally...
Consider a dead simple Chrome plugin like
[URL Alias Rewrite](https://chrome.google.com/webstore/detail/url-alias-rewrite/mmapmkalidadbdlciojomkedmgcafgef?hl=en-US).
You don't need a Go Link service, really.

### If you have vast money to spend...
Avoid the hassle and use a hosted SasS service like
[Go Links](https://www.golinks.io/).
Don't forget to tell them you're referred by Chentai :)

### If you have little money to spend...
Contact me and I'll set up Linky for you on your infra, for a one-time cost.

### If you have no money to spend at all...
Continue reading and learn how to host Linky for your company.

## Features
1. Go Link service on Chrome browser.
2. Allow users to login with Google account.
3. Restrict users from a specific email domain (useful for company admin).
4. Allow admin to approve/revoke users access manually.
5. Display go links usage and highlight top links.
6. Access control, where links are only removable by its creator.
7. No cumbersome `go/` prefix, just type the alias (e.g. `wiki/`) to redirect.
8. Support dynamic links:
   - `wiki/Cat/` redirects to https://en.wikipedia.org/wiki/Cat
   - `wiki/Dog/` redirects to https://en.wikipedia.org/wiki/Dog
   - `git/123/` redirects to https://github.com/Chentai-Kao/linky/issues/123
   - `git/789/` redirects to https://github.com/Chentai-Kao/linky/issues/789

## How to set it up for your company
Let's assume you want to introduce go link to your company.
Here's how you'd do it.

1. Obtain Google API access with your company Google email.
2. Download this repo.
3. Follow the steps below and deploy this repo to a Docker container
(Heroku or something else).
4. Visit the website URL you just deployed to and log in.
Since you are the first user, you become the admin of Linky.
5. Access the admin page by clicking the **Menu** button on the top-right,
and go to **Admin**. You can do a few things there:
   1. approve/reject member requests when your coworker joins Linky.
   2. set up member email whitelist, so any member requests under that email
    domain will be auto-approved.
6. Share the URL to Linky dashboard to your coworkers.

## How to use Linky
Assuming someone already set up Linky for your company and you want to use
Linky, do the following.

1. Ask the admin for the URL to Linky dashboard, and visit that link.
2. Log in with your company Google account.
3. (first time user) set up the Chrome plugin by clicking the **Menu** button
on the top-right, and go to **Set up plugin**.
Follow the instruction to finish setup.
4. You can use existing go links that others set up already.
5. Or you can create your own link easily.

## Prerequisite
- This service requires users to login with their Google accounts,
so you'll need a Google API key.

- Set up environment variables by copy-pasting the `example.env` file,
rename it to `.env`, and populate the Google API keys as needed.

## How to deploy
This app is ready to deploy to any Docker container.
Regardless of your choice, you need to manually set environment variables
on your Docker container that exist in the `example.env` file.

### Deploy to Heroku
Deploy to Heroku is easy, with the `heroku.yml` already prepared for you.
You will need a Heroku Dyno and Heroku Postgres database.
Then follow the [Heroku tutorial](https://devcenter.heroku.com/articles/build-docker-images-heroku-yml#creating-your-app-from-setup).

### Deploy to any Docker container
This repo creates a Docker image that can be used to deploy to any container.
You may be interested to look into the `Dockerfile` and `docker-compose.yml`
files.

## How to make code changes

### Tech stack
- Written in Javascript
- Docker (container and portability)
- Next.js (server side rendering and some handy build tools)
- React (frontend)
- Express.js (backend)
- npm (package management)
- Postgres (database and user session)
- Material UI (icon set)
- React Bootstrap (simple CSS components)
- ESlint + Prettier (code linting and style guide)

### Source code structure
```
├── app
│   ├── api // backend server
│   ├── components // frontend re-usable React components
│   ├── docker-compose.yml // docker local development
│   ├── Dockerfile // docker config
│   ├── example.env // sample .env file
│   ├── lib // backend shared utilities
│   ├── next.config.js // Next.js config
│   ├── package.json // npm package config
│   ├── pages // frontend page components (this is a Next.js concept)
│   └── static // image assets
├── heroku.yml // Heroku Docker config
├── plugins
│   ├── chrome // Chrome plugin
│   └── chrome.zip // compressed Chrome plugin package
└── README.md // read-me
```

### Install npm packages
```$ npm install```

### Run local server (port 8000)
```$ npm run docker:start```

### Access Postgres psql console
```$ npm run docker:psql```
