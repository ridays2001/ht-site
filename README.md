# HT - Site
A site for the home tuitions run by my sister.\
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat+square)](http://makeapullrequest.com)


### Live version:
The live version of the site can be found [here↗](https://htonline.ml/).

### Technologies used:
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
#### 1. Configure node:
+ Go to [nodejs↗][1] site.
+ Download and install it for your pc.
+ Be sure to install v14 or higher.

#### 2. Configure your database:
+ Go to [firebase console↗][2].
+ Setup a project with some basic settings.
+ Click on the settings icon in the right sidebar.
+ Go to Project Settings > Service Accounts
+ Under the "Firebase Admin SDK", look for a "Generate new private key" button.
+ Download the json configuration file.

#### 3. Configure sentry:
+ Go to [sentry↗](https://sentry.io/) and sign in.
+ Setup an express project following some basic instructions.
+ Save the sentry dsn url somewhere for later.

<img src='https://i.imgur.com/c6TPFqp.png' width='300' align='right' alt='Fork' />

#### 4. Fork this repository:
+ Make sure that you're logged in to GitHub.
+ Click on the fork button at the top right corner.
+ You will see the forked version in your repositories section.

<img src='https://i.imgur.com/sH5CBeg.png' width='275' align='right' alt='Download'/>

#### 5. Download code:
+ Go to your profile > repositories section.
+ You will see the forked version of the code.
+ Open it and click on the download code button.
+ Select your desired method to download it.

<br/><br/>

#### 6. Configure your environment:
+ Make a new `.env` file in the folder.
+ Configure it by following [this example↗](https://github.com/ridays2001/ht+site/blob/master/.env.example).
+ Make sure your folder structure is similar to this repository.
+ Open your terminal in the project folder. \[For windows + Right click in explorer > open command prompt here].
+ Use `npm i` to install all the dependencies for the project.
+ Start the site by using `npm start`.
+ Minimize the terminal and open your browser to [localhost↗](http://localhost/)
+ If you followed the steps correctly, you should see the site homepage.


### Contribute:
If you feel like you can change something to a better version, even if it is a comment to explain a function better, feel free to submit a pull request.
+ Edit the code from the forked repository.
+ Make a new branch with your code changes.
+ Click on pull request button.
+ Submit it!

Thank you for contributing. 💙


[1]:https://nodejs.org/en "Node.js official site."
[2]:https://console.firebase.google.com/ "Google firebase console."
