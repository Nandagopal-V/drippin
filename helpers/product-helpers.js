var db=require('../configure/connection')
var collection=require('../configure/collections')
const { response } = require('express')
const { log } = require('handlebars')
var objectid=require('mongodb').ObjectId

module.exports={



    addProduct:(product)=>{
      
        product.Price=parseInt(product.Price)
        // product.pricediscount=product.Price
        // product.pricediscount=parseInt(product.pricediscount)

        product.priceafterdiscount=0
      

        return new Promise(async(resolve,reject)=>{
           
           await db.get().collection('product1').insertOne(product).then((data)=>{
                
            })

            let brandDetails= await db.get().collection(collection.BRAND_COLLECTION).findOne({Brandname:product.brand})
            let typeDetails= await db.get().collection(collection.TYPE_COLLECTION).findOne({type:product.type})

           console.log(product.brand)
           console.log(brandDetails);
            await db.get().collection('product1').updateOne({_id:objectid(product._id)},{
                
                $set:{
                    brand:brandDetails._id,
                    type:typeDetails._id,
                    discountstatus:false
                 
                    
                }
            })
            resolve({status:true})
        })

    },
    
    

    getAllProduct:()=>{
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },


    deleteProduct:(proId)=>{
        console.log('entered in to delete product function');
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:objectid(proId)}).then((response)=>{
                resolve(response)
                console.log('printng resolve ');
                console.log(response);
            })
        })
    },




    editUser: (userId) => {
        return new Promise((resolve, reject) => {
          db.get()
            .collection(collection.PRODUCT_COLLECTION)
            .findOne({ _id: objectid(userId) })
            .then((response) => {
              console.log(response);
              resolve(response);
            });
        });
      },



      updateProductDetails:(pid,pdata)=>{
        console.log(pdata);
        return new Promise(async(resolve,reject)=>{
            let brandDetails= await db.get().collection(collection.BRAND_COLLECTION).findOne({Brandname:pdata.brand})
            let typeDetails= await db.get().collection(collection.TYPE_COLLECTION).findOne({type:pdata.type})

            await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectid(pid)},{
                
                $set:{
                    Name:pdata.Name,
                    Price:pdata.Price,
                    Description:pdata.Description,
                    gender:pdata.gender,
                    brand:brandDetails.Brandname,
                    size:pdata.size,
                    type:typeDetails.type,
                    image:pdata.image
                    
                }
            }).then((response)=>{
                console.log('gghvhcjgvjhmjc');
                resolve(response)
            })
    })
},

findOneProduct:(userId) => {
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectid(userId) })
        .then((response)=>{
            console.log(response);
            resolve(response);
        }).catch((e)=>{
            console.log('error is here');
            reject(e)
        })
        
    })
},



getAllBrands:()=>{
    return new Promise(async(resolve,reject)=>{
    let allbarands=    await db.get().collection(collection.BRAND_COLLECTION).find().toArray()
        resolve(allbarands)
    })
},



getAllTypes:()=>{
    return new Promise(async(resolve,reject)=>{
    let allTypes=    await db.get().collection(collection.TYPE_COLLECTION).find().toArray()
        resolve(allTypes)
    })
},


applyOfferBrand:(brand,offer)=>{
    offer.offerdiscount=parseInt(offer.offerdiscount)
    
    


return new Promise(async(resolve,reject)=>{

let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({brand:brand} ).toArray()
      console.log(products);

      if (products.length!=0) {
        console.log('if if if if if');
        products.map((products) => {
          let newTotal = products.Price - products.Price * (offer.offerdiscount / 100)
          let discountprice=products.Price-newTotal


          console.log(newTotal);

          db.get().collection(collection.PRODUCT_COLLECTION).updateMany({ _id: objectid(products._id) },

            {
              $set: {
                discountstatus:true,
                discountpercent:offer.offerdiscount,
                priceafterdiscount: newTotal,
                pricediscount:discountprice

                
              }
            })

          resolve({noproduct:false})
        })


}
else{
    console.log('eeeellllsseeee');

    resolve({noproduct:true})
}
})
},




applyOfferCategory:(type,offer)=>{
    offer.offerdiscount=parseInt(offer.offerdiscount)
    
    


return new Promise(async(resolve,reject)=>{

let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({type:type} ).toArray()
      console.log(products);

      if (products.length!=0) {
        console.log('if if if if if');
        products.map((products) => {
          let newTotal = products.Price - products.Price * (offer.offerdiscount / 100)
          let discountprice=products.Price-newTotal

          console.log(newTotal);

          db.get().collection(collection.PRODUCT_COLLECTION).updateMany({ _id: objectid(products._id) },

            {
              $set: {
                discountstatus:true,
                discountpercent:offer.offerdiscount,
                priceafterdiscount: newTotal,
                pricediscount:discountprice
                
              }
            })

          resolve({noproduct:false})
        })


}
else{
    console.log('eeeellllsseeee');

    resolve({noproduct:true})
}
})
},




findOneBrand:(offer) => {
    console.log(offer)
    return new Promise(async(resolve,reject)=>{
        await db.get().collection(collection.BRAND_COLLECTION).findOne({ Brandname:offer.brand }).then((response)=>{
            console.log(response);
            resolve(response._id);
        })
        
    })
},



