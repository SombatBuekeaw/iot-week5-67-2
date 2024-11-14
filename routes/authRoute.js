import express from 'express'
import User from '../models/userModel.js'
import bcrypt from 'bcryptjs'
import { guestRoute  } from '../middleware/authMiddleware.js'
import { protectedRoute } from  '../middleware/authMiddleware.js'
import nodemailer from 'nodemailer';  


const router = express.Router()

// Looking to send emails in production? Check out our Email API/SMTP product!
var transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "d67fe7cebd8728",
      pass: "672bcc28905e1a"
    }
  });

//Route login page: GET=> http://localhost:3000/login
router.get('/login', guestRoute, (req, res) => {
    return res.render('login', { title: 'Login page' })
})

//Route Register page: GET=> http://localhost:3000/register
router.get('/register', guestRoute, function (req, res) {
    return res.render('register', { title: 'Register page' })
})



//Route forgot-password: GET=> http://localhost:3000/forgot-password/:token
router.get('/forgot-password/:token', guestRoute, async function (req, res) {
    const token = req.params.token; 
    try {
        
        const user = await User.findOne({ token });

        
        if (!user) {
            req.flash('error', 'Invalid or expired token.');
            return res.redirect('/forgot-password');
        }

        
        return res.render('forgot-password', { title: 'Forgot-password', active: 'forgot', token });

    } catch (error) {
        console.error(error);
        req.flash('error', 'Something went wrong, try again.');
        return res.redirect('/forgot-password');
    }
    
});




//Route Register page: GET=> http://localhost:3000/reset-password
router.get('/reset-password', guestRoute, (req, res) => {
    return res.render('reset-password', { title: 'Reset password', active: 'reset' })
})

//Route Register page: GET=> http://localhost:3000/profile
router.get('/profile', protectedRoute, (req, res) => {
    return res.render('profile', { title: 'Profile page' })
})

//Route Register page: POST=> http://localhost:3000/register
router.post('/register', guestRoute, async (req, res) => {
    // console.log(req.body)
    const { name, email, password } = req.body
    try {
        const userExists = await User.findOne({ email })
        if (userExists) {
            req.flash('error', 'User already exists with this email')
            return res.redirect('/register')
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = new User({
            name,
            email,
            password: hashedPassword,
        })
        user.save()
        req.flash('success', 'User registered successfully, You can login now!')
        return res.redirect('/login')
    } catch (error) {
        console.log(error)
        req.flash('error', 'Somethin went wrong, Try again!')
        return res.redirect('/login')
    }
})

router.post('/login', guestRoute, async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await User.findOne({ email: email })
        if (user && await bcrypt.compare(password, user.password)) {
            req.session.user = user
            return res.redirect('/profile')
        } else {
            req.flash('error', 'Invalid email or password')
            return res.redirect('/login')
        }
    } catch (error) {
        console.log(error)
        req.flash('error', 'Something went wrong, try again!')
        return res.redirect('/login') // เปลี่ยนจาก req.redirect เป็น res.redirect
    }
})


//Handle user logout
router.post('/logout', (req, res) => {
    req.session.destroy()
    return res.redirect('/login')
})
//Route forgot-pass: post=> http://localhost:3000/forgot-password
router.post('/forgot-password', async function (req, res) {
    const {email} = req.body
    try{
        const user =  await User.findOne({eamil})
        if(!user){
            req.flash('error','User not found with this email')
            return res.redirect('/forgot-password')
        }
      // send mail with defined transport object
      const info = await transport.sendMail({
        from: '"Sombat 🥶" <info@gmail.com>', // sender address
        to: email, // list of receivers
        subject: "Password reset", // Subject line
        text: "Reset your password!", // plain text body
        html: `<p>Click this link to reset your password:<a href='http://localhost:3000/reset-password/${token}'>Reset password</a><br>Thank you!.</p>`, // html body
    });

    if (info.messageId) {
        req.flash('success', 'Password reset link has been sent to your email,try again!')
        return res.redirect('/login')
    } else {
        req.flash('error', 'Error sending email,try again!')
        return res.redirect('/forgot-password')
    }
        const token = Math.random().toString(35).slice(2)
        //console.log(token)
        user.token = token
        await user.save()
    } catch (error) {
        console.error(error);
        req.flash('error', 'Something went wrong, try again');
        return res.redirect('/forgot-password');
    }
    
})

router.post('/reset-password', async (req, res) => {
    console.log(req.body);  
});


export default router