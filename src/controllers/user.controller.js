import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"


const regesterUser = asyncHandler( async(req,res) => {
    // get user details from front
    // validation - not empty
    // check if user aleready exist : username and email
    // check for images && check for avatar 
    // upload them to cloudnary
    // create user object - create entry in db
    // remove password and referesh token field from response
    // check for user creation 
    // return res

    const {username,fullName,email,password} =await req.body

    // req.body contain the data that are been send by the user 
  

    if (
        [username,password,fullName,email].some((element) =>
        element?.trim() === "")
    ) {
        throw new ApiError(404,"All fields are required")
    }

    const existedUser = await  User.findOne({
        $or:[{ username } , { email } ]
    })
    
    // console.log("req Files ::: ",req.files) output:undefined
    // console.log("existedUser:",existedUser)

    if(existedUser){
        throw new ApiError(409,"User with email or username already exist")
    }
    const avtarLocalPath = req.files?.avtar[0]?.path;
    let coverImageLocalPath ;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }


    if(!avtarLocalPath){
        throw new ApiError(400,"Avtar file is required")
    }
    

    const avtar = await uploadOnCloudinary(avtarLocalPath)
    const coverImage  = await uploadOnCloudinary(coverImageLocalPath)


    if(!avtar){
        throw new ApiError(400,"Avtar file is required")
    }

    const user  = await User.create({
        fullName,
        avtar:avtar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )


    if(!createdUser){
        throw new ApiError(500,"something went wrong while registering a user")
    }


    return res.status(201).json(
        new ApiResponse(200,createdUser,"User Registered successfully")
    )
})




export {regesterUser}


