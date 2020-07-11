# HT - Site
A site for the home tuitions run by my sister.\
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)


### Live version:
The live version of the site can be found [here↗](https://htonline.ml/).

### Libraries used:
*Backend:*
+ Javascript (Node.js - Main)
+ Express.js (Backend structure)
+ Google Firestore (Database)

*Frontend:*
+ Pug (HTML template engine)
+ Bootstrap (CSS framework)
+ Custom CSS

*Others:*
+ [Heroku](https://heroku.com/) - Hosting the site.
+ [Freenom](https://freenom.com/) - Domain name.
+ [Cloudflare](https://cloudflare.com/) - SSL certificate.
+ [Sentry](https://sentry.io/) - Error management.
+ [ESLint](https://eslint.org/) - Code formatting.


### Requirements:
+ [Node.js][1] - v14 or higher
+ [Google Firebase][2] - Configure database.

### Instructions to run the site:
To run this site locally, follow these rules:
+ Configure node:
	- Go to [nodejs↗][1] site.
	- Download and install it for your pc.
	- Be sure to install v14 or higher.
+ Configure your database:
	- Go to [firebase console↗][2].
	- Setup a project with some basic settings.
	- Click on the settings icon in the right sidebar.
	- Go to Project Settings > Service Accounts
	- Under the "Firebase Admin SDK", look for a "Generate new private key" button.
	- Download the json configuration file.
+ Configure sentry:
	- Go to [sentry↗](https://sentry.io/) and sign in.
	- Setup an express project following some basic instructions.
	- Save the sentry dsn url somewhere for later.
+ Download code:
	- Git: Use `git clone https://github.com/ridays2001/ht-site.git` in your terminal.
	- Download zip: Download the code zip folder [here↗](https://github.com/ridays2001/ht-site/archive/master.zip).
	- GitHub desktop app: Click [here↗](x-github-client://openRepo/https://github.com/ridays2001/ht-site).
+ Configure your environment:
	- Make a new `.env` file in the folder.
	- Configure it by following [this example](https://github.com/ridays2001/ht-site). \[To be added soon!]
	- Open your terminal in the project folder. \[For windows - Right click in explorer > open command prompt here].
	- Use `npm i` to install all the dependencies for the project.
	- Start the site by using `npm start`.
	- Minimize the terminal and open your browser to [localhost↗](http://localhost/)
	- If you followed the steps correctly, you should see the site homepage.
	
### Contribute:
If you feel that you've a better code structure or a better site design, feel free to contribute.
Follow the steps above to configure your local environment and run the site.
Open it in your favorite code editor and modify the code sections.
Create a new pull request and submit it!
Thanks :blue_heart:!
	

[1]:https://nodejs.org/en "Node.js official site."
[2]:https://console.firebase.google.com/ "Google firebase console."
