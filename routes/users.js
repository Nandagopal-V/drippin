var express = require('express');
const { options } = require('.');
var router = express.Router();
// const client = require('twilio')('ACb98ab8d35c3dbd5b30d21344394483f3','8e4313ea7c319f595a9234f24c558105');
// const config=require('../configure/collections');
// client.logLevel = 'debug';
var userHelper = require('../helpers/userhelper')
var productHelper = require('../helpers/product-helpers');
const { response, Router } = require('express');

const paypal = require('paypal-rest-sdk');
const userhelper = require('../helpers/userhelper');
const { log } = require('handlebars');
 
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AUplwZ9LOZdUZHmQlvrDDnL0lve3kenUh7E_Z7OVVsBtCRy6AIe1oLPya1Nd2V_4iv895J2NDMA_QlaS',
  'client_secret': 'ENO_yYAXSiIa2uzwg6C2WSrJ5rnrYegFkc3CPoI7dlqJi0xPM1WwOjDOdkgv1r_pMrNjabmP0SegObUK'
});



//verify user session
let verifylogin = (req, res, next) => {
  if (req.session.user) {
    next();

  } else {
    res.redirect("/login");
  }
};




/* GET home page. */
var cartCount;
router.get('/', async function (req, res, next) {
try{
  if (req.session.user) {
     cartCount = await userHelper.getCartCount(req.session.userDetails._id);
    console.log(cartCount);
    cartCountOther = cartCount;
    console.log(cartCountOther);
    

    productHelper.getAllProduct().then(async(data) => {
  let banner=await userHelper.getBanner()

      let shirts= await productHelper.getAnyCategory('shirt')
      let pants= await productHelper.getAnyCategory('pants')
      let jeans= await productHelper.getAnyCategory('jeens')
      let tshirts= await productHelper.getAnyCategory('t-shirt')
      let latest=await productHelper.getLatest()
     


      res.render('index', {user:req.session.user, data, index2: true, userasset: true, footerstat: true, cartCount,shirts,pants,jeans,tshirts,latest,banner});
      console.log('loogin success');
    })
  }
  else {
    productHelper.getAllProduct().then(async(data) => {
  let banner=await userHelper.getBanner()

      let shirts= await productHelper.getAnyCategory('shirt')
      let pants= await productHelper.getAnyCategory('pants')
      let jeans= await productHelper.getAnyCategory('jeens')
      let tshirts= await productHelper.getAnyCategory('t-shirt')
      let latest=await productHelper.getLatest()
      


      res.render('index', { data, index1: true, userasset: true, footerstat: true,pants,shirts,jeans,tshirts,latest,banner});
      console.log('loogin failed');
    })

  }

}catch(err){
  res.render('error')
}

});









//userlogin
router.get('/login', function (req, res, next) {
  try{
  if (req.session.user) {
    res.redirect('/')
  }
  else {
    res.render('user/login', { login1: true, userasset: true, footerstat: true });
  }

}catch(err){
  res.render('error')
}
});


// post userlogin
router.post('/login', (req, res) => {
  try{
  userHelper.userLogin(req.body).then((value) => {
    if(value.trick){
    statususer = value.user.userStatus
    
    console.log(statususer);}
    console.log('going to check status user');



    if(value.status){
      if(statususer){
                console.log('login success');
        req.session.user = value.user;
        req.session.userDetails = value.user;
        console.log(req.session.user._id);
        userError = false;
        res.redirect('/');
      }
      else{
         res.render('user/login', { userStatus: true, login1: true, userasset: true, errorr: true, footerstat: true })

      }

    }
    else{
      console.log('login failed');
      res.render('user/login', { userError: true, login1: true, userasset: true, footerstat: true })
    }






  })
}catch(err){
  res.render('error')
}
})











//post signup
let details;
router.post('/signup', (req, res) => {
  try{
    
  userHelper.Signup(req.body).then((userDetails) => {
    details = userDetails;
    console.log(userDetails);
    if (userDetails.status) {
      console.log('redirecting to signup otp');
      res.redirect('/signupotp');
      // res.send("afafaefawefarfaerf")
    }
    else {
      console.log('redirecing to signup');
      req.session.mailexist = true;
      res.redirect('/signup');
    }


  })
}catch(err){
  res.render('error')
}
})



