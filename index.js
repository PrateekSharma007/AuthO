const express = require("express") 
const app = express() ;
const axios = require("axios") ;
const session = require("express-session")
const request = require("request");
const { auth } = require('express-openid-connect');
const { requiresAuth } = require('express-openid-connect');

// const popup = require("popups")


app.set('view engine', 'ejs');






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
      console.log(req.oidc.user)
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
        },);
      
        console.log(wallet.data);
        res.send(wallet.data);
      } catch (error) {
        console.error('Wallet API error:', error.message);
        res.status(500).send('Error fetching wallet data');
      }
    } else {
       // res.redirect('/logout')
      res.render("emailverify")
    }

  } catch (error) {

    res.status(500).send(error);
  }
});


app.post('/resend-verification-email', requiresAuth(),  async (req, res) => {
  try {
    var options = {
      method: 'POST',
      url: 'https://dev-8beoovnx71u7swwn.us.auth0.com/oauth/token',
      headers: {'content-type': 'application/x-www-form-urlencoded'},
      data: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: 'LHiFBez6fTgfaFSzVwV76NSVwFvz7vFu',
        client_secret: 'rLS9lJStnM1O55iQhAFlGdRxTuuj-lP54vzDcV0vnETCwP9vt2d1YN7KrcxJBKtP',
        audience: 'https://dev-8beoovnx71u7swwn.us.auth0.com/api/v2/'
      })
    };
    
    axios.request(options).then(function (response) {
      // console.log(response.data.access_token);
      const access_token = response.data.access_token;

      var options = {
        method: 'POST',
        url: 'https://dev-8beoovnx71u7swwn.us.auth0.com/api/v2/jobs/verification-email',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${access_token}`
        },
        data: {
          user_id: "auth0|6512cc377fd48ae4910f78fe",
          client_id: 'LHiFBez6fTgfaFSzVwV76NSVwFvz7vFu',
          identity: {user_id: '6512cc377fd48ae4910f78fe', provider: 'auth0'}
        }
      };
      
      axios.request(options).then(function (response) {
        console.log(response.data);
    })
  })}catch(error) {
    console.error('Error sending verification email');
    res.status(500).send('Error sending verification email');
    res.send("error")
  }
});








app.listen(3000, () => {
    console.log("Working port 3000")
})


