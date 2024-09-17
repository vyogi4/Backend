import {Router} from "express"
import { regesterUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"



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

    



export default router
