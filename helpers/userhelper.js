var db=require('../configure/connection')
var collection=require('../configure/collections');
// const collections = require('../configure/collections');
const client = require('twilio')(collection.accountSID,collection.authToken);

const bcrypt = require("bcrypt");
const { response } = require("express");
// const { ObjectId } = require('mongodb');
var ObjectId=require('mongodb').ObjectId

const moment = require('moment');


const Razorpay = require('razorpay');
const { resolve } = require('path');
var instance = new Razorpay({
  key_id: 'rzp_test_G99RqKoq7szDDO',
  key_secret: 'VeiZw55QTF7pO63hunRoZ7bp',
});


const paypal = require('paypal-rest-sdk');
 
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AUplwZ9LOZdUZHmQlvrDDnL0lve3kenUh7E_Z7OVVsBtCRy6AIe1oLPya1Nd2V_4iv895J2NDMA_QlaS',
  'client_secret': 'ENO_yYAXSiIa2uzwg6C2WSrJ5rnrYegFkc3CPoI7dlqJi0xPM1WwOjDOdkgv1r_pMrNjabmP0SegObUK'
});


module.exports={



  Signup: (userBody) => {
    console.log(userBody)
    return new Promise(async (resolve, reject) => {
        // userBody.password = await bcrypt.hash(userBody.password, 10)

        let response = {};
        let userExist = await db.get().collection(collection.USER_COLLECTION).findOne({ mail: userBody.mail})

        // let userExist = await db.get().collection(collections.USER_COLLECTION).findOne({Phone:userBody.Phone})
        console.log(userExist);
        if (userExist) {
            response.status =false
            response.signupStatus = true
            resolve(response)
        }
        else {
            console.log(userBody);
            userBody.blockStatus = true
            userBody.userStatus=true
            userBody.status=true;
            userBody.password = await bcrypt.hash(userBody.password, 10)
            // response.status = true;
            console.log(userBody);
            response = userBody;
            console.log("code is here to send otp");
            client.verify.services(collection.serviceID).verifications.create(
                {
                    to: `+91${response.phone}`,
                    channel: 'sms'
                }).then((data) => {

                })
            resolve(response)
        }
    })


},
signupOtp: (otp, userDetails) => {
  userDetails.wallet=parseInt(userDetails.wallet);
  console.log('here we go');
  console.log(userDetails);
    return new Promise((resolve, reject) => {
      console.log('enter in to signupotp promise');
      console.log('ijijijijjiji');
      console.log(userDetails.phone);

        let response = {};
        console.log('heheheheh');
        client.verify.services(collection.serviceID)
            .verificationChecks
            .create({
                to: `+91${userDetails.phone}`,
                code: otp.otp
            })
            .then((verification_check) => {
              console.log('printing verification status');
                console.log(verification_check.status);
                if (verification_check.status == 'approved') {
                  

                    db.get().collection(collection.USER_COLLECTION).insertOne(userDetails).then((data) => {
                        resolve(userDetails)
                    })
                } else {
                    response.err = 'Otp Is Not Valid';
                    console.log(response);
                    resolve(response)
                }
            });
    })
},

phonenumberCheck:(phonenumber)=>{
  console.log(phonenumber.number)
return new Promise(async(resolve, reject) => {
let userStored=await db.get().collection(collection.USER_COLLECTION).findOne({phone:phonenumber.number})
console.log(userStored);
 
 if(userStored) {

  client.verify.services(collection.serviceID).verifications.create(
    {
        to: `+91${phonenumber.number}`,
        channel: 'sms'
    }).then((data) => {

    })

  resolve({response:true,userStored})
 }
 else{
  resolve({response:false})
 }





})
},

phonenumberCheckVerify:(otp,user)=>{


  return new Promise((resolve, reject) => {
    let response = {};
   

    
      client.verify.services(collection.serviceID)
          .verificationChecks
          .create({
              to: `+91${user.phone}`,
              code: otp.otp
          })
          .then((verification_check) => {
            console.log('printing verification status');
              console.log(verification_check.status);
              if (verification_check.status == 'approved') {
                response.trick=true;
                response.user = user;
                response.status = true;
                resolve(response);



                

               } else {

                response.user = user;
                  response.status = false;
                  resolve(response);


                 
              }
          });
  })

},





      getAllUsers: () => {
        return new Promise(async (resolve, reject) => {
          let users = await db
            .get()
            .collection(collection.USER_COLLECTION)
            .find()
            .toArray();
          // console.log(users);
          resolve(users);
        });
      },


      unblockUser:(userId)=>{
        return new Promise(async(resolve,reject)=>{
          await db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userId)},{
            $set:{
          userStatus:true
          }
        }).then((response)=>{
            resolve(response)
          })
        })
      },

      blockUser:(userId)=>{
        return new Promise(async(resolve,reject)=>{
         await db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userId)},{
            $set:{
          userStatus:false
          }
        }).then((response)=>{
            resolve(response)
          })
        })
      },



      userLogin:(userbody)=>{
        console.log(userbody);
        console.log('came to adminlogin function');
        return new Promise(async (resolve, reject)=>{
            let response = {};
            let user=await db.get().collection(collection.USER_COLLECTION).findOne({mail:userbody.mail})
            console.log('fetched for user mail');
            console.log(user);
    
            if(user){
              bcrypt.compare(userbody.password, user.password).then((status) => {
                console.log(status);
                console.log('password checked');
                if (status) {
                  response.trick=true;
                  response.user = user;
                  response.status = true;
                  resolve(response);
                } else  { 
                  response.user = user;
                  response.status = false;
                  resolve(response);
                }
              });
              
             
            }
            else{
                // response.user = user;
                response.status = false;
                resolve(response);
            }
        })
    },



    addToCart:(pid,uid)=>{
      let proObj={
        item:ObjectId(pid),
        quantity:1
      }
      return new Promise(async(resolve, reject) => {
        console.log('enterd addtocarthelper');
        let userCart=await db.get().collection(collection.CART_COLLECTION).findOne({user:ObjectId(uid)});

        if(userCart){
          let proExist=userCart.products.findIndex(product=> product.item==pid)
          console.log(proExist);
          console.log(' updating existng id');
          if(proExist!=-1){
             db.get().collection(collection.CART_COLLECTION).updateOne({user:ObjectId(uid),'products.item':ObjectId(pid)},
             {
               $inc:{'products.$.quantity':1}
             }).then(()=>{
              resolve();
             })
          }
          else{

          
               db.get().collection(collection.CART_COLLECTION).updateOne({user:ObjectId(uid)},{
                $push:{products:proObj}
               }).then((response) => {
                resolve()
               })
        }
      }
        else{
          console.log('creating new id');
             let cartobj={
              user:ObjectId(uid),
              products:[proObj]
             }
             db.get().collection(collection.CART_COLLECTION).insertOne(cartobj).then((response)=>{
              resolve()
             })
        }
      
      })
    },





    getCartProducts:(uid)=>{
        return new Promise(async(resolve, reject)=>{
          let cartItems= await db.get().collection(collection.CART_COLLECTION).aggregate([
            {
              $match: {user:ObjectId(uid)}
            },
            {
              $unwind:'$products'
            },{
              $project:{
                item:'$products.item',
                quantity:'$products.quantity'
              }
            },{
              $lookup:{
                from:collection.PRODUCT_COLLECTION,
                localField:'item',
                foreignField:'_id',
                as:'product'
              }
            },





          {
            $project:{
              item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
            }
          }

  
          ]).toArray()
          // resolve(cartItems);
          resolve(cartItems)
        })
    },





    getCartCount:(uid)=>{
        return new Promise(async(resolve, reject) => {
          let count=0;
          let cart= await db.get().collection(collection.CART_COLLECTION).findOne({user:ObjectId(uid)})
          if(cart){
            count=cart.products.length;
          }
          console.log('cart count is '+count);
          resolve(count)
        })
    },


    changeProductQuantity:(details)=>{
      details.count=parseInt(details.count)
      details.quantity=parseInt(details.quantity)


      return new Promise((resolve, reject)=>{
        if(details.count==-1 && details.quantity==1){
          db.get().collection(collection.CART_COLLECTION).updateOne({_id:ObjectId(details.cart)},
          {
            $pull:{products:{item:ObjectId(details.product)}}
          }
          )
          .then((response)=>{
            resolve({removeProduct:true})
          })
          
        }
        else{


        db.get().collection(collection.CART_COLLECTION).updateOne({_id:ObjectId(details.cart),'products.item':ObjectId(details.product)},
        {
          $inc:{'products.$.quantity':details.count}
        }
        ).then((response)=>{
         resolve({status:true});
        })

      }

      })
    },




    removeCartProduct:(details)=>{

      return new Promise((resolve, reject)=>{
      db.get().collection(collection.CART_COLLECTION).updateOne({_id:ObjectId(details.cart)},
      {
        $pull:{products:{item:ObjectId(details.product)}}
      }
      )
      .then((response)=>{
        resolve({removeProduct:true})
      })

    })



    },







    getTotalAmount:(userId)=>{
      console.log('printing userid from gettotalamount user helper');
      console.log(userId);
      return new Promise(async(resolve, reject)=>{                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
        let total= await db.get().collection(collection.CART_COLLECTION).aggregate([
          {
            $match: {user:ObjectId(userId)}
          },
          {
            $unwind:'$products'
          },{
            $project:{
              item:'$products.item',
              quantity:'$products.quantity'
            }
          },{
            $lookup:{
              from:collection.PRODUCT_COLLECTION,
              localField:'item',
              foreignField:'_id',
              as:'product'
            }
          },

         {
          $project:{
            item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
          }
        },

       

         { 
            
          $project:{
            
            total:
             
               {
                 $cond: { if: { $lte: [ "$product.priceafterdiscount", 0 ] }, then: {$sum:{$multiply:['$quantity','$product.Price']}}, else: {$sum:{$multiply:['$quantity','$product.priceafterdiscount']}} }
               }

           }
          
        },

        {
          $group:{
            _id:null,
            total:{$sum:'$total'}
          }
        }
        


        ]).toArray()
        console.log(total);
        console.log('printng total');
        resolve(total)
      })
    },



    placeOrder:(order,products,total,coupondetails,uid,totalbeforewallet,coupondiscount,walletdiscount)=>{
      console.log('order is  ',order);
           return new Promise(async(resolve, reject)=>{

     let orderaddress = await db.get().collection(collection.ADDRESS_COLLECTION).findOne({_id:ObjectId(order.addressid)})


     console.log('payment method is',order['payment-method']);
              

            let status=order['payment-method']=='COD'||'wallet'?'placed':'pending'
            console.log(status);
            if(status=='pending'){
              cancelStatus=true
            }
            else{
              cancelStatus=false
            }

        let productinvoice= await db.get().collection(collection.CART_COLLECTION).aggregate([

          {
            $match: {user:ObjectId(uid)}
          },
          {
            $unwind:'$products'
          },
          {
            $project:{
              item:'$products.item',
              quantity:'$products.quantity'
            }
          },{
            $lookup:{
              from:collection.PRODUCT_COLLECTION,
              localField:'item',
              foreignField:'_id',
              as:'product'
            }
          },
          
         {
          $project:{
            item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
          }
        },


        ]).toArray()
            


            let orderObj={}

            if(order['payment-method']=='wallet'||'COD'){
                
             orderObj={
              deliveryDetails:{
                name:orderaddress.name,
                mobile:orderaddress.mobile,
                address:orderaddress.address,
                pincode:orderaddress.pincode
              },
              userId:ObjectId(orderaddress.uid),      
              paymentMethod:order['payment-method'],
              products:products,
              totalAmount:totalbeforewallet,
              coupondiscount:coupondiscount,
              walletdiscount:walletdiscount,
              status:status,
              returnstatus:false,
              cancelStatus:cancelStatus,
              date:moment().format("MMM Do YY"),
              productinvoice:productinvoice
            }

            }else{

             orderObj={
              deliveryDetails:{
                name:orderaddress.name,
                mobile:orderaddress.mobile,
                address:orderaddress.address,
                pincode:orderaddress.pincode
              },
              userId:ObjectId(orderaddress.uid),      
              paymentMethod:order['payment-method'],
              products:products,
              totalAmount:total,
              coupondiscount:coupondiscount,
              walletdiscount:walletdiscount,
              status:status,
              returnstatus:false,
              cancelStatus:cancelStatus,
              date:moment().format("MMM Do YY"),
              productinvoice:productinvoice

            }

          }



            console.log('order obj in place order is    '+  orderObj.totalAmount);
            console.log('user id is    '+  uid);
            // console.log('couponcode is'+ couponcode);
            
           db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
            // db.get().collection(collection.CART_COLLECTION).deleteOne({user:ObjectId(order.userId)})
            // console.log('order id from userhelper is ',response.insertedId);
            // console.log('response from userhelper is ',response);
            if(coupondetails){
              db.get().collection(collection.COUPON_COLLECTION).updateOne({couponcode:coupondetails.couponcode},{
                $push:{
                           usedUser:uid
                }
              })
            }
            resolve(response.insertedId)
           })
        
           })
    },




    getCartProductList:(userId)=>{
      return new Promise(async(resolve, reject) => {
          let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:ObjectId(userId)});
          console.log(cart.products);
          resolve(cart.products)
      })
    },



    getUserOrders:(userId)=>{
      return new Promise(async(resolve, reject) =>{
        let orders = await db.get().collection(collection.ORDER_COLLECTION).find({userId:ObjectId(userId)}).toArray()
        console.log(orders);
        resolve(orders)
      })
    },



    getOrderProducts:(orderId)=>{

      
      return new Promise(async(resolve, reject)=>{
        let orderItems= await db.get().collection(collection.ORDER_COLLECTION).aggregate([
          {
            $match: {_id:ObjectId(orderId)}
          },
          {
            $unwind:'$productinvoice'
          },
          {
               $project:{
                quantity:'$productinvoice.quantity',
                mrp:'$productinvoice.product.Price',
                unitdiscount:'$productinvoice.product.pricediscount',
                unitprice:'$productinvoice.product.priceafterdiscount',
                coupondiscount:'$coupondiscount',
                walletdiscount:'$walletdiscount',
                address:'$deliveryDetails',
                discountstatus:'$productinvoice.product.discountstatus'



               }
          },
          {
            $project: {
              quantity:1,
              mrp:1,
              unitdiscount:1,
              unitprice:1,
              coupondiscount:1,
              walletdiscount:1,
              discountstatus:1,
              grandTotal: { $sum: { $multiply: [{ $toInt: '$quantity' }, { $toInt: '$mrp' }] } },
              discount: { $sum: { $multiply: [{ $toInt: '$quantity' }, { $toInt: '$unitdiscount' }] } },
              subtotal: {
                $cond: {
                    if: "$discountstatus", then:  { $sum: { $multiply: [{ $toInt: '$quantity' }, { $toInt: '$unitprice' }] } }, else:  { $sum: { $multiply: [{ $toInt: '$quantity' }, { $toInt: '$mrp' }] } }
                }
            },
              address:1,


      

            }
          },

          {
            $project: {
              quantity:1,
              mrp:1,
              unitdiscount:1,
              unitprice:1,
              coupondiscount:1,
              walletdiscount:1,
              discountstatus:1,
              grandTotal:1,
              discount:1,
              subtotal:1,
              address:1,
          
              
            }
          },
          { 
            
            $group:{
              _id:null,
              overallgrandtotal:{$sum:'$grandTotal'},
              overalldiscount:{$sum:'$discount'},
              overallsubtotal:{$sum:'$subtotal'},
              
            }
          },
          {
            $project: {
              overallgrandtotal:1,
              overalldiscount:1,
              overallsubtotal:1,
              quantity:1,
              mrp:1,
              unitdiscount:1,
              unitprice:1,
              coupondiscount:1,
              walletdiscount:1,
              discountstatus:1,
              grandTotal:1,
              discount:1,
              subtotal:1,
           
              address:1,
            }
          }



        ]).toArray()
        // resolve(cartItems);
        console.log('printng get order producta resolve user helper');
        console.log(orderItems);
        resolve(orderItems)
      })




    },




    getOrderProductsinvoice:(orderId)=>{

      
      return new Promise(async(resolve, reject)=>{
        let orderItems= await db.get().collection(collection.ORDER_COLLECTION).aggregate([
          {
            $match: {_id:ObjectId(orderId)}
          },
          {
            $unwind:'$productinvoice'
          },
          {
               $project:{
                quantity:'$productinvoice.quantity',
                mrp:'$productinvoice.product.Price',
                unitdiscount:'$productinvoice.product.pricediscount',
                unitprice:'$productinvoice.product.priceafterdiscount',
                coupondiscount:'$coupondiscount',
                walletdiscount:'$walletdiscount',
                address:'$deliveryDetails',
                discountstatus:'$productinvoice.product.discountstatus',
                image:'$productinvoice.product.image',
                name:'$productinvoice.product.Name',
                date:'$date',
                discountpercent:'$productinvoice.product.discountpercent'





               }
          },
          {
            $project: {
              quantity:1,
              mrp:1,
              unitdiscount:1,
              unitprice:1,
              coupondiscount:1,
              walletdiscount:1,
              discountstatus:1,
              grandTotal: { $sum: { $multiply: [{ $toInt: '$quantity' }, { $toInt: '$mrp' }] } },
              discount: { $sum: { $multiply: [{ $toInt: '$quantity' }, { $toInt: '$unitdiscount' }] } },
              subtotal: {
                $cond: {
                    if: "$discountstatus", then:  { $sum: { $multiply: [{ $toInt: '$quantity' }, { $toInt: '$unitprice' }] } }, else:  { $sum: { $multiply: [{ $toInt: '$quantity' }, { $toInt: '$mrp' }] } }
                }
            },
              address:1,
              image:1,
              name:1,
              date:1,
              discountpercent:1


      

            }
          },

          {
            $project: {
              quantity:1,
              mrp:1,
              unitdiscount:1,
              unitprice:1,
              coupondiscount:1,
              walletdiscount:1,
              discountstatus:1,
              grandTotal:1,
              discount:1,
              subtotal:1,
              address:1,
              image:1,
              name:1,
              date:1,
              discountpercent:1
              
              
            }
          },





        ]).toArray()
        // resolve(cartItems);
        console.log('printng invoice details resolve user helper');
        console.log(orderItems);
        resolve(orderItems)
      })




    },



  






    

    // getOrderProducts:(orderId)=>{

      
    //   return new Promise(async(resolve, reject)=>{
    //     let orderItems= await db.get().collection(collection.ORDER_COLLECTION).aggregate([
    //       {
    //         $match: {_id:ObjectId(orderId)}
    //       },
    //       {
    //         $unwind:'$products'
    //       },{
    //         $project:{
    //           item:'$products.item',
    //           quantity:'$products.quantity'
    //         }
    //       },{
    //         $lookup:{
    //           from:collection.PRODUCT_COLLECTION,
    //           localField:'item',
    //           foreignField:'_id',
    //           as:'product'
    //         }
    //       },





    //     {
    //       $project:{
    //         item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
    //       }
    //     }


    //     ]).toArray()
    //     // resolve(cartItems);
    //     console.log('printng get order producta resolve user helper');
    //     console.log(orderItems);
    //     resolve(orderItems)
    //   })




    // },




    generateRazorpay:(orderId,total)=>{
      console.log('order id is', orderId);
      console.log('total is',total);
return new Promise((resolve, reject) => {
  var options = {
    amount: total*100,  // amount in the smallest currency unit
    currency: "INR",
    receipt: ""+orderId
  };
  instance.orders.create(options, function(err, order) {
    if(err){
      console.log(err);
    }else{

      console.log('razor pay order',order);
      console.log(order);
      resolve(order)
    }
  });

})
    },


