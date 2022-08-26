var express = require('express');
var router = express.Router();
var productHelper=require('../helpers/product-helpers')
var userHelper=require('../helpers/userhelper')
var adminHelper=require('../helpers/adminhelper')
var multer=require('multer')
var Handlebars = require('handlebars');
const { response } = require('express');
const adminhelper = require('../helpers/adminhelper');
const { allOrders } = require('../helpers/adminhelper');
const productHelpers = require('../helpers/product-helpers');




  //verify admin session
  let verifylogin = (req, res, next) => {
    if (!req.session.admin) {
        res.redirect("/admin/adminlogin");
      
    } else {
        next();
    }
  };

/* GET users listing. */
router.get('/',verifylogin,async function(req, res, next){
  try{
  let Orders= await adminHelper.allOrders()
  totalOrders=Orders.length
  let user=await userHelper.getAllUsers()
  user=user.length
  let products=await productHelper.getAllProduct()
  products=products.length
  let cod=await adminHelper.codTotal()
  console.log('cod issss'+cod)
  let paypal=await adminHelper.paypalTotal()
  let rasor=await adminHelper.rasorpayTotal()
  let sales=cod+paypal+rasor;
  console.log('printing cod   '+cod)
  let mostcancel=await productHelper.mostCanceledProduct()
  let mostordered=await productHelper.mostOrderededProduct()
  let mostreturn=await productHelper.mostReturnProduct()
  let shirts= await productHelper.getAnyCategory1('shirt')
  shirts=shirts.length
  let pants= await productHelper.getAnyCategory1('pants')
  pants=pants.length
  let jeans= await productHelper.getAnyCategory1('jeens')
  jeans= jeans.length
  let tshirts= await productHelper.getAnyCategory1('t-shirt')
  tshirts= tshirts.length

  res.render('admin/adminhome',{totalOrders,user,products,Orders,cod,paypal,rasor,sales,mostcancel,mostordered,shirts,pants,jeans,tshirts,mostreturn});
}catch(err){
  res.render('erroradmin')
}
});


//admn login
router.get('/adminlogin', function(req, res, next){
  try{
    if(req.session.admin){
        res.redirect('/admin')
    }else{
    res.render('admin/adminlogin');
    }
  }catch(err){
    res.render('erroradmin')
  }
  });



  //adminlogin validation
  router.post('/adminlogin',(req,res)=>{
    try{
         adminHelper.adminLogin(req.body).then((code)=>{
            console.log(code);
            if(code.status){
                req.session.admin=true;
   
      console.log("logged in");
      res.redirect("/admin");
            }
            else {
                console.log("login failed");
                res.render("admin/adminlogin",{loginError:true});
              }
         })
        }catch(err){
          res.render('erroradmin')
        }
  })




//get user management
router.get('/adminusermanagement', verifylogin, function(req, res, next){
  try{
    userHelper.getAllUsers().then((user) => {
        res.render('admin/adminusermanagement',{user});
        console.log("here is the user details");
        // console.log(users);
      });

    }catch(err){
      res.render('erroradmin')
    }
  });

  //user unblock
  router.get('/unblock/:id',verifylogin,(req,res)=>{
    try{
    let userId=req.params.id
    userHelper.unblockUser(userId).then((response)=>{
        console.log('coming back unblock');
        res.redirect('/admin/adminusermanagement')
    })
  }catch(err){
    res.render('erroradmin')
  }
  })

  //user block
  router.get('/block/:id',verifylogin,(req,res)=>{
    try{
    let userId=req.params.id
    userHelper.blockUser(userId).then((response)=>{
        console.log('coming back block');
        req.session.user=null

        res.redirect('/admin/adminusermanagement')
    })
  }catch(err){
    res.render('erroradmin')
  }
  })











//logout
router.get('/logout',verifylogin,(req,res)=>{
  try{
    
    req.session.admin=null;
    console.log('session cleared');
    res.redirect('/admin/adminlogin')
  }catch(err){
    res.render('erroradmin')
  }
})





router.get('/addproduct',verifylogin,async(req,res)=>{
  try{
  let Type= await productHelper.getAllTypes()
  await productHelper.getAllBrands().then((Brands) =>{
    console.log('printng brands')
    console.log(Brands)

    res.render('admin/adminAddProduct',{Brands,Type})
  })
}catch(err){
  res.render('erroradmin')
}
});



const fileStorageEngineProduct = multer.diskStorage({
  destination:(req,file,cb)=>{
    // console.log("stage 1");
    cb(null,'./public/product-images')
  },
  filename:(req,file,cb)=>{
    console.log(file);
    cb(null,Date.now()+ '--'+ file.originalname)
  }
}) 


const uploadProduct =multer({storage:fileStorageEngineProduct})


router.post('/addproduct',uploadProduct.array('Image',4),function(req, res) {

  try{



  var filenames = req.files.map(function(file) {
    return file.filename;
  });
  req.body.image = filenames;
  // console.log(req.body);
  productHelper.addProduct(req.body).then(()=>{
    // req.session.proAdd=true
    res.redirect('/admin/addproduct')
  })

}catch(err){
  res.render('erroradmin')
}
  
});


/*admin category management*/
router.get('/categoryManagement',verifylogin, (req, res)=>{
  try{
   res.render('admin/categoryManagement')
  }catch(err){
    res.render('erroradmin')
  }
})

//post category add
router.post('/categoryManagement',verifylogin, (req, res)=>{
  try{
  adminHelper.BrandAdd(req.body).then((response)=>{
    res.redirect('/admin/categoryManagement')
  })
}catch(err){
  res.render('erroradmin')
}
})

//post type management add
router.post('/typeManagement',verifylogin, (req, res)=>{
  try{
  adminHelper.typeAdd(req.body).then((response)=>{
    res.redirect('/admin/categoryManagement')
  })
}catch(err){
  res.render('erroradmin')
}
})



//get delete cateogry
router.get('/categoryDelete',verifylogin, async(req, res)=>{
  try{
  await productHelper.getAllBrands().then((Brand)=>{
    console.log(Brand);
    console.log(Brand[0]._id)
    res.render('admin/deleteCategory',{Brand})
  })
}catch(err){
  res.render('erroradmin')
}
})

//get delete type
router.get('/typeDelete',verifylogin, async(req, res)=>{
  try{
  await productHelper.getAllTypes().then((Type)=>{
    console.log(Type);
    // console.log(Brand[0]._id)
    res.render('admin/deleteType',{Type})
  })
}catch(err){
  res.render('erroradmin')
}
})

//post delete category
router.get('/deleteCategory/:id',verifylogin,(req, res)=>{
  try{
  
  console.log(req.params.id)
  adminHelper.deleteCategory(req.params.id).then((Category)=>{
    res.redirect("/admin/categoryDelete")
  })
}catch(err){
  res.render('erroradmin')
}
})

//post delete type
router.get('/deleteType/:id',verifylogin,(req, res)=>{
  try{
  console.log(req.params.id)
  adminHelper.deleteType(req.params.id).then((Category)=>{
    res.redirect("/admin/typeDelete")
  })
}catch(err){
  res.render('erroradmin')
}
})


//post update category
router.post('/editCategory/:id',verifylogin,(req, res)=>{
  try{
  console.log(req.params.id);
  console.log('printng post updaate req');
  console.log(req.params.id)
  adminHelper.updateCategory(req.params.id,req.body).then((Category)=>{
    res.redirect("/admin/categoryDelete")
  })
}catch(err){
  res.render('erroradmin')
}
})

//post update type
router.post('/editType/:id',verifylogin,(req, res)=>{
  try{
  console.log(req.params.id);
  console.log('printng post updaate req');
  console.log(req.params.id)
  adminHelper.updateType(req.params.id,req.body).then((Type)=>{
    res.redirect("/admin/typeDelete")
  })
}catch(err){
  res.render('erroradmin')
}
})






//get update category
router.get('/editCategory/:id',verifylogin, (req, res) => {
  console.log('log commes here');
  try{
  adminHelper.getUpdateCategory(req.params.id)
  .then((Brand)=>{
    console.log('printing brand');
    console.log(Brand);
    res.render('admin/editCategory',{Brand})

  })

}catch(err){
  res.render('erroradmin')
}
  
})



//get update type
router.get('/editType/:id',verifylogin, (req, res) => {
  try{
  console.log('log commes here');
  adminHelper.getUpdateType(req.params.id)
  .then((Type)=>{
    console.log('printing Type');
    console.log(Type);
    res.render('admin/editType',{Type})

  })

}catch(err){
  res.render('erroradmin')
}
  
})





router.get('/adminviewproduct',verifylogin,(req,res)=>{
  try{
  productHelper.getAllProduct().then((user)=>{

    res.render('admin/adminviewproduct',{user})
   console.log('view product');
  })
}catch(err){
  res.render('erroradmin')
}
})

  //delete product
  router.get('/deleteProduct/:id',verifylogin,(req,res)=>{
    try{
    console.log(req.params.id);
    console.log('enterd before req params');
  let productId=req.params.id
  console.log(productId);
  console.log('going to get into producthelper function');
  productHelper.deleteProduct(productId).then((response)=>{
    console.log('returning with value and redirecting to view page')
    // res.send('have a nice dat')
       res.redirect('/admin/adminviewproduct');
  })
}catch(err){
  res.render('erroradmin')
}
  })

  //update product get
  router.get('/updateProduct/:id',verifylogin,async(req,res)=>{
    try{
    let productId=req.params.id
    let user = await productHelper.editUser(req.params.id);
    let Type= await productHelper.getAllTypes()
    let Brand=await productHelper.getAllBrands()
    
    res.render('admin/adminupdateProduct',{user,Type,Brand});
  }catch(err){
    res.render('erroradmin')
  }
  })



//update product post
router.post('/updateProduct/:id',uploadProduct.array('Image',4),async(req,res)=>{
  try{
  var filenames = req.files.map(function(file) {
    return file.filename;
  });
 

  req.body.image = filenames;
  productHelper.updateProductDetails(req.params.id,req.body).then(()=>{
    res.redirect('/admin/adminviewproduct');
  })
}catch(err){
  res.render('erroradmin')
}
})

//get order management
router.get('/orderManagement',verifylogin,async(req, res)=>{
  try{
  await adminhelper.allOrders().then((allOrders)=>{
    console.log('printng again')
    console.log(allOrders)
    res.render('admin/orderManagement',{allOrders})

  })
}catch(err){
  res.render('erroradmin')
}
})

//post changeStatus
router.post('/changeStatus/:id',verifylogin,async(req, res)=>{
  try{
   console.log( req.body.changeStatus + "     order id is     " + req.params.id) 
   
  await adminhelper.updateStatus(req.body.changeStatus,req.params.id).then(()=>{

    res.redirect('/admin/orderManagement')
  })
}catch(err){
  res.render('erroradmin')
}
})

//coupon post
let couponexist

router.post('/addCoupon',verifylogin,async(req, res) => {
  try{
 await adminHelper.addCoupons(req.body).then((response)=>{

if(response.status){
  res.redirect('/admin/coupon')
}
else{
  couponexist=true
  res.redirect('/admin/coupon')
}

 })
}catch(err){
  res.render('erroradmin')
}

})


//coupon get
router.get('/coupon',verifylogin,async(req, res) => {
  try{
  let coupons=await adminHelper.getAllCoupons()

    if(coupons){
    res.render('admin/coupon',{couponexist,coupons});
    }
    else{
      res.render('admin/coupon',{couponexist,coupons});
    }
  }catch(err){
    res.render('erroradmin')
  }
})

//coupon delete
router.get('/couponDelete/:id',verifylogin,async(req, res)=>{
  try{
   console.log(req.params.id)

  await adminHelper.deleteCoupon(req.params.id).then(()=>{

    res.redirect('/admin/coupon')
  })
}catch(err){
  res.render('erroradmin')
}
})

//get offer
let invalidstatus
let invalid=false
router.get('/offer',async(req, res) => {
  try{
  let brand=await productHelper.getAllBrands()
  let offers=await productHelper.getAllOffers()
  let types=await productHelper.getAllTypes()
  // let offers2=await productHelper.getAllOffers2()

  res.render('admin/offer',{brand,offers,invalid,types})
}catch(err){
  res.render('erroradmin')
}

})

//post add offer brand
router.post('/offer',verifylogin,async(req, res) => {
  try{
  await adminHelper.addOfferBrand(req.body).then(async(response) =>{
    
    console.log(response.status);






    if(response.status){
      invalid=false;
      console.log('coupon added 1');
      let brand=await productHelper.findOneBrand(req.body)
      console.log('coupon added 2');
      await productHelper.applyOfferBrand(brand, req.body).then((response) => {
        console.log(response);
        if(response.noproduct){
          console.log('coupon added2.5');
          res.redirect('/admin/offer') 
        }
         else{

      console.log('coupon added 3');

        res.redirect('/admin/offer')
         }

      })
      
    
    }
    else{
      invalid=true;
      console.log('coupon is not added');
      res.redirect('/admin/offer')
      
    }
  

  })
}catch(err){
  res.render('erroradmin')
}
})





//post add offer category
router.post('/offerc',verifylogin,async(req, res) => {
  try{
  await adminHelper.addOfferCategory(req.body).then(async(response) =>{
    console.log(response.status);






    if(response.status){
      invalid=false;
      console.log('coupon added 1');
      let type=await productHelper.findOneCategory(req.body)
      console.log('coupon added 2');
      await productHelper.applyOfferCategory(type, req.body).then((response) => {
        console.log(response);
        if(response.noproduct){
          console.log('coupon added2.5');
          res.redirect('/admin/offer') 
        }
         else{

      console.log('coupon added 3');

        res.redirect('/admin/offer')
         }

      })
      
    
    }
    else{
      invalid=true;
      console.log('coupon is not added');
      res.redirect('/admin/offer')
      
    }
  

  })
}catch(err){
  res.render('erroradmin')
}
})





//post dlete brand offer
router.get("/offerDeleteBrand/:id/:brand",verifylogin,async(req, res)=>{
  try{
  let brand=await productHelper.findOneBrand1(req.params.brand)

await adminHelper.deleteOfferBrand(req.params.id,brand).then(()=>{
  res.redirect('/admin/offer')

})
}catch(err){
  res.render('erroradmin')
}
})

//post dlete categoryoffer
router.get("/offerDeleteCategory/:id/:type",verifylogin,async(req, res)=>{
  try{
  let type=await productHelper.findOneCategory1(req.params.type)

await adminHelper.deleteOfferCategory(req.params.id,type).then(()=>{
  res.redirect('/admin/offer')

})
}catch(err){
  res.render('erroradmin')
}
})

//admin view order
router.get('/adminorder/:id',verifylogin, async(req, res) => {
  console.log('coe onnnnn')
  let final=0
  let products=await adminHelper.getOrderProducts(req.params.id)
  let productsinv=await adminHelper.getOrderProductsinvoice(req.params.id)
  final=products[0].overallgrandtotal-productsinv[0].coupondiscount-productsinv[0].walletdiscount-products[0].overalldiscount
  res.render('admin/orderproduct',{products,productsinv,final})
})

//add banner
router.post('/addbanner',verifylogin,uploadProduct.array('bannerimage',1),async(req, res) => {
  var filenames = req.files.map(function(file) {
    return file.filename;
  });
  req.body.bannerimage = filenames;
await adminHelper.addBanner(req.body)
res.redirect('/admin/banner')
})

//get banner page
router.get('/banner',verifylogin,async(req, res) => {
  let banner=await adminHelper.getBanner()
  console.log(banner)
  res.render('admin/banner',{banner})
})

//delete banner
router.get('/deletebanner/:id',verifylogin,async(req, res) => {
  await adminHelper.deleteBanner(req.params.id)
res.redirect('/admin/banner')
})







module.exports = router;