findOneCategory:(offer) => {
    console.log(offer)
    return new Promise(async(resolve,reject)=>{
        await db.get().collection(collection.TYPE_COLLECTION).findOne({ type:offer.type}).then((response)=>{
            console.log(response);
            resolve(response._id);
        })
        
    })
},





findOneBrand1:(offer) => {
    console.log(offer)
    return new Promise(async(resolve,reject)=>{
        await db.get().collection(collection.BRAND_COLLECTION).findOne({ Brandname:offer}).then((response)=>{
            console.log(response);
            resolve(response._id);
        })
        
    })
},




findOneCategory1:(offer) => {
    console.log(offer)
    return new Promise(async(resolve,reject)=>{
        await db.get().collection(collection.TYPE_COLLECTION).findOne({ type:offer}).then((response)=>{
            console.log(response);
            resolve(response._id);
        })
        
    })
},



getAllOffers:()=>{
    return new Promise(async(resolve,reject)=>{ 
    let offers=  await db.get().collection(collection.OFFER_COLLECTION).find().toArray()
              resolve(offers);
     

    })
},



getAnyCategory:(cat)=>{
    return new Promise(async(resolve, reject)=>{
      let category= await db.get().collection(collection.TYPE_COLLECTION).aggregate([
        {
        $match:{type:cat}
      },
      {
        $lookup:{
          from:collection.PRODUCT_COLLECTION,
          localField:'_id',
          foreignField:'type',
          as:'Categ'
        }
      }
      ]).toArray()
    //   console.log('category printing iss   '+ category);
    //   console.log(category[0].Categ);
      resolve(category[0].Categ)

    })

  },

  
getAnyCategory1:(cat)=>{
    return new Promise(async(resolve, reject)=>{
      let category= await db.get().collection(collection.TYPE_COLLECTION).aggregate([
        {
        $match:{type:cat}
      },
      {
        $lookup:{
          from:collection.PRODUCT_COLLECTION,
          localField:'_id',
          foreignField:'type',
          as:'Categ'
        }
      }
      ]).toArray()
    //   console.log('category printing iss   '+ category);
      console.log(category);
      resolve(category[0].Categ)

    })

  },




  getLatest:()=>{
    return new Promise(async(resolve,reject)=>{
    let latest =  await db.get().collection(collection.PRODUCT_COLLECTION).find().sort({_id:-1}).limit(3).toArray()

       resolve(latest);
    })
  },



  mostCanceledProduct:()=>{
    return new Promise(async(resolve, reject) => {
        let mostCancelledProduct=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
            {
                $match:{
                    status: 'cancelled' 
                }
            },
         
            {
                $unwind:'$products'
            },
            {
                $lookup: {
                    from: collection.PRODUCT_COLLECTION,
                    localField: 'products.item',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            {
                $unwind:'$product'
            },
            {
                $group:{
                    _id:"$products.item",count:{$sum:"$products.quantity"}
                }
             },
             {
                $lookup: {
                    from: collection.PRODUCT_COLLECTION,
                    localField: '_id',
                    foreignField: '_id',
                    as: 'product'
                }
            },{
                $unwind:'$product'
            }
            ,{
                $sort:{count:-1}
             }
        
         
        ]).toArray()
        console.log('orinting most cencelled');
        console.log(mostCancelledProduct[0]);
        resolve(mostCancelledProduct[0])
    })
},



mostReturnProduct:()=>{
    return new Promise(async(resolve, reject) => {
        let mostCancelledProduct=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
            {
                $match:{
                    status: 'return' 
                }
            },
         
            {
                $unwind:'$products'
            },
            {
                $lookup: {
                    from: collection.PRODUCT_COLLECTION,
                    localField: 'products.item',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            {
                $unwind:'$product'
            },
            {
                $group:{
                    _id:"$products.item",count:{$sum:"$products.quantity"}
                }
             },
             {
                $lookup: {
                    from: collection.PRODUCT_COLLECTION,
                    localField: '_id',
                    foreignField: '_id',
                    as: 'product'
                }
            },{
                $unwind:'$product'
            }
            ,{
                $sort:{count:-1}
             }
        
         
        ]).toArray()
        console.log('orinting most cencelled');
        console.log(mostCancelledProduct[0]);
        resolve(mostCancelledProduct[0])
    })
},



mostOrderededProduct:()=>{
    return new Promise(async(resolve, reject) => {
        let mostOrderedProduct=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
            {
                $match:{
                    // status: 'placed' || 'packed' ||'shipped'||'deliverd'

                    $or: [{status:"placed"},{status:"packed"},{status:"shipped"},{status:"deliverd"}]
                }
            },
         
            {
                $unwind:'$products'
            },
            {
                $lookup: {
                    from: collection.PRODUCT_COLLECTION,
                    localField: 'products.item',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            {
                $unwind:'$product'
            },
            {
                $group:{
                    _id:"$products.item",count:{$sum:"$products.quantity"}
                }
             },
             {
                $lookup: {
                    from: collection.PRODUCT_COLLECTION,
                    localField: '_id',
                    foreignField: '_id',
                    as: 'product'
                }
            },{
                $unwind:'$product'
            }
            ,{
                $sort:{count:-1}
             }
        
         
        ]).toArray()
        // console.log('orinting most ordered');
        // console.log(mostOrderedProduct[0]);
        resolve(mostOrderedProduct[0])
    })
}







}