verifypayment:(details,uid)=>{
  console.log('printng details')
  console.log(details);
  return new Promise(async(resolve, reject) => {
    let crypto = require('crypto');
    let hash = crypto.createHmac('sha256', 'VeiZw55QTF7pO63hunRoZ7bp')
                   .update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]'])
                   .digest('hex');
                   console.log(hash);
                   if(hash==details['payment[razorpay_signature]']){
                      await db.get().collection(collection.CART_COLLECTION).deleteOne({user:ObjectId(uid)})
                       
                    resolve()
                   }
                   else{
                    reject()
                   }
  })
},



changePaymentStatus:(orderId,userId)=>{
  return new Promise((resolve, reject)=>{
    db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:ObjectId(orderId)},
    {
         $set: { 
          status:'placed',
          cancelStatus:false
          }
    }
    ).then(()=>{

db.get().collection(collection.CART_COLLECTION).deleteOne({user:ObjectId(userId)})

      resolve()
    })
  })

},


genaratePaypal: (orderId, total) => {

        
  return new Promise((resolve, reject) => {
    console.log('orderi and total is    '+ orderId +'  ' + total);
      const create_payment_json = {
          "intent": "sale",
          "payer": {
              "payment_method": "paypal"
          },
          "redirect_urls": {
              "return_url": "http://localhost:3000/success",
              "cancel_url": "http://localhost:3000/cancel"
          },
          "transactions": [{
              "item_list": {
                  "items": [{
                      "name": "Red Sox Hat",
                      "sku": "001",
                      "price": total,
                      "currency": "USD",
                      "quantity": 1
                  }]
              },
              "amount": {
                  "currency": "USD",
                  "total": total
              },
              "description": "Hat for the best team ever"
          }] 
      };
      
      paypal.payment.create(create_payment_json, function (error, payment) {
          if (error) {
              throw error;
          } else {
            console.log('printing before resolve ppayment')
              resolve(payment)
          }
      });

  })

},


