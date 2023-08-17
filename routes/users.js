var express = require('express');
const con = require('../connection/connection');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('admin/adminlogin')
});
router.get('/home', function(req, res) {
  res.render('admin/adminhome');
});
router.post('/login', function(req,res){
  console.log("post method is working")
  let usernamee="shahal";
  let password="shahal123";
  console.log(req.body)
  if(req.body.usrname==usernamee && req.body.pass==password){
  console.log("login success")
  res.redirect('/users/home')
  }else{
    console.log("login error")
  }
})
router.post('/addproduct',function(req,res){
  console.log(req.body);
  let data = req.body;
  console.log(req.files);
  if(!req.files) return res.status(400).send("no files were uploaded");
  let file = req.files.img;
  let img_name = file.name;
  let sql = "insert into addproduct set ?"
  if(file.mimetype == "image/jpeg" || file.mimetype == "image/png" || file.mimetype == "image/gif"){
    file.mv("public/imeges/products/"+file.name,function(err){
      if(err) console.log(err)
      data.img=img_name;
      con.query(sql,data,(err,result)=>{
        if(err){
          console.log(err)
        }else{
          res.redirect('/users/home')
        }
      })
    })
  }else{
    res.send("incorrect format")
  }
})

router.get('/order',function(req,res){
  var sql="select addproduct.name,addproduct.about,addproduct.img,addproduct.price,cart.quantity,cart.status,cart.id,cart.User_id from addproduct inner join cart on addproduct.id = cart.Product_id where cart.status='purchased'";
  con.query(sql,(err,row)=>{
    if(err){
      console.log(err)
    }else{
      console.log("-----------------------------------",row)
    res.render('admin/order',{row})
    }
  })
}) 

router.get('/userdetails',(req,res)=>{
  
  res.render('admin/userdetails')
})
module.exports = router;
