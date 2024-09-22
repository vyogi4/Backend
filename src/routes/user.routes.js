import {Router} from "express"
import { logOutUser, refreshAccessToken, regesterUser } from "../controllers/user.controller.js";
import { LoginUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { varifyJWT } from "../middlewares/auth.middleware.js";



const router  = Router()
router.route("/register").post(
    
    upload.fields([
        {
            name:"avtar",
            maxCount:1 
        },
        {
            name:"coverImage",
            maxCount:1
        
        }
    ]),
    regesterUser)

    router.route("/login").post(
        upload.none(),
        LoginUser)


    // secured Route

    router.route("/logout").post(varifyJWT,logOutUser)
    router.route("/refresh-token").post(refreshAccessToken)




    



export default router
