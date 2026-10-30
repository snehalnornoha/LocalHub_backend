import jwt from 'jsonwebtoken'
import "dotenv/config";




const  acces_s_key  =  process.env.acces_s_key
const refresh_key = process.env.refresh_key

export const test_jwt_refresh= (a_token)=>{
 try{
     const ans = jwt.verify(a_token ,refresh_key )
     return ans ;
 }
 catch(eror){
  console.log(eror)
  const er = new Error("Invalid or expired JWT")
  er.status = 401
  throw  er;
 }
   

}

export const test_jwt = (a_token)=>{
 try{
     const ans = jwt.verify(a_token , acces_s_key)
     return ans ;
 }
 catch(eror){
  console.log(eror)
  const er = new Error("Invalid or expired JWT")
  er.status = 401
  throw  er;
 }
   

}
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
async function authentication(req ,res ,next ){

    console.log("imain auth")
    //await delay(5000);
    
    console.log( req.cookies.accessToken)
    console.log(req.cookies)
    try{
        const a_token  = req.cookies.accessToken
        const ans = test_jwt(a_token)
       
        req.user_id = ans.id
        req.user_role = ans.role
        req.user_location = ans.location

        console.log("authentictaed" , req.user_id ,req.user_role, req.user_location)
         next()

     }
    catch(error){
        console.log(error)
        next(error)

    }
   
  }


  export default authentication;