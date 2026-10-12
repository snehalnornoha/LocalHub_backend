import { insert_user, sign_in_retrive, update_user } from '../controlers/databaseactions/databse.js';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import  nodemailer from "nodemailer" ;
import transporter from '../configs/mail_sender_config.js'
import "dotenv/config";


const  acces_s_key  =  process.env.acces_s_key
const refresh_key = process.env.refresh_key



 
const otpStore = new Map()


    


const sign_name = (res , username ,toke_name,secrete_key , exptime ) =>{
    const token =  jwt.sign( username , secrete_key , {expiresIn :exptime})
    console.log(token)
    res.cookie(toke_name, token, {
    httpOnly: true,
    secure: false, // Set to true if using HTTPS
    sameSite:"lax", // Adjust this based on your needs
  });


}


export const loginController = async(req ,res , next)=>{
    console.log("iam in login",req.body)
    const pass =req.body.password
    

     //  data base retrive hased-pass 
    const hss_pass = await  sign_in_retrive({name :req.body.username , email :req.body.gmail })
    console.log("---> hased", hss_pass)
    if(hss_pass.msg === "un-succesfull"){ 
        const err = new Error("un-successfull : account with this email not found")
         err.status = 409
         next(err)

    }
    else{

    //decrypt
    const is_legit = await bcrypt.compare(pass, hss_pass.hash_pass) 
    console.log(is_legit)
    if(is_legit) {
        
        sign_name(res , {id : hss_pass.id , role :hss_pass.role , location :hss_pass.location} , "accessToken" , acces_s_key ,'15m')
        sign_name(res , {id : hss_pass.id , role :hss_pass.role , location :hss_pass.location}, "refreshToken" , refresh_key,'1d')
        res.json({success:true, msg : "successfull"})
    }
    else{
         const err = new Error("un-successfull : password is incorrect")
         err.status = 409
         next(err)
        

    }
}
  
}

export const signupController = async(req ,res , next)=>{
    console.log("iam in signup",req.body)
    const username = req.body.username
    const pass =req.body.password
    const gmail = req.body.gmail
    const loc = "no data available"
    console.log(pass)

    

    //encrypt
    const hassed_pass = await bcrypt.hash(pass ,10)
    console.log(hassed_pass)

    //add it to data base 
    const res_query =  await insert_user({name : username , hassed_pass :hassed_pass , email :gmail , location :{}});
    console.log(res_query,res_query.id  )
    if(res_query.msg === 'succesfull'){
     
        //jwt token
        sign_name(res , {id : res_query.id , role :res_query.role , location :res_query.location} , "accessToken" , acces_s_key ,'15m')
        sign_name(res , {id : res_query.id , role :res_query.role , location :res_query.location}, "refreshToken" , refresh_key,'1d')
        res.json({ success:true,msg : "successfull"})
    }
    else {
      const err = new Error("Emial error: email already have account");
      err.status = 409; // Conflict
      next(err);
    }

}
    

export const sendotp = async (req, res , next) => {
    console.log("user:",process.env.Email_app_user,
    "pass:",process.env.Email_app_pass)
    console.log("-----> ", transporter)
    try {
        const { email } = req.body;
        console.log(otpStore.has(email))
        const isis =  otpStore.get(email);
        console.log(otpStore.has(email) && !Date.now() > isis?.expiresAt)
        console.log(Date.now() , isis?.expiresAt)
        if(otpStore.has(email)){
            if(Date.now() > isis?.expiresAt){
                otpStore.delete(email);
            }else{          
                 return res.json({success:true ,message: "OTP is already sent ,and sent otp is vailid for 5 min "})
            }
        }
       

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        otpStore.set(email, {
            otp: otp,
            expiresAt: Date.now() + 5 * 60 * 1000,
            });

        console.log("OTP:", otp);

        await transporter.sendMail({
            from: process.env.Email_app_user,
            to: email,
            subject: "Password Reset OTP",
            text: `Your OTP is ${otp} . It is valid for 5 minutes.`,
        });

        res.json({
            success:true,
            message: "OTP sent successfully",
        });
    }
    catch(error){
        console.log(error)
        const er = new Error(" something went wrong! please check your email and try again")
        er.status =501
        next(er)
    }
}


export const verfyotp = async(req, res , next)=>{
    const {password,email , otp}= req.body 
    

    ///hash the pass
    const hassed_pass = await bcrypt.hash(password ,10)
    console.log(" ->",hassed_pass)

    const legitOtp = otpStore.get(email)
    console.log(String(legitOtp.otp)  === String(otp))
    if(String(legitOtp.otp)  === String(otp)){
        const ans = await update_user({pass : hassed_pass  , email : email})
        console.log("masg ->",ans)
        res.json({success:true ,message :ans.msg})

        
    }
    else{
        res.json({success:false ,message : "error: otp is incorrect"})
    }

   
}





export const refresh_token_function=(req,res ,next)=>{
    const ref_token = req.cookies.refreshToken
  
    try{
    //verify the refreshtoken
        const vrfy = jwt.verify(ref_token , refresh_key)

        console.log("successfull",vrfy)
        //issue new acces token 
        sign_name(res , {id : vrfy.id , role :vrfy.role , location :vrfy.location} , "accessToken" , acces_s_key ,'15m')
        res.json({msg : "refresh successfull"})
    }
    catch(eror){
        next(eror)
        console.log(eror)
    }


}




