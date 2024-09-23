import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

const generateAccesAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    console.log("I am user :", user);

    const accessToken = user.generateAccessToken();
    // console.log("this is access token:",accessToken)
    const refreshToken = user.generateRefreshToken();
    // console.log("refresh token:",refreshToken)

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "something went wrong");
  }
};


const LoginUser = asyncHandler(async (req, res) => {
    // get user credentials
    // check username or password is there
    // find user
    // validate password
    //  access & refresh token
    // send cookies
  const { username, email, password } = req.body;
  console.log(req.body);

  if (!username && !email) {
    throw new ApiError(404, "Username or email required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "user not found");
  }

  const passCheck = await user.isPasswordCorrect(password);
  if (!passCheck) {
    throw new ApiError(401, "password incorrect ");
  }

  const { accessToken, refreshToken } = await generateAccesAndRefreshToken(
    user._id
  );

  const logedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          logedInUser,
          accessToken,
          refreshToken,
        },
        "Login Successfull"
      )
    );

  /**
   * i can also update the object using:----
   * user.refreshToken = refresh Token
   *   And to delete password and the refresh token i can make a varibael where i can delete both fields :
   * const userWithoutSensitiveData = user.toObject()
   *
   * delete userWithOutSensitiveData.password;
   * delete userWithOutSensitiveData.refreshToken;
   */
});

const regesterUser = asyncHandler(async (req, res) => {
  // get user details from front
  // validation - not empty
  // check if user aleready exist : username and email
  // check for images && check for avatar
  // upload them to cloudnary
  // create user object - create entry in db
  // remove password and referesh token field from response
  // check for user creation
  // return res

  const { username, fullName, email, password } = await req.body;

  // req.body contain the data that are been send by the user

  if (
    [username, password, fullName, email].some(
      (element) => element?.trim() === ""
    )
  ) {
    throw new ApiError(404, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  // console.log("req Files ::: ",req.files) output:undefined
  // console.log("existedUser:",existedUser)

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exist");
  }
  const avtarLocalPath = req.files?.avtar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
  // if(req.files && Array.isArray(req.files.avtar[0] && req.files.avtar[0].length>0)){
  //     coverImageLocalPath = req.files.avtar[0].path
  // }

  if (!avtarLocalPath) {
    throw new ApiError(400, "Avtar file is required");
  }
  if (!coverImageLocalPath) {
    throw new ApiError(400, "cover files is required");
  }

  const avtar = await uploadOnCloudinary(avtarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avtar) {
    throw new ApiError(400, "Avtar file is required");
  }

  const user = await User.create({
    fullName,
    avtar: avtar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  // if i want to remove some data from the response that server send to user then we can do like
  /** const createdUser = await User.findById(user.id).select("-password -refreshtoen") */
  // remember we have to use user.findById(user._id).select(  "-password -refreshToken") remember always use - sign to remove and make a spacce to sepreate them
  // id also saved in _id format

  if (!createdUser) {
    throw new ApiError(500, "something went wrong while registering a user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Registered successfully"));
});

const logOutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logged out"));
});


const refreshAccessToken = asyncHandler(async (req,res) => {
 try {
   const incommingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
 
 
   if(!incommingRefreshToken){
     throw new ApiError(401,"unauthorized request")
 
   }
 
   const decodedToken = jwt.verify(incommingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
 
   const user = await User.findById(decodedToken?._id)
   if(!user){
     throw new ApiError(404,"Invalid refresh token")
   }
 
   if(incommingRefreshToken !== user?.refreshToken){
     throw new ApiError(404,"Refresh Token is expired or used")
   }
 
   const options = {
     httpOnly:true,
     secure:true
   }
 
   const {accessToken,newRefreshToken} = await generateAccesAndRefreshToken(user._id)
 
   return res.status(200)
   .cookie("accessToken",accessToken,options)
   .cookie("refreshToken",newRefreshToken,options)
   .json(
     new ApiResponse(
       200,{
         accessToken,refreshToken:refreshAccessToken
       },
       "access token refreshed "
     )
   )
 } catch (error) {
  throw new ApiError(401,error?.message|| "invalid refresh token")
 }

}) 

const changeCurrentPassword = asyncHandler(async(req,res) => {
  const {oldPassword,newPassword} = req.body

  const user = await User.findById(req.user?._id)
  const isPasswordCorrect =  await user.isPasswordCorrect(oldPassword)


  if(!isPasswordCorrect){
    throw new ApiError(400,"invalid old password")
  }

  user.password = newPassword
  await user.save({validateBeforeSave:false})

  return res.status(200)
  .json(new ApiResponse(200,{},"password change successfully"))
})


const getCurrentUser = asyncHandler(async(req,res) => {
  return res.status(200)
  .json(200,req.user,"current user fetched successfully")

})

const updateAccountDetails = asyncHandler(async(req,res) => {
  const {fullName,email} = req.body

  if(!fullName || !email){
    throw new ApiError(400,"all field are required")
  }

 const user  = await User.findByIdAndUpdate(req.user?._id,
  {
    $set:{
      fullName,
      email
    }

 },
 {new:true}
).select("-password")

return res.
status(200)
.json(new ApiResponse(200,user,"accessount details updated successfully"))

})


const updateUserAvtar  = asyncHandler(async(req,res) => {
  const avtarLocalPath =  req.file?.path

  if(!avtarLocalPath){
    throw new ApiError(400,"Avtar file missing")
  }

  const avtar = await uploadOnCloudinary(avtarLocalPath)
  if(!avtar.url){
    throw new ApiError(400,"error while loading avtar ")
  }

  const user = await User.findByIdAndUpdate(req.user?._id,{
    $set:{
      avtar:avtar?.url
    }
  },{new:true}

  ).select("-password")

  return res.status(200)
  .json(new ApiResponse(200,user,"avtar updated success fully"))
})

const updateUserCoverImg = asyncHandler(async(req,res) => {
  const coverImageLocalPath  = req.file?.coverImage
  if(!coverImageLocalPath){
    throw new ApiError(400,"avtar image not found")
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath)
  if(!coverImage.url){
    throw new ApiError(400,"Error while uploading coverImage")
  }

  const  user  = await User.findByIdAndUpdate(req.user?._id,{
    $set:{
      coverImage:coverImage.url
    }
    },{
      new:true
    }
  ).select("-password")

  return res.status(200)
  .json(new ApiResponse(200,user,"cover Image Uploaded Successfully"))
})




export { 
    regesterUser,
     LoginUser,
      logOutUser,
      refreshAccessToken,
      changeCurrentPassword,
      getCurrentUser,
      updateAccountDetails,
      updateUserAvtar,
      updateUserCoverImg
};