cancelOrder:(orderId,userId)=>{
  console.log('enterd into cancel order user helper');
  console.log(orderId,userId);

  return new Promise(async(resolve,reject)=>{
    let order=await db.get().collection(collection.ORDER_COLLECTION).findOne({_id:ObjectId(orderId)})
    orderamount=order.totalAmount;
    console.log(order.totalAmount);
    console.log('order is   '+ order);
    if(order.paymentMethod=='COD'){

    }
      else{

        await db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userId)},{$inc:{wallet:orderamount}})
      }
    
    await db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:ObjectId(orderId)},{$set:{status:'cancelled',cancelStatus:'true'}})
    
    
  })

},


deductfromwallet:(uid,bal)=>{
return new Promise(async(resolve, reject)=>{
  await db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(uid)},{$set:{wallet:bal}})
  resolve()

})
},


returnOrder:(orderId,userId)=>{
  console.log('enterd into cancel order user helper');
  console.log(orderId,userId);

  return new Promise(async(resolve,reject)=>{
    let order=await db.get().collection(collection.ORDER_COLLECTION).findOne({_id:ObjectId(orderId)})
    orderamount=order.totalAmount;
    console.log(order.totalAmount);
    console.log('order is   '+ order);
    await db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userId)},{$inc:{wallet:orderamount}})
    await db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:ObjectId(orderId)},{$set:{status:'return',returnStatus:false}})
    
    
  })

},






