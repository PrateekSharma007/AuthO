const express = require("express") 
const app = express() ;
const axios = require("axios") ;

const { auth } = require('express-openid-connect');
const { requiresAuth } = require('express-openid-connect');


const config = {
  authRequired: true,
  auth0Logout: true,
  secret: 'a long, randomly-generated string stored in env',
  baseURL: 'http://localhost:3000',
  clientID: 'LHiFBez6fTgfaFSzVwV76NSVwFvz7vFu',
  issuerBaseURL: 'https://dev-8beoovnx71u7swwn.us.auth0.com'
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

//req.isAuthenticated is provided from the auth router





app.get('/', requiresAuth(), async (req, res) => {
  try {
    if (req.oidc.isAuthenticated() && req.oidc.user.email_verified === true) {
      const tokenResponse = await axios.post('https://dev.backend.drops.thenftbrewery.com/api/frontend/frontendAccess', {
        frontend_domain_url: 'https://loyalty.thenftbrewery.com'
      });
      const authToken = tokenResponse.data;
      console.log(authToken);
      console.log(req.oidc.user.email);
      const Email = req.oidc.user.email;

      try {
        const otpResponse = await axios.post('https://dev.backend.drops.thenftbrewery.com/api/frontend/oneOf/OTPForLogin', {
          email: Email,
        }, {
          headers: {
            Authorization: `bearer ${authToken}`
          }
        });

        console.log('OTP', otpResponse.data);
        res.send(otpResponse.data);
      } catch (otpError) {
        console.error('OTP API error:', otpError.message);
        res.status(500).send('Error requesting OTP');
      }
    } else {
      res.send('Please verify your email before logging in.');
    }
  } catch (error) {
    console.error('An error occurred:', error.message);
    res.status(500).send('Internal Server Error');
  }
});





app.listen(3000, () => {
    console.log("Working port 3000")
})