//getsignup
router.get('/signup',(req, res) => {
  try{
    console.log('enetring signup')
  if(req.session.mailexist)
  {
  res.render('user/signup', { login1: true, userasset: true, footerstat: true,existid: true });
  }
  else{
    res.render('user/signup', { login1: true, userasset: true, footerstat: true});
  
  }
}catch(err){
  res.render('error')
}
})



//get otp signin
router.get('/signupotp', (req, res) => {
  try{
  res.render('user/signupotp', { footerstat: true ,userasset: true,login1: true, });
}catch(err){
  res.render('error')
}
})

//post otp signin
router.post('/signupotp', (req, res) => {
  try{
  console.log('going to print details');
  console.log(details);
  userHelper.signupOtp(req.body, details).then((userDetails) => {
    if (userDetails) {
      res.redirect('/login');
    }
    else {
      res.redirect('/signup');

    }
  })
}catch(err){
  res.render('error')
}
})


//product details get
let noDiscount
router.get('/productDetails/:id', verifylogin, async(req, res) => {
  try{
  console.log('request has come to user router')
  let userId = req.params.id
  await productHelper.findOneProduct(userId).then((product) => {
    console.log(product)
    if(product.priceafterdiscount==0){
       noDiscount=true;
    }
    else{
      noDiscount=false;
    }
    res.render('user/productDetails', {user:req.session.user, userasset: true, index2: true, footerstat: true, product ,cartCount, noDiscount})
    console.log('details part over')
  }).catch((e)=>{
    res.render('error')
  })
}catch(err){
  res.render('error')
}
})


//add to cart
router.get('/addToCart/:id',(req, res) => {
  try{
  console.log('api call')

  console.log('request has come to user router of add to cart')
  console.log(req.session.userDetails._id);
  userHelper.addToCart(req.params.id, req.session.userDetails._id).then(() => {
    res.json({status:true})
    // res.redirect('/')
  })
}catch(err){
  res.render('error')
}
})


//get cart
router.get('/getCart', verifylogin, async (req, res) => {
  try{
  console.log('request has come to user router of get cart')
  let cartCount = await userHelper.getCartCount(req.session.userDetails._id);
  console.log('going to display cartitmes')
  if(cartCount>0){
  let total=await userHelper.getTotalAmount(req.session.user._id)
  total=total[0].total

  let products = await userHelper.getCartProducts(req.session.userDetails._id)

  res.render('user/cart', {user:req.session.user, footerstat: true, userasset: true, index2: true, products, cartCount,total ,user:req.session.user._id });
  }else{
    res.render('user/cartEmpty', { user:req.session.user,footerstat: true, userasset: true, index2: true,  cartCount})
  }
}catch(err){
  res.render('error')
}
})



//change products quantity
router.post('/change-quantity',async(req, res) => {
  try{
 await userHelper.changeProductQuantity(req.body).then(async(detail)=>{
detail.total=await userHelper.getTotalAmount(req.body.user)
    //  console.log('response.total is  ' + response.total);
     console.log(response.total);
 


  res.json(detail);
  })
}catch(err){
  res.render('error')
}
})

//remove cart product
router.post('/remove-cart-product', async (req, res)=>{
  try{
  await userHelper.removeCartProduct(req.body).then((detail)=>{
    res.json(detail);
    })
  }catch(err){
    res.render('error')
  }
})




//place order

let paypalOrderId
let totalPaypal
let totalafterwallet
let afterwalletbal
let totalbeforewallet
let walletdiscount=0
walletdiscount=parseInt(walletdiscount)


