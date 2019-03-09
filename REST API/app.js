const express = require('express')
const graphqlHttp = require('express-graphql')
const graphqpSchema = require('./graphql/schema')
const graphqpResolver = require('./graphql/resolvers')
const app = express();

const mongoose = require('mongoose')

const bodyParser = require('body-parser')

const path = require('path')

const multer = require('multer')    

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS ,GET, POST, PUT, PATCH, DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    if (req.method === "OPTIONS") {
        return res.sendStatus(200)
    }
    next()
})
const MONGODB_URI = 'mongodb+srv://giangng:TIAslMBTLYCTBIG%40CNN44@api-test-1-uryhd.gcp.mongodb.net/message?retryWrites=true'
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + "_" + file.originalname)
    }
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpg' || 
    file.mimetype === 'image/jpeg' || 
    file.mimetype === 'image/png') {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

app.use(bodyParser.json())
app.use(multer({
    storage: fileStorage,
    fileFilter: fileFilter
}).single('image'))

app.use('/images', express.static(path.join(__dirname, 'images')));

// app.use('/auth', authRoutes)
// app.use('/feed', feedRoutes)

app.use('/graphql', graphqlHttp({
    schema: graphqpSchema,
    rootValue: graphqpResolver,
    graphiql: true,
    formatError(err) {
        if (!err.originalError) {
            return err;
        }
        const data = err.originalError.data;
        const message = err.message || 'An Error Occured'
        const code = err.originalError.code || 500
        return { message: message, status : code, data: data }
    }

}))

app.use((err, req, res, next) => {
    console.log(err);
    const status = err.statusCode || 500;
    const message = err.message;
    const data = err.data
    res.status(status).json({
        message: message,
        data : data
    })
})


mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true
    })
    .then(result => {
        console.log("Connected to database")
        app.listen(8080)
    })
    .catch(err => console.log(err))