import {asyncHandler} from "../utils/asyncHandler.js"



const regesterUser = asyncHandler( async(req,res) => {
    res.status(308).json({
        message:"Yogi is goat you tell about yourself"
    })
})



export {regesterUser}