router.post('/place-order',async(req, res)=>{
  try{
  console.log('printing req.body');
console.log(req.body);
totalafterwallet=parseInt(req.body.totalafterwallet1)
console.log('walletdiscount 1',walletdiscount);
walletdiscount=parseInt(req.body.walletdiscount)
console.log('walletdiscount 2',walletdiscount);

totalbeforewallet=total
if(totalafterwallet!=0){

  total=totalafterwallet
}
afterwalletbal=parseInt(req.body.walletbalance)
console.log('ttal is  ',total);
console.log('wallet balance is  ',afterwalletbal);


let products=await userHelper.getCartProductList(req.session.user._id)
let totalPrice=await userHelper.getTotalAmount(req.session.user._id)
userHelper.placeOrder(req.body,products,total,couponcode,req.session.user._id,totalbeforewallet,coupondiscount,walletdiscount).then(async(orderId)=>{
  console.log('order id first is',orderId);
  paypalOrderId = orderId;
  console.log('totalprice first is',total);
  totalPaypal=total
  if(req.body['payment-method']=='COD'){
   
    
   userHelper.movecart(req.session.user._id)
    res.json({codeSuccess:true})
  }

  else if(req.body['payment-method']=='ONLINE razor'){
 userHelper.generateRazorpay(orderId,total).then(async(response)=>{
await userHelper.deductfromwallet(req.session.user._id,afterwalletbal)

 res.json(response)
    })
  }
  else if(req.body['payment-method']=='wallet'){

await userHelper.deductfromwallet(req.session.user._id,afterwalletbal)

response.walletsuccess=true;

userHelper.movecart(req.session.user._id)

res.json(response)

    

  }
  else{
   userHelper.genaratePaypal(orderId,total).then((response)=>{
    response.paypalsuccess=true
     
    res.json(response)
  })
  }

})
}catch(err){
  res.render('error')
}
})


//get checkwallet
router.get('/checkwallet/:amount',async(req, res)=>{
  try{
  console.log(`hello motto have a nice day`);
  await userHelper.getUserdetails(req.session.user._id).then((response)=>{ 
    req.params.amount=parseInt(req.params.amount);
    console.log('amount is  ',req.params.amount) 
    console.log('awallet is  ',response.wallet) 
    if(response.wallet>req.params.amount){
      console.log('wallet is mmore');
      response.walletE=true;
      console.log('response is ',response);
      res.json(response)
    }
    else{
      console.log('wallet is less')
      res.json(response)
    }

  })
}catch(err){
  res.render('error')
}

})












//paypal success
router.get('/success', async(req, res) => {
  try{
  
  userHelper.changePaymentStatus(paypalOrderId,req.session.user._id).then(() => {
    const payerId = req.query.PayerID
    console.log(payerId);
    const paymentId = req.query.paymentId
    console.log("amount.total: " + total);
    console.log("amount: " + total);
    console.log("amount.grandTotal: " +total);
    const execute_payment_json = { 
      "payer_id": payerId,
      "transactions": [{
        "amount": {
          "currency": "USD",  
          "total": "" +total
        },  
      }]
    };
    
    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
      if (error) {
        console.log(error);
        console.log('err');
        throw error
      } else {
        console.log('success');
        console.log(payment);
       
        res.redirect('/order-success')
      }
    })

  })
}catch(err){
  res.render('error')
}
})


//get order success
router.get('/order-success',verifylogin, (req, res)=>{
  try{

  total=0;
couponcodestatus=false

res.render('user/ordersuccess',{user:req.session.user, index2: true, userasset: true, footerstat: true, cartCount,user:req.session.user})
}catch(err){
  res.render('error')
}
})


//get order page
router.get('/orders',verifylogin, async(req,res)=>{
  try{
  let orders=await userHelper.getUserOrders(req.session.user._id)
  res.render('user/orders',{user:req.session.user,orders,index2: true, userasset: true, footerstat: true, cartCount})
}catch(err){
  res.render('error')
}
})

//view orderd products
router.get('/view-order-products/:id',async(req, res)=>{
  try{
  let products=await userHelper.getOrderProducts(req.params.id)
  let productsinv=await userhelper.getOrderProductsinvoice(req.params.id)
  // productImage=products[0].product.image[0]
  res.render('user/view-order-products',{user:req.session.user,products,index2: true, userasset: true, footerstat: true, cartCount,productsinv})
}catch(err){
  res.render('error')
}

})


