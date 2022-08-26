var db=require('../configure/connection')
var collection=require('../configure/collections');
// const collections = require('../configure/collections');
const bcrypt = require("bcrypt");
const { response } = require("express");
const { ObjectId } = require('mongodb');
const moment = require('moment');

module.exports={
   
adminLogin:(adminbody)=>{
    console.log('came to adminlogin function');
    return new Promise(async (resolve, reject)=>{
        let response = {};
        let admin=await db.get().collection(collection.ADMIN_COLLECTION).findOne({Email:adminbody.mail})
        console.log('fetched for admin mail');

        if(admin){
            if(adminbody.password==admin.Password){
                response.status=true
                response.admin=admin.Email
                resolve(response) 
            }
            else{
                resolve({status:false})
            }
        }
        else{
            resolve({status:false})
        }
    })
},



//add brand
BrandAdd:(newBrand)=>{
    console.log(newBrand)
    return new Promise(async (resolve, reject)=>{
    await db.get().collection(collection.BRAND_COLLECTION).insertOne(newBrand).then((response)=>{
        resolve(response)
    })
})
},


typeAdd:(newType)=>{
    console.log(newType)
    return new Promise(async (resolve, reject)=>{
    await db.get().collection(collection.TYPE_COLLECTION).insertOne(newType).then((response)=>{
        resolve(response)
    })
})
},


deleteType:(typeId)=>{
    console.log(typeId)
    return new Promise((resolve,reject)=>{
        console.log('enterd in to promise');
    db.get().collection(collection.TYPE_COLLECTION).deleteOne({_id:ObjectId(typeId)}).then((response)=>{
        console.log('going to resolve');
        resolve(response)
      })
    })
  },


deleteCategory:(brandId)=>{
    console.log(brandId)
    return new Promise((resolve,reject)=>{
        console.log('enterd in to promise');
    db.get().collection(collection.BRAND_COLLECTION).deleteOne({_id:ObjectId(brandId)}).then((response)=>{
        console.log('going to resolve');
        resolve(response)
      })
    })
  },





  updateCategory:(Bid,Bdata)=>{
    console.log(Bdata);
    return new Promise(async(resolve,reject)=>{
        await db.get().collection(collection.BRAND_COLLECTION).updateOne({_id:ObjectId(Bid)},{
            
            $set:{
                Brandname:Bdata.Brandname
             
                
            }
        }).then((response)=>{
            console.log('gghvhcjgvjhmjc');
            resolve(response)
        })
})
},

updateType:(Tid,Tdata)=>{
    console.log(Tdata);
    return new Promise(async(resolve,reject)=>{
        await db.get().collection(collection.TYPE_COLLECTION).updateOne({_id:ObjectId(Tid)},{
            
            $set:{
                type:Tdata.type
             
                
            }
        }).then((response)=>{
            console.log('gghvhcjgvjhmjc');
            resolve(response)
        })
})
},


getUpdateCategory: (Bid) => {
    console.log(Bid);
    return new Promise(async(resolve, reject) => {
       await db.get()
        .collection(collection.BRAND_COLLECTION)
        .findOne({ _id: ObjectId(Bid) })
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    })
   
  },

  
getUpdateType: (Tid) => {
    console.log(Tid);
    return new Promise(async(resolve, reject) => {
       await db.get()
        .collection(collection.TYPE_COLLECTION)
        .findOne({ _id: ObjectId(Tid) })
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    })
   
  },



  allOrders:()=>{
    return new Promise(async(resolve,reject)=>{
      let allOrders=  await db.get().collection(collection.ORDER_COLLECTION).find().toArray()
    resolve(allOrders)
    })
    
  },


  updateStatus:(changeStatus,orderId)=>{
    return new Promise(async(resolve,reject)=>{
        if(changeStatus=='cancelled')
        {
        await db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:ObjectId(orderId)},{
            
            $set:{
                status:changeStatus,
                cancelStatus:true
             
                
            }
        })
        resolve(response)


    }
    else     if(changeStatus=='deliverd')
    {
    await db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:ObjectId(orderId)},{
        
        $set:{
            status:changeStatus,
            returnStatus:true,
            cancelStatus:true

         
            
        }
    })
    resolve(response)


}


