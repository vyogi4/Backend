import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"



const app = express()


app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"16kb"}))


app.use(express.urlencoded({extended:true,limit:"16kb"}))

app.use(express.static("public"))

app.use(cookieParser())




// importing routes 


import userRouter from "./routes/user.routes.js"




// routes decleration
app.use("/api/v1/users",userRouter)


// https:localhost:8000/api/v1/users/register





export {app}



































// this is how you can create multiple files in a folder using terminal

// foreach ($file in "app.js","constants.js","index.js"){
//     ni $file -itemType File
// }