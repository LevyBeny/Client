var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var path = require('path');
var Connection = require('tedious').Connection;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var cors = require('cors');
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.locals.token=0;
app.locals.users={};


// All functions of logged sholud check if logged in
app.use('*/logged/*', function (req, res, next) {
  if(!checkLogin(req))
    res.send("login required");
  else
    next();
})

function checkLogin(req) {
    var token = req.headers["my-token"];
    var userName = req.headers["userName"];
    if (!token || !userName)
        return false;
    var validToken = req.app.locals.users[userName];
    if (validToken == token)
        return true;
    else
        return false;
}

//router requires
var user = require("./routes/user");
var product= require("./routes/product");
var purchase= require("./routes/purchase");

app.use('/user/', user);
app.use('/product/', product);
app.use('/purchase/', purchase);

// //---User------------------------------------------------------------------------------------------------------------
// app.post('/user/register', user); //
// app.post('/user/login', user); //
// app.get('/getUserCart/:userName',user); //
// app.post('/restorePassword',user); //
// app.get('/getRestorePasswordQuestions/:userName',user); //
// app.get('/getRestoreQuestions',user); //
// app.post('/removeUser',user); //
// app.post('/logged/updateCart',user); //
// //-------------------------------------------------------------------------------------------------------------------

// //---Product---------------------------------------------------------------------------------------------------------
// app.get('/getAllProducts',product); //
// app.get('/getCategories',product); //
// app.get('/getProductsByCategory/:categoryID',product); //
// app.get('/getProductByID/:productID',product); //
// app.get('/getTop5Products',product); //
// app.get('/findProduct/:productName',product); //
// app.get('/get5NewestProducts',product); //
// app.post('/addProduct',product); //
// app.get('/getProductsByColor/:color', product);//
// app.get('/getProductsByBrand/:brand', product);//
// app.get('/getRecommendedProductsByUsers/:userName',product); //
// app.get('/getRecommendedProductsByCategories/:userName',product); //
// app.post('/removeProduct',product); //
// //-------------------------------------------------------------------------------------------------------------------

// //---Purchase--------------------------------------------------------------------------------------------------------
// app.post('/purchase',purchase); //
// app.get('/getUserPurchases/:userName',purchase); //
// app.get('/getPurchasedProducts/:purchaseID',purchase); //
// app.get('/getCurrency', purchase); //
// //-------------------------------------------------------------------------------------------------------------------

var port = 4000;
app.listen(port, function () {
    console.log('App listening on port ' + port);   
});

module.exports=app;