else{
        await db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:ObjectId(orderId)},{
            
            $set:{
                status:changeStatus
                
             
                
            }
        })
    resolve(response)

    }
    }).then((response)=>{

    })
  },



  codTotal:()=>{
    return new Promise(async(resolve,reject)=>{
      let cod=  await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
            $match: {
                paymentMethod:'COD'
            }
        },
        // {
        //     $unwind:'$totalAmount'
        // },
        {
            $project:{
                total:'$totalAmount'
            }
        
        },{
            $group:{
                _id:null,
                totalAmount:{$sum:'$total'}
            }
        }
      
      ]).toArray()
      console.log('cod is hered');
      console.log(cod[0]);
      resolve(cod[0].totalAmount)
    //   console.log(cod[0].TotalAmount);
    //   resolve(cod[0].TotalAmount);
    })

  },

  paypalTotal:()=>{
    return new Promise(async(resolve,reject)=>{
      let cod=  await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
            $match: {
                paymentMethod:'ONLINE paypal'
            }
        },
     
        {
            $project:{
                total:'$totalAmount'
            }
        
        },{
            $group:{
                _id:null,
                totalAmount:{$sum:'$total'}
            }
        }
      
      ]).toArray()
      console.log('cod is hered');
      console.log(cod[0].totalAmount);
      resolve(cod[0].totalAmount)
  
    })

  },


  rasorpayTotal:()=>{
    return new Promise(async(resolve,reject)=>{
      let cod=  await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
            $match: {
                paymentMethod:'ONLINE razor'
            }
        },
        // {
        //     $unwind:'$totalAmount'
        // },
        {
            $project:{
                total:'$totalAmount'
            }
        
        },{
            $group:{
                _id:null,
                totalAmount:{$sum:'$total'}
            }
        }
      
      ]).toArray()
      console.log('cod is hered');
      console.log(cod[0].totalAmount);
      resolve(cod[0].totalAmount)
    //   console.log(cod[0].TotalAmount);
    //   resolve(cod[0].TotalAmount);
    })

  },




  addCoupons: (couponDetails) => {
    couponDetails.dateCreated=moment().format()
   let expiryDate=moment().add(couponDetails.validitydays,'d')
   couponDetails.expiryDate=expiryDate.format()
   couponDetails.discount=parseInt(couponDetails.discount)
   couponDetails.discountlimit=parseInt(couponDetails.discountlimit)
    couponDetails.usedUser=[];
        return new Promise(async (resolve, reject) => {
        let response = {};
        let couponExist = await db.get().collection(collection.COUPON_COLLECTION).findOne({couponcode:couponDetails.couponcode} )
        if (!couponExist) {
        
            await db.get().collection(collection.COUPON_COLLECTION).insertOne(couponDetails).then((Response) => {
                console.log('coupon is added');
                
                resolve({ status:true});
            })
        } else {
            console.log('coupon already exists');
            resolve({ status: false});
        }
    })
},



getAllCoupons:()=>{
    return new Promise(async (resolve, reject) => {
       let allCoupons=await db.get().collection(collection.COUPON_COLLECTION).find().toArray()
        resolve(allCoupons)    
 })
},


deleteCoupon:(cid)=>{
    console.log('enetrinf admin helper');
    console.log(cid)
    return new Promise(async (resolve, reject) => {
       await db.get().collection(collection.COUPON_COLLECTION).deleteOne({_id:ObjectId(cid)}).then((response)=>{

       })
       resolve()     
  })
},


addOfferBrand:(offer)=>{
   return new Promise(async(resolve, reject) => {
      offerexists=await db.get().collection(collection.OFFER_COLLECTION).findOne({brand:offer.brand})


    if(!offerexists){

     await db.get().collection(collection.OFFER_COLLECTION).insertOne(offer).then((response)=>{


         console.log(response);
         resolve({status:true})
     })
    }else{
        resolve({status:false})
    }




   })
},


addOfferCategory:(offer)=>{
    return new Promise(async(resolve, reject) => {
       offerexists=await db.get().collection(collection.OFFER_COLLECTION).findOne({type:offer.type})
 
 
     if(!offerexists){
 
      await db.get().collection(collection.OFFER_COLLECTION).insertOne(offer).then((response)=>{
 
 
          console.log(response);
          resolve({status:true})
      })
     }else{
         resolve({status:false})
     }
 
 
 
 
    })
 },



deleteOfferBrand:(offerId,brand)=>{
    return new Promise(async(resolve, reject) => {

       let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({brand:brand} ).toArray()
      console.log(products);

      if(products){
        products.map((products) => {
            
          db.get().collection(collection.PRODUCT_COLLECTION).updateMany({ _id:ObjectId(products._id) },

          {
            $set: {
              discountstatus:false,
              discountpercent:0,
              priceafterdiscount: 0,
              pricediscount:0

              
            }
          })
        })

      }

       await db.get().collection(collection.OFFER_COLLECTION).deleteOne({_id:ObjectId(offerId)})
       resolve()
    })
}
,



deleteOfferCategory:(offerId,type)=>{
    return new Promise(async(resolve, reject) => {

       let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({type:type} ).toArray()
      console.log(products);

      if(products){
        products.map((products) => {
            
          db.get().collection(collection.PRODUCT_COLLECTION).updateMany({ _id:ObjectId(products._id) },

          {
            $set: {
              discountstatus:false,
              discountpercent:0,
              priceafterdiscount: 0,
              pricediscount:0
              
            }
          })
        })

      }

       await db.get().collection(collection.OFFER_COLLECTION).deleteOne({_id:ObjectId(offerId)})
       resolve()
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


  addBanner:(banner)=>{
    return new Promise((resolve, reject)=>{
        db.get().collection(collection.BANNER_COLLECTION).insertOne(banner).then((response)=>{

        })
        resolve(response);
    })
  },



  getBanner:()=>{
   return new Promise(async(resolve,reject)=>{
    let banner=db.get().collection(collection.BANNER_COLLECTION).find().toArray()
   resolve(banner)

   })
  },


  deleteBanner:(bid)=>{
    return new Promise(async(resolve,reject)=>{
        await db.get().collection(collection.BANNER_COLLECTION).deleteOne({_id:ObjectId(bid)})
        resolve()
    })

  }















}