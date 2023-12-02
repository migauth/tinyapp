# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

!["Login page"](https://github.com/migauth/tinyapp/blob/main/docs/login.jpeg?raw=true)
!["URLS page"](https://github.com/migauth/tinyapp/blob/main/docs/urls.jpeg?raw=true)
!["Edit page"](https://github.com/migauth/tinyapp/blob/main/docs/edit.jpeg?raw=true)

## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.
- Run `npm start` to start server.
- Enter http://localhost:8080/urls into browser to navagate to home page

## Using the App

- Navagate to 'Register' page to register an account
- Navagate to 'Create new URL' to create a new short URL
- After new short URL is created, it will be displayed in 'My URLS'
- To edit, press edit button beside short URL and enter new URL
- Press delete to remove URL from database
- Short URLs can be accessed with http://localhost:8080/u/'insert short url' by anyone after logging out

## Thank you for using the App!