updatePassword:(password,uid)=>{
  console.log(password);
  console.log(uid);
  return new Promise(async(resolve,reject)=>{
    await db.get().collection(collection.USER_COLLECTION).findOne({_id:ObjectId(uid)}).then((response)=>{
      
      ( bcrypt.compare(password.currentpassword, response.password)).then(async(status) => {
        console.log('status is   '+ status);
        if(status){
          password.newpassword=await bcrypt.hash(password.newpassword, 10)
          await db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(uid)},
          {
            $set:{
              password:password.newpassword
            }
          }
          )
          resolve(status);

        }
        else{
          console.log('going back to route');
          resolve(status);
        }
      })
      
      
    
    })
  })

},



applyCoupon:(code,userId)=>{
 
   return new Promise(async(resolve,reject)=>{

 let couponcode= await db.get().collection(collection.COUPON_COLLECTION).findOne({couponcode:code.code})
 if(couponcode){


    if(moment().format()>response.expiryDate){

      resolve({expiredcoupon:true})
    }else{
      let ExistUser=couponcode.usedUser.includes(userId)
      if(ExistUser){
        resolve({validcoupon:false})
        

      }
      else{

        resolve({validcoupon:true,couponcode})

      }
    }
  }
  else{

    resolve({invalidcoupon:true})
  }
  
  })
 




},


