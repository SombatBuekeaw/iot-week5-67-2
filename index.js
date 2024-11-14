import express from 'express' // import module
import connectMongoDB from './config/db.js'
import authRouth from './routes/authRoute.js'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import flash from 'connect-flash'

const app = express() // create app
const port = process.env.PORT || 8080

//Connected to MongoDb database
connectMongoDB()

//Middleware
app.use(express.json()) //แปลงข้อมูลที่มีรูปแบบ JSON String ให้อยู่ในรูป JSON Objext    
app.use(express.urlencoded({ extended: false })) // แปลงข้อมูลจาก form ในรูปแบบ url encode เป็น Object

//Cookie middleware
app.use(cookieParser(process.env.COOKIE_SECRET))

//Session middleware
app.use(session({
    secret: process.env.SESSION_SECERT,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 60000 * 60 * 24 * 7 //1 week
    }
}))

//Flash message middleware
app.use(flash())

//store flash message for views
app.use(function (req, res, next) {
    res.locals.message = req.flash()
    next()
})

//Store authenticatesd
app.use( (req,res,next) => {
    res.locals.user = req.session.user || null
    next()

})
//Set view/template engine:views
app.set('view engine', 'ejs')

//Home page
app.get('/', (req, res) => {
    res.render('index', { title: 'Home Page' })
})

app.use('/', authRouth)

app.listen(port, () => {
    console.log(`SERVER is running on http://localhost:${port}`)
})