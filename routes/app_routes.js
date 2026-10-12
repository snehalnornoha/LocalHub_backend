import express from 'express'
import {loginController , signupController,  refresh_token_function,
     sendotp, verfyotp} from "../controlers/app_routes_controler.js";



//-----gloabl decalaraion----
const router = express.Router()


//------log-in
router.post('/login' , loginController);

// ----sign-up route:
router.post('/signup' , signupController);

//------forget pass words end points
router.post("/send-otp",sendotp)
router.post("/verify-otp",verfyotp)

//-----send otp
router.post('/signup' , signupController);


//-----------refresh-token---------
router.get('/refresh_token' , refresh_token_function)






export default router;