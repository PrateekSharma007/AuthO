const express = require("express") 
const app = express() ;
const axios = require("axios") ;
const flash = require('express-flash');

const { auth } = require('express-openid-connect');
const { requiresAuth } = require('express-openid-connect');
app.use(flash());


const config = {
  authRequired: true,
  auth0Logout: true,
  secret: 'a long, randomly-generated string stored in env',
  baseURL: 'http://localhost:3000',
  clientID: 'LHiFBez6fTgfaFSzVwV76NSVwFvz7vFu',
  issuerBaseURL: 'https://dev-8beoovnx71u7swwn.us.auth0.com'
};


app.use(auth(config));


app.get('/', requiresAuth(), async (req, res) => {
  try {
    if (req.oidc.isAuthenticated() && req.oidc.user.email_verified === true) {
      const tokenResponse = await axios.post('https://dev.backend.drops.thenftbrewery.com/api/frontend/frontendAccess', {
        frontend_domain_url: 'https://loyalty.thenftbrewery.com'
      });
      const authToken = tokenResponse.data;
      const Email = req.oidc.user.email

      const otpResponse = await fetch('https://dev.backend.drops.thenftbrewery.com/api/frontend/oneOf/OTPForLogin',{
        body : JSON.stringify({email : Email}),
        method : 'POST',
        headers : {'Content-Type' : 'application/json' , "Authorization": `Bearer ${authToken.token}`}
      })



      try {
        const wallet = await axios.post('https://dev.backend.drops.thenftbrewery.com/api/frontend/oneOf/oneOfLogin', {
          email: Email,
          otp: "111111"
        }, {
          headers: {
            "Authorization": `Bearer ${authToken.token}`
          }
        });
      
        console.log(wallet.data);
        res.send(wallet.data);
      } catch (error) {
        console.error('Wallet API error:', error.message);
        res.status(500).send('Error fetching wallet data');
      }
    } else {
      
      res.redirect("/logout");
    }

  } catch (error) {

    res.status(500).send(error);
  }
});





app.listen(3000, () => {
    console.log("Working port 3000")
})


