var express = require('express');
const res = require('express/lib/response');
const con = require('../connection/connection');
var router = express.Router();
const razorpay = require('../razorpay/razor')


router.get('/', function (req, res, next) {
  let user = req.session.user;
  console.log("session created", user)
  let sql = "select * from addproduct";
  con.query(sql, (err, result) => {
    if (err) {
      console.log(err)
    } else {
      console.log(result)
      let product = result;
      res.render('user/user123', { user, product });
    }
  })

})
 //router.get('/', function (req, res, next) {
 //res.render('user/user123')
  
//}); 
router.get('/cart', function (req, res) {
  let sql = "select addproduct.name,addproduct.about,addproduct.img,addproduct.price,cart.quantity,cart.id,cart.User_id from addproduct inner join cart on addproduct.id = cart.Product_id where cart.User_id = ?"
  let userid = req.session.user.id;
  con.query(sql, [userid], (err, row) => {
    if(err){
      console.log(err)
   }else{
      console.log("cartItess:",row)
      let user = req.session.user;
      let total = 0;
      row.forEach(obj => {
        total=obj.price * obj.quantity + total;
      });
      console.log("total amount is-------------",total);
      let gst = total * .18;
      let subtotal = total + gst;
      console.log(gst,subtotal,"------------------")
      user.gst = gst;
      user.subtotal = subtotal;
      user.total = total;
     res.render('user/cart', { row, user })
   }
 })
});
router.get('/login', function (req, res) {
  res.render('user/login');
});
router.get('/register', function (req, res) {
  res.render('user/register')
});
router.post('/reg', function (req, res) {
  console.log(req.body)
  let data = req.body;
  let sql = "insert into user set ?"
  con.query(sql, data, (err, results) => {
    if (err) {
      console.log(err)
    }
    else {
      res.redirect("/login")
    }
  })
})
router.post("/loginuser", function (req, res) {
  let email = req.body.Email;
  let password = req.body.Password;
  let sql = "select * from user where email = ? and password = ?"
  con.query(sql, [email, password], function (err, result) {
    if (err) {
      console.log(err)
    } else {
      if (result.length > 0) {
        console.log("login succcessfull")
        console.log(result);
        req.session.user = result[0];
        res.redirect("/")
      } else {
        console.log("login err")
        res.redirect("/login")
      }
    }
  })
})
router.get('/addtocart/:pid', (req, res) => {
  console.log("Cart is working")
  let product_id = req.params.pid;
  let user_id = req.session.user.id;
  let data = {
    product_id,
    user_id
  }
  let sql2 = "select * from cart where product_id = ? and user_id = ?"
  con.query(sql2, [product_id, user_id], (err, row) => {
    if (err) {
      console.log(err)
    } else {
      if (row.length > 0) {
        console.log(row)
        let cqty = row[0].quantity;
        cqty = cqty + 1;
        let sql3 = "update cart set quantity = ? where product_id = ? and user_id = ?"
        con.query(sql3, [cqty, product_id, user_id], (err, row2) => {
          if (err) {
            console.log(err)
          } else {
            res.redirect('/')
          }
        })

      } else {
        let sql = "insert into cart set ?"
        con.query(sql, data, (err, result) => {
          if (err) {
            conmsole.log(err)
          } else {
            res.redirect('/');
          }
        })
      }
    }
  })

})
router.get('/quantityI/:id',(req,res)=>{
  let cartID = req.params.id;
  let sql = "select * from cart where id = ?"
  con.query(sql,[cartID],(err,result)=>{
    if(err){
      console.log(err)
    }else{
      console.log(result, "working")
      let Cquantity = result[0].quantity;
      Cquantity = parseInt(Cquantity) + 1 ;
      let sql2 = "update cart set quantity =? where id = ?"
      con.query(sql2,[Cquantity,cartID],(err,row)=>{
        if(err){
          console.log(err)
        }else{
          res.redirect('/cart')
        }
      })
    }
  })
})
router.get('/quantityD/:id',(req,res)=>{
  let cartID = req.params.id;
  let sql = "select * from cart where id = ?"
  con.query(sql,[cartID],(err,result)=>{
    if(err){
      console.log(err)
    }else{
      console.log(result, "working")
      let Cquantity = result[0].quantity;
      Cquantity = parseInt(Cquantity) - 1 ;
      if(Cquantity<=0){
        Cquantity = 1
      }else{
      let sql2 = "update cart set quantity =? where id = ?"
      con.query(sql2,[Cquantity,cartID],(err,row)=>{
        if(err){
          console.log(err)
        }else{
          res.redirect('/cart')
        }
      })
    }
  }
  })
})
router.get('/remove/:id',(req,res)=>{
  let cart_id = req.params.id;
  let sql = "delete from cart where id = ?"
  con.query(sql,[cart_id],(err,row)=>{
    if(err){
      console.log(err)
    }else{
  res.redirect('/cart')
}
})
})
router.get('/payment/:amount',(req,res)=>{
  var amount = req.params.amount;
  amount = amount * 100;
  console.log(amount)
  var options = {
    amount: parseInt(amount),  // amount in the smallest currency unit
    currency: "INR",
    receipt: "order_rcptid_11"
  };
  razorpay.orders.create(options, function(err, order) {
    console.log(order);
    let user = req.session.user;
    res.render('user/checkout',{order,user})
  });
})
router.post('/verify', async(req,res)=>{
  console.log(req.body)
  console.log("verify")
  let data = req.body;
  var crypto = require('crypto')
  var order_id = data['response[razorpay_order_id]']
var payment_id=data['response[razorpay_payment_id]']
const razorpay_signature=data['response[razorpay_signature]']



 const key_secret ="HbFM4QbOORczeVqpXE2spWlZ";
let hmac = crypto.createHmac('sha256',key_secret);
await hmac.update(order_id + "|" + payment_id);
const generated_signature = hmac.digest('hex');
if(razorpay_signature === generated_signature){
  console.log("verified transaction")
  let sql="update cart set status = 'purchased' where user_id = ?";
  let userId=req.session.user.id;
  con.query(sql,[userId],(err,result)=>{
    if(err){
      console.log(err)
    }else{
      res.redirect('/cart')
    }
  })
}
})
router.get('/myorders',(req,res)=>{
  let user_id=req.session.user.id;
  let sql = "select addproduct.name,addproduct.about,addproduct.img,addproduct.price,cart.quantity,cart.id,cart.User_id from addproduct inner join cart on addproduct.id = cart.Product_id where cart.User_id = ? and status='purchased'";
  con.query(sql,[user_id],(err,row)=>{
    if(err){
      console.log(err)
    }else{
      console.log("------------------------------------fgdsgffsdjhgsdjfdfhjk hh",row)
      res.render('user/myorders',{row});

    }
  })
})
module.exports = router;

