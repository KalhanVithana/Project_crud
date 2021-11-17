
express = require('express'),
    router = express.Router();

const { UserSchema, CustomerSchema } = require('../model/index')
var jwt = require('jsonwebtoken');
const auth = require('../middleware/auth')
const verifyToken = require('../middleware/verifyToken')
const nodemailer = require("nodemailer");
const sendgridTransport = require('nodemailer-sendgrid-transport')
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { json } = require('body-parser');
const { Authschema } = require('../validation/user')
const { Authlogin } = require('../validation/user')
const sgMail = require('@sendgrid/mail')
const mailgun = require("mailgun-js");
const DOMAIN = 'sandboxaaa8b9d82b124769a01b8a4b4418ca30.mailgun.org';
const mg = mailgun({apiKey: 'f2a488f1c4eae5bf1d9214c7ce41c823-30b9cd6d-1a5b02f4', domain: DOMAIN});



sgMail.setApiKey('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');








router.route('/y').post(verifyToken,async(req, res) => {

    res.send('hi')
    // const data = {
    //     from: 'Excited User <me@samples.mailgun.org>',
    //     to: 'kalhanmanuj@gmail.com',
    //     subject: 'Hello',
    //     text: 'Testing some Mailgun awesomness!'
    // };
    // mg.messages().send(data, function (error, body) {
    //     console.log(body);
    //     res.send(body)
    // });

    
})


router.route('/register').post(async (req, res) => {
    try {
        const { fname, lname, email, password, cfmpassword } = req.body
        const validateSchema = await Authschema.validateAsync(req.body);

        const existingUser = await UserSchema.findOne({ email: validateSchema.email });
        if (existingUser) {

            return res.status(400).json({ msg: `user alreay exists  ` })
            
        }
        const salt = await bcrypt.genSalt();

        const passwordhash = await bcrypt.hash(password, salt);
        console.log(passwordhash)
        var randomstring = Math.random().toString(36).slice(-8);
        

        let NewUser = new UserSchema({
            fname,
            lname,
            email,
            password: passwordhash,
            verifycode:randomstring

        })

        const saveUser = await NewUser.save();
        const msg = {
            to: `${email}`,
            from: 'kalhanmanuj@gmail.com', 
            subject: 'Sending with Twilio SendGrid is Fun',
            text: `verication `,
            html: `<strong>verication code  ${randomstring}</strong>`,
          };
          //ES6
          sgMail
            .send(msg)
            .then(() => {}, error => {
              console.error(error);
          
              if (error.response) {
                console.error(error.response.body)
              }
            });

        res.json(saveUser)
        console.log(saveUser)

    } catch (err) {
        res.status(500).json(err)
    }

})


router.route('/ver').post(auth, async (req, res) => {
    const { fname, lname, email, password, cfmpassword,verifycode,verified } = req.body
    
    let NewUser = new UserSchema({
      
        verifycode,
        verified

    })
    
    const user = await UserSchema.findOne({ _id: req.user });
    if (!user) {
        return res.status(400).json({ msg: `No verificatication in this email ` })
    }
     await UserSchema.findOne({verifycode:NewUser.verifycode}).then(user=>{

        user.verified=1
         user.save();
        res.status(200).json({msg:"sucess"})
    }).catch(e=>{
        res.status(400).json({msg:"invalid code"})
    })
   
})


router.route('/login').post(async (req, res) => {
    try {
        const { email, password } = req.body
        const validateSchema = await Authlogin.validateAsync(req.body);
        const user = await UserSchema.findOne({ email: validateSchema.email });
        if (!user) {
            return res.status(400).json({ msg: `No User existing in this email ` })
        }
        const ismatch = await bcrypt.compare(password, user.password);
        if (!ismatch) {
            return res.status(400).json({ msg: "email or password invalid " })
        }
        // const verification = await UserSchema.find( { email: user.email }, {verified:1})
        // let valid = verification.filter(res=>{ res.verified === true})
        // if(!valid.length){
        //     return res.status(400).json({ msg: "verification faild" })
        // }
        const token = jwt.sign({ id: user._id }, process.env.JWT_Token);
        res.json({
            token,
            user: {
                id: user._id
            }
        })

    } catch (err) {

        res.status(500).json(err)
    }
})

router.route('/auth/login').post(async (req, res) => {
    try {
        const { email, password } = req.body
        const validateSchema = await Authlogin.validateAsync(req.body);
        const user = await UserSchema.findOne({ email: validateSchema.email });
        if (!user) {
            return res.status(400).json({ msg: `No User existing in this email ` })
        }
        const ismatch = await bcrypt.compare(password, user.password);
        if (!ismatch) {
            return res.status(400).json({ msg: "email or password invalid " })
        }
        const verification = await UserSchema.find( { email: user.email }, {verified:1})
        let valid = verification.filter(res=>{return res.verified ===true})
        console.log(valid)
        if(!valid.length){
            return res.status(400).json({ msg: "verification faild" })
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_Token);
        res.json({
            token,
            user: {
                id: user._id
            }
        })

    } catch (err) {

        res.status(500).json(err)
    }
})



router.route('/delete').delete(auth, async (req, res) => {
    const deleteUser = await UserSchema.findByIdAndDelete(req.user);
    res.json(deleteUser);
})