walletCheck:(orderId,total,userId)=>{
  return new Promise(async(resolve,reject)=>{
  
    let user=await db.get().collection(collection.USER_COLLECTION).findOne({_id:ObjectId(userId)})
    console.log('user issss'+ user);
    walletamount=user.wallet;
 
    if(total>walletamount){
      amountafterwallet=total-walletamount;
  

      await db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userId)},
      {
        $set:{
          wallet:0
        }
      }
      )
      resolve({amountafterwallet,walletpending:true})
    }
    else{
      walletamount=walletamount-total;
      // walletamount=parseInt(walletamount)
      await db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userId)},
      {
        $set:{
          wallet:walletamount
        }
      }
      )
      resolve({walletsuccess:true})
    }

  })

   







},

movecart:(uid)=>{
  return new Promise(async (resolve, reject)=>{
  db.get().collection(collection.CART_COLLECTION).deleteOne({user:ObjectId(uid)})
  resolve()
  })

},

getUserdetails:(uid)=>{
  return new Promise(async (resolve, reject)=>{
    db.get().collection(collection.USER_COLLECTION).findOne({_id:ObjectId(uid)}).then((response)=>{
     resolve(response)
  })
})



},


addAddress:(address,uid)=>{
  // console.log('address is '+ address);
  console.log('uid is '+ uid);
    return new Promise(async (resolve, reject)=>{
      userAddress={}
      userAddress=address
      userAddress.uid=uid
    await db.get().collection(collection.ADDRESS_COLLECTION).insertOne(userAddress).then((response)=>{

     resolve(response)
    })

    })
  },


  getAddress:(uid)=>{
    console.log(uid);
   return new Promise(async (resolve, reject)=>{
  let address= await db.get().collection(collection.ADDRESS_COLLECTION).find({uid:uid}).toArray()
    console.log('printng all adderess');
    console.log(address);
         resolve(address)
   
  })
  },



  deleteAdress:(aid)=>{
    return new Promise(async (resolve, reject)=>{
      db.get().collection(collection.ADDRESS_COLLECTION).deleteOne({_id:ObjectId(aid)}).then((response)=>{
        resolve(response)
    })
  })
},




getBanner:()=>{
  return new Promise(async(resolve,reject)=>{
   let banner=db.get().collection(collection.BANNER_COLLECTION).find().toArray()
  resolve(banner)

  })
 },
    



}

































