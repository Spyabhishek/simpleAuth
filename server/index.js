// MERN = Mongo + Express + react + Node

// Development = Node.js server + React server


const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const User = require('./models/user.model')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

// Middleware
app.use(cors())
app.use(express.json({ extended: true }))

// Database
mongoose.connect('mongodb://localhost:27017/codedamn-Auth',)


// Register

app.post('/api/register', async (req, res) => {
    // console.log(req.body)
    try {
        const newPassword = await bcrypt.hash(req.body.password, 10)
        await User.create({
            name: req.body.name,
            email: req.body.email,
            password: newPassword
        })
        res.json({ status: 'ok' })
    } catch (error) {
        console.log(error.message);
    }

})

// Login

app.post('/api/login', async (req, res) => {

    const user = await User.findOne({
        email: req.body.email,
    })

    if (!user) {
        return res.json({
            status: error
        })
    }
    const isPasswordValid = await bcrypt.compare(req.body.password, user.password)

    if(isPasswordValid){
        const token = jwt.sign(
            {
                name: user.name,
                email: user.email
            },
            'secret1234')

        return res.json({ status: 'ok', user: token })
    } else {
        return res.json({ status: 'error', user: false })
    }
})

app.get('/api/quote', async (req, res) => {
    const token = req.headers['x-access-token']
    try {
        const decoded = jwt.verify(token, 'secret1234')
        const email = decoded.email
        const user = await User.findOne({ email })

        return res.json( { status: 'ok', quote: user.quote })

    } catch (error) {
        console.log(error);
        res.json({ status: 'error', error: 'invalid token' })
    }
})

app.post('/api/quote', async (req, res) => {
    const token = req.headers['x-access-token']
    try {
        const decoded = jwt.verify(token, 'secret1234')
        const email = decoded.email
        await User.updateOne({ email },
            { $set: { quote: req.body.quote } })

        return res.json({ status: 'ok'})

    } catch (error) {
        console.log(error);
        res.json({ status: 'error', error: 'invalid token' })
    }
})

app.listen(3001, () => {
    console.log("Listening on Port 3001")
})