router.route('/delete/:id').delete(async (req, res) => {
    console.log(req.user)
    await CustomerSchema.findByIdAndDelete(req.params.id, (err, data) => {
        if (err) {
            return res.json(err)
        }
        else {
            return res.json(data)
        }

    });
})




router.route('/a').get(async (req, res) => {
    const findUser = await CustomerSchema.find((err, data) => {
        if (err) {
            return res.json(err)
        }
        else {
            return res.json(data)
        }
    })
})


router.route('/auth').post(async(req,res)=>{
    const token = req.header("x-auth");
    if(!token) return res.json(false);
    let auth =  await jwt.verify(token, process.env.JWT_Token);
    if(!auth) return res.json(false);
    const user = await UserSchema.findById(auth.id);
    const verification = await UserSchema.find( req.user, {verified:1})
    let valid = verification.filter(res=>{return res.verified ===true})
    console.log(valid)
    if(!valid.length){
        return res.json(false)
    }

    if(!user) return res.json(false)
    return res.json(true)
})

router.route('/get').get(auth,async(req,res)=>{
    const User = await UserSchema.findById(req.user);
    res.json(User)
})


router.route('/get/admin').get(async (req, res) => {
    const findUser = await UserSchema.find((err, data) => {
        if (err) {
            return res.json(err)
        }
        else {
            return res.json(data)
        }
    })
})

router.route('/admin/customers').get(auth, async (req, res) => {
    const findUser = await CustomerSchema.find({ userid: req.user })
    res.json(findUser);


})


router.route('/update/:id').put(async (req, res) => {
    try {
        const { fname, lname, email, password, cfmpassword } = req.body
        let NewUser = new UserSchema({
            fname, lname, email, password, cfmpassword
        })
        const UserUpdate = await CustomerSchema.findByIdAndUpdate(req.params.id, { $set: req.body });
        res.json(UserUpdate);
        console.log(UserUpdate)
    }
    catch (err) {
        res.status(500).json(err)
    }
})


router.route('/admin/update/:id').put(auth, async (req, res) => {
    try {
        const { fname, lname, email, password, cfmpassword } = req.body
        let NewUser = new UserSchema({

            fname, lname, email, password, cfmpassword

        })
        const UserUpdate = await CustomerSchema.findByIdAndUpdate(req.params.id, { $set: req.body });
        res.json(UserUpdate);
        console.log(UserUpdate)
    }
    catch (err) {

        res.status(500).json(err)
    }
})

router.route('/admin/add').post(auth, async (req, res) => {
    try {
        const { fname, lname, email, password, cfmpassword } = req.body;
        const validateSchema = await Authschema.validateAsync(req.body);
        const existingUser = await CustomerSchema.findOne({ email: validateSchema.email });

        if (existingUser) {

            return res.status(400).json({ msg: "user alreay exists " })
        }
        const salt = await bcrypt.genSalt();
        const passwordhash = await bcrypt.hash(password, salt);
        console.log(passwordhash)

        let NewUser = new CustomerSchema({

            fname, lname, email, password, userid: req.user
        })
        const saveUser = await NewUser.save();
        if (saveUser) {
            res.json(saveUser)
            // console.log(saveUser)
            // await transpoter.sendMail({

            //     to: existingUser.email,
            //     from: "kalhanmanuj@gmail.com",
            //     subject: "Verify code ",
            //     html: `<h1>verify password is ${password} </h1>`
            // })
            // console.log(messg)
        }
    } catch (err) {
        res.status(500).json(err)
    }

})



router.route('/forgot').post((req, res) => {
    const { email, resetToken, expireToken } = req.body;
    const User = new UserSchema({
        email,
        expireToken,
        resetToken
    })

    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err)
        }
        else {

            const token = buffer.toString("hex");
            UserSchema.findOne({ email: email }).then(user => {

                if (!user) {
                    return res.status(400).json({msg:" no user found"})
                }
                user.resetToken = token;
                user.expireToken = Date.now() + 360000;

                console.log(token)

                user.save().then(res => {
                    const msg = {
                        to: `${email}`,
                        from: 'kalhanmanuj@gmail.com', 
                        subject: 'Sending with Twilio SendGrid is Fun',
                        text: `verication `,
                        html:`<a href="http://localhost:3000/reset/${token}">Link</a>`,
                      };
                      //ES6
                      sgMail
                        .send(msg)
                        .then(() => {}, error => {
                          console.error(error);
                      
                          if (error.response) {
                            console.error(error.response.body)
                          }
                        })
                })
                res.json("check  your email")
            })
        }
    })
})

router.route('/reset').post(async (req, res) => {
    const { email, resetToken, expireToken } = req.body;
    const password = req.body.password;
    const parmtoken = req.body.resetToken

    const findmail = new UserSchema({
        email,
        expireToken,
        resetToken
    })

    await UserSchema.findOne({ resetToken: parmtoken }).then(user => {

        if (!user) {
            res.status(401).json({ msg: "not user" })
        }

        bcrypt.hash(password, 12).then(hashpassword => {

            user.password = hashpassword,
                user.resetToken = undefined,
                user.expireToken = undefined
        }).then(res => {

            user.save();
        }).then(res => {

            console.log("sucess update")

        })
        

        res.json("sucess updated")
    })
})





module.exports = router;