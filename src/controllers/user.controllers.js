import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from '../utils/ApiError.js'
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { response } from "express";
import { ApiResponse } from "../utils/ApiResponse.js";
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
  console.log("email : " , email)
  if([username,email,password,fullName].some((field)=>field?.trim()==="")){
    throw new ApiError(400,"fullname is required")
  }
  const existedUser = User.findOne({
    $or: [{ email },{ username }]
  })

  if(existedUser){
    throw new ApiError(409, "user already exits")
  }
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

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

export  {registerUser}