//view invoice
router.get('/view-invoice-products/:id',async(req,res)=>{
  let final=0
  let products=await userHelper.getOrderProducts(req.params.id)
  let productsinv=await userhelper.getOrderProductsinvoice(req.params.id)
  final=products[0].overallgrandtotal-productsinv[0].coupondiscount-productsinv[0].walletdiscount-products[0].overalldiscount

  res.render('user/invoice',{products,productsinv,final})
  
})




//verify payment
router.post('/verify-payment',(req, res) => {
  try{
  console.log('verify payment route')
  console.log(req.body);
  userHelper.verifypayment(req.body,req.session.user._id).then(()=>{
    userHelper.changePaymentStatus(req.body['order[receipt]']).then(()=>{
      console.log('payment successful');
      res.json({status:true})
    })
  }).catch((err)=>{
    console.log(err)
    res.json({status:false})
  })
}catch(err){
  res.render('error')
}
})



//cancel order
router.get('/cancelOrder/:id', (req, res)=>{
  try{
  userHelper.cancelOrder(req.params.id,req.session.user._id)
  res.redirect('/orders')
}catch(err){
  res.render('error')
}
})

//return order
router.get('/returnOrder/:id', (req, res)=>{
  try{
  userHelper.returnOrder(req.params.id,req.session.user._id)
  res.redirect('/orders')
}catch(err){
  res.render('error')
}
})

//get userDetails
router.get('/userDetails',verifylogin,async(req, res)=>{
  try{
  // console.log(req.session.user)
  await userHelper.getUserdetails(req.session.user._id).then(async(user)=>{
  let address= await userHelper.getAddress(req.session.user._id);


    console.log('user wallet is '+ req.session.user.wallet)
    res.render('user/userDetails',{user,index2: true, userasset: true, footerstat: true, cartCount,address})
  })
}catch(err){
  res.render('error')
}
})

//get edituserDEtails
router.get('/userEditDetails',verifylogin,(req, res)=>{
  try{
  res.render('user/userEditDetails',{user:req.session.user,index2: true, userasset: true, footerstat: true, cartCount})
}catch(err){
  res.render('error')
}
})

//getuserEditAddress
router.get('/userEditAddress',verifylogin,(req, res)=>{
  try{
  res.render('user/userEditAddress',{user:req.session.user,index2: true, userasset: true, footerstat: true, cartCount})
}catch(err){
  res.render('error')
}
})

//get userEditPassword
router.get('/userEditPassword',verifylogin,(req, res)=>{
  try{
  res.render('user/userEditPassword',{user:req.session.user,index2: true, userasset: true, footerstat: true, cartCount,passwordchange})
}catch(err){
  res.render('error')
}
})

//get delete adress 
router.get('/userDeleteAddress/:id',verifylogin,(req, res)=>{
  try{
  userHelper.deleteAdress(req.params.id).then(()=>{
    res.redirect('/userDetails')

  })
}catch(err){
  res.render('error')
}

})

//update Password
let passwordchange=true
router.post('/updatePassword',verifylogin,async(req, res)=>{
  try{
    await userhelper.updatePassword(req.body,req.session.user._id).then((passwordchange1)=>{

      if(passwordchange1){
        
        res.redirect('/userEditPassword')
       
        
      }
      else{
        console.log('rdiredcting');
        console.log(passwordchange1);
        passwordchange=passwordchange1
        res.redirect('/userEditPassword')
      }

    })
  }catch(err){
    res.render('error')
  }
})

//otp login get
router.get('/loginOtp',(req, res) => {
  try{
  console.log('came in to router loginOtp')
  res.render('user/loginOtp', { login1: true, userasset: true, footerstat: true,phonenumberCheck })
}catch(err){
  res.render('error')
}
})


  


//user logout
router.get('/logout', (req, res) => {
  try{
  console.log("hai");
  req.session.user = null;

  res.redirect('/');
}catch(err){
  res.render('error')
}

})

//check login phonenumber
let otp=false;
let phonenumberCheck=false

router.post('/phonenumberCheck',async(req, res) => { 
  try{
await  userHelper.phonenumberCheck(req.body).then((status)=>{
  console.log(status);
  console.log(status.userStored);
  userStoredData = status.userStored;
  if(status.response){
    console.log('render verify page')
     res.render('user/loginOtpVerify',{ login1: true, userasset: true, footerstat: true,userError: false,error: false,userStatus:false})
  }
  else{
    phonenumberCheck=true;
    res.redirect('/loginOtp')
  }
})
}catch(err){
  res.render('error')
}

})



