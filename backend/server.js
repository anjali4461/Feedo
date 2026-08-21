// start server
require('dotenv').config()
const app = require('./src/app')
const connectDB = require('./src/db/db')

connectDB()

app.get("/",(req,res)=>{
    res.send("Hello World")
})

app.listen(3000,()=>{
    console.log("Sever is running port 3000")
})