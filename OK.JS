const fileStorageEnginecategory = multer.diskStorage({
    destination:(req,file,cb)=>{
      // console.log("stage 1");
      cb(null,'./public/images/categories')
    },
    filename:(req,file,cb)=>{
      console.log(file);
      cb(null,Date.now()+ '--'+ file.originalname)
    }
  }) 

  
  const uploadcategory =multer({storage:fileStorageEnginecategory})

  router.post('/addCategory',uploadcategory.array('image'),(req,res)=>{
    var filenames = req.files.map(function(file) {
      return file.filename;
    });
    req.body.image = filenames;
    categoryHelper.addCategory(req.body).then(()=>{
      req.session.category=true;
      res.redirect('/admin/addCategory')
    })
  })






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

  router.post('/addProduct',uploadProduct.array('Image',4),function(req, res) {

    var filenames = req.files.map(function(file) {
      return file.filename;
    });
    req.body.image = filenames;
    // console.log(req.body);
    productHelper.addProduct(req.body).then(()=>{
      req.session.proAdd=true
      res.redirect('/admin/addProduct')
    })
    
  });