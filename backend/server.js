// start server
require('dotenv').config()
const app = require('./src/app')
const connectDB = require('./src/db/db')

const PORT = process.env.PORT || 3000

connectDB()

app.get("/",(req,res)=>{
    res.send("Hello World")
})

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
})