import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from '../utils/ApiError.js'
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { response } from "express";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccressAndRefrehToker = async (userId)=>{         
    //here we created a metgod to generate accre and refresh token just by calling is method
    try {
        const user= await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken() 

        user.refreshToken =refreshToken
        await user.save({validateBeforeSave:false})
        return { accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating refresh and access token")
    }
}
const registerUser = asyncHandler(async (req,res)=>{
  //gey user details from frontend
  //validation -not empty
  //check if user already eits : username,email
  //cheak for imagees ,check for avatar 
  //create user object - create entry in db
  //remove password and referesh token field from response 
  //check for user creation
  // return res

  const {username,fullName, email, password} = req.body
  console.log(req.body)
  console.log("email : " , email)
  if([username,email,password,fullName].some((field)=>field?.trim()==="")){
    throw new ApiError(400,"fullname is required")
  }
  const existedUser = await User.findOne({
    $or: [{ email },{ username }]
  })

  if(existedUser){
    throw new ApiError(409, "user already exits")
  }
  const avatarLocalPath = req.files?.avatar[0]?.path;
//   const coverImageLocalPath = req.files?.coverImage[0]?.path;

// if image is uploaded then this code can handle all the erroe which is caused by above code
  let coverImageLocalPath;
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage[0]>0){
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
  }  
  if(!avatarLocalPath) throw new ApiError(400, "Avatar nor avalable")

  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if(!avatar) {
    throw new ApiError(400, "Avatar not available")
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    
    coverImage: coverImage.url || "",
    email,
    password,
    username: username.toLowerCase()
  })

  const createdUser = await User.findById(user._id).select(
    " -password -refreshToken"
  )
  if(!createdUser){
    throw new ApiError (500,"Something went wrong while creting user")
  }

  return res.status(201).json(
    new ApiResponse(200,createdUser,"user register sucessfully")
  )

} )

const loginUser = asyncHandler(async (req,res)=>{
/*
TODOS:
1. take to login input from user (req body->data)
2. validation on basis of(email or username)
find the user 
3. check for access token  (password check) 
4.  Access token is expired then generate new access token after maching ACCESS REFRESH TOKEN of user from database if ACCESS REFRESH does not match generate new access refersh token and then generate new access token ((access and refesh token))
5. send cookies 
*/

const {email,username,password} =req.body
if(!username || !email){
    throw new ApiError(400,"username or email is required")
}

 const user =await User.findOne({
    $or: [ {username},{email}]
})
if(!user) {
    throw new ApiError(404, "user not find")
}
const isPasswordValid = await user.isPasswordCorrect(password)

if(!isPasswordCorrect) {
    throw new ApiError(401, "Invalid credientials")
}

const {accessToken,refreshToken} = await generateAccressAndRefrehToker(user._id)

const logedInUaer = await User.findById(user._id).select("-password -refeshToken ")

//Security setep Now with this object Cookies can be edited by server only not in frontend

const option ={
    httpOnly : true,
    secure : true
}
return res
.status(200)
.cookie("refreshToken", refreshToken , option)
.cookie("accessToken",accessToken,option)
.json(
    new ApiResponse(200,{
        user:logedInUaer,accessToken,refreshToken
    },
    "User logined in successfully"
    )
)

})
const logoutUser = asyncHandler(async (req,res)=>{
    User.findByIdAndUpdate(
       await req.user._id,{
            $set:{
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )
    const option ={
        httpOnly : true,
        secure : true
    }
    return res
    .status(200)
    .clearCookie("accessTolen",option)
    .clearCookie("refreshToken",option)
    .json(new ApiResponse(200,{},"User logedout"))
})


export  {registerUser,
    loginUser,logoutUser}