//check login otp
let userStoredData;


router.post('/phonenumberCheckOtp',async(req, res)=>{
  try{
await userHelper.phonenumberCheckVerify(req.body,userStoredData).then((value)=>{

  if(value.trick){
    statususer = value.user.userStatus
    
    console.log(statususer);}
    console.log('going to check status user');



    if(value.status){
      if(statususer){
                console.log('login success');
        req.session.user = value.user;
        req.session.userDetails = value.user;
        console.log(req.session.user._id);
        userError = false;
        res.redirect('/');
      }
      else{
        //  res.redirect('user/login', { userStatus: true, login1: true, userasset: true, errorr: true, footerstat: true })
         res.render('user/loginOtpVerify',{ login1: true, userasset: true, footerstat: true,userStatus: true, errorr: true})

      }

    }
    else{
      console.log('login failed');
      res.render('user/loginOtpVerify',{ login1: true, userasset: true, footerstat: true, userError: true})  
      // res.render('user/login', { userError: true, login1: true, userasset: true, footerstat: true })

    }

})
}catch(err){
  res.render('error')
}
})


//apply coupon
let couponcode=null
let couponcodestatus=false
let expiredcoupon=false
let invalidcoupon=false 
let  couponused=false
router.post('/applyCoupon',async(req, res)=>{
  try{
 await userHelper.applyCoupon(req.body,req.session.user._id).then((response) => {

console.log(response)
if(response.validcoupon){
  couponcode=response.couponcode;
  console.log('couponcodestatus in apply1 is'+ couponcodestatus);

  couponcodestatus=true;
  console.log('couponcodestatus in apply2 is'+ couponcodestatus);
  res.redirect('/checkout');


}
else if(response.expiredcoupon){
  expiredcoupon=true;
  res.redirect('/checkout');
   
}
else if(response.invalidcoupon){
  invalidcoupon=true;
  res.redirect('/checkout');
   
}else{
  couponused=true;
  res.redirect('/checkout');

}

})
}catch(err){
  res.render('error')
}
})




//get checkout
let total
let total1
let total2
let totalfinal
let coupondiscount

router.get('/checkout',verifylogin,async(req, res)=>{ 
  try{
  console.log("have a nice day")

  let cartproducts=await userHelper.getCartProducts(req.session.user._id)
  console.log(cartproducts);
   total1=await userHelper.getTotalAmount(req.session.user._id)
  console.log(couponcode);
  console.log('couponcodestatus in checkout is'+ couponcodestatus);
   total2=0;
  totalfinal=0;
  total=0;
  let address= await userHelper.getAddress(req.session.user._id);


 if(couponcodestatus){
   total2=(couponcode.discount/100)*total1[0].total;
  if(total2>couponcode.discountlimit){
    total2=couponcode.discountlimit;
  }
   totalfinal=total1[0].total-total2
  total=totalfinal
  coupondiscount=total2
 
  res.render('user/checkout',{address,user:req.session.user, index2: true, userasset: true, footerstat: true, cartCount,total1,total2,totalfinal,user:req.session.user,cartproducts,delstatus:true})

}
else{
  totalfinal=total1[0].total
  total=totalfinal
  total2=0;
  coupondiscount=total2

  res.render('user/checkout',{address,user:req.session.user, index2: true, userasset: true, footerstat: true, cartCount,total1,total2,totalfinal,user:req.session.user,cartproducts,delstatus:false,
  expiredcoupon,invalidcoupon, couponused})

}







}catch(err){
  res.render('error')
}
})


// //get invoice
// router.get('/invoice',(req, res) => {
//   res.render('user/invoice')
// })



//add adress
router.post('/addAddress',async(req,res)=>{
  try{
await  userHelper.addAddress(req.body,req.session.user._id).then((response)=>{
  res.redirect('/userEditAddress')
})
}catch(err){
  res.render('error')
}
})



module.exports = router;























