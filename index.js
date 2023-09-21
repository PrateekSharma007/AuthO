const express = require("express") 
const app = express() ;

const { auth } = require('express-openid-connect');
const { requiresAuth } = require('express-openid-connect');

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: 'a long, randomly-generated string stored in env',
  baseURL: 'http://localhost:3000',
  clientID: 'LHiFBez6fTgfaFSzVwV76NSVwFvz7vFu',
  issuerBaseURL: 'https://dev-8beoovnx71u7swwn.us.auth0.com'
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

// req.isAuthenticated is provided from the auth router
app.get('/',requiresAuth(), (req, res) => {
  if(req.oidc.isAuthenticated()){
    res.send(JSON.stringify(req.oidc.user.email))
    console.log(JSON.stringify(req.oidc.user.email))
  } 
  else{
    res.send("Not logged in")
  }
});




app.listen(3000, () => {
    console.log("Working port 3000")
})