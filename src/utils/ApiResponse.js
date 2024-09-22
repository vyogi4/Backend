class ApiResponse {
    constructor(statusCode,data,message = "Success"){
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode <400
    }
}

export { ApiResponse } 





// class ApiResponse{
//     constructor(statusCode,data,message = "success"){
//         this.data = data
//         this.message = message
//         this.success  = statusCode <400
//     }
// }




// app.use(cors({
//     origin:"process.env.CORS_ORIGIN",
//     methods:['GET','POST','PUT','DELETE'],
//     Credential:true,
//     allowedHeaders:['Content-Type','Authorization']
// }))

// app.use(express.json({limit:"16kb"}))
// app.use(express.urlencoded({extended:true,limit:"16kb"
// }
// ))

// app.use(express.static("public"))

// app.use(cookieParser( ))

// 