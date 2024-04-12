import express from "express";
import bcryptjs from 'bcryptjs'
const router=express.Router()
import User from "../Model/userSchema.js";
import generateTokenAndSetCookie from "../utils/generateToken.js";

//signup
router.post("/signup",async (req,res)=>{
    try {
        const {fullname,username,password,cpassword,gender}=req.body
        if(!fullname||!username||!password||!cpassword||!gender){
            return res.status(400).json({message:"All fields are reuired"})
        }
        if(cpassword!==password){
            return res.status(400).json({message:"Password doesn't match"})
        }
        const usercheck=await User.findOne({username})
        if(usercheck){
            return res.status(400).json({message:"Username already exist"})
        }

        const boyProfilePic=`https://avatar.iran.liara.run/public/boy?username=${username}`
        const girlProfilePic=`https://avatar.iran.liara.run/public/girl?username=${username}`

        //hashpassword
        const hashpassword=await bcryptjs.hash(password,10)
        const newUser=new User({
            fullname,
            username,
            password:hashpassword,
            gender,
            profilePic:gender==='male'?boyProfilePic:girlProfilePic
        })
        //genereate jwt token
        generateTokenAndSetCookie(newUser._id,res)
        await newUser.save()
        res.status(201).json({
            _id:newUser._id,
            fullname:newUser.fullname,
            username:newUser.username,
            profilePic:newUser.profilePic
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Internal server error"})
    }
})


//signin
router.post("/signin",async(req,res)=>{
    try {
        const {username,password} =req.body
        // console.log(username,password)
        const user=await User.findOne({username})
        // console.log(user)
        if(!user){
            return res.status(404).json({message:"User not found"})
        }
        // console.log(user.password)
        const comparepassword=await bcryptjs.compareSync(password,user?.password||"")
        // console.log(comparepassword)
        if(!comparepassword){
            return res.status(400).json({message:"Invalid password or username"})
        }

        generateTokenAndSetCookie(user._id,res)

        res.status(200).json({
            _id:user._id,
            fullname:user.fullname,
            username:user.username,
            profilePic:user.profilePic
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Internal server error"})
    }
})

router.post('/signout',async(req,res)=>{
    try {
        res.cookie('jwt',"",{maxAge:0})
        res.status(200).json({message:"Logged out successfully"})
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Internal server error"})
    }
})
export default router