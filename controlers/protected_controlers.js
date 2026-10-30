
import {uploadToCloudinary,deleteFromCloudinary  }from './image_handle.js'
import { update_user_info_db ,update_profile_photot,insert_posts ,hndl_Upreq_db, insert_noti} from './databaseactions/databse.js'
import {get_advert_post, get_user_info_db,get_explore_db,hndl_get_Cmnt_db,handle_get_liked_db,
    handle_get_saved_db,handle_get_mypst_db ,handle_get_search_db,handle_get_sndreqst_db,
    handle_get_grntreqst_db,get_from_postID,
    handle_get_grntreqst_admin,get_allnoti_db} from './databaseactions/getdb.js'
import {actTableSL , actSaves ,actLikes ,actComments ,actTableSL_dec, hndl_grnt_up_db ,hndl_up_role_db} from './databaseactions/updt.js'
import {delComments,hndl_del_delup_db ,noti_seen_db} from './databaseactions/deldb.js'
import { getIO, getUsers } from "../socket.js";


//al supporting function
const verify_busines_post = async(user_id)=>{
    const ans = await get_advert_post(user_id)
    return ans

}

export const send_notifiaction = async(From_id,From_name ,to_id,type , msg)=>{
    console.log("ima in noti")
    console.log(From_id ,to_id ,type,msg )
   
    const ans = await insert_noti(From_id,From_name ,to_id ,type,msg )
    console.log(ans)
        try{
        const io = getIO();

        const users = getUsers();

            const socketId = users.get(to_id);
            console.log("id",socketId)

        if (socketId) {
            io.to(socketId).emit("notification", {
                type: type,
                msg: msg
            });
        }
    }
    catch(error){
        console.log(error)

    }
    
}


//all main function


//get functions 
export const handle_get_user_info = async(req, res , next)=>{
    const userid = req.user_id
    const ans = await get_user_info_db([userid])
    console.log("iam in getuser_info" , ans)
    if(ans.success){res.json(ans)}
    else{
        const err = new Error("Error in login:please login again")
        err.status = 501
        next(err)
    }


}

///////
export const handle_get_explore= async(req, res , next)=>{
    const userid = req.user_id
    const user_location =req.user_location 
    const page  = req.body.page
 
    console.log(user_location)

    const snd_data=[user_location.locality ,user_location.taluk, user_location.district  , user_location.state] 

    const ans = await get_explore_db(snd_data ,page)
    console.log("iam in getuser_info" , ans)
    if(ans.success){res.json(ans)}
    else{
        const err = new Error("Error in login:please login again")
        err.status = 501
        next(err)
    }


}
export const handle_get_posts = (get_db) => async (req, res, next) => {
    console.log(req.body)
    try {
        
        const user_location = req.user_location;
        const page  = req.body.page

        const snd_data = [
            user_location.locality,
            user_location.taluk,
            user_location.district,
            user_location.state
        ];

        const ans = await get_db(snd_data,page);
        console.log(ans)

        if (ans.success) {
            res.json(ans);
        } else {
            const err = new Error("Error: loading interrupted");
            err.status = 501;
            next(err);
        }
    } catch (error) {
        next(error);
    }
};

export const handle_updtprofimg  = async (req , res , next)=>{
    console.log(req.files,req.body.imgurl)
    const images = req.files
    const user_id = req.user_id
    const oldImageUrl = req.body.imgurl;
    try{

        if(!images) return res.json("something went wrong please check the image ");
         const image_URLs =  await  uploadToCloudinary(images[0].buffer)
        console.log("hey upload complted ", image_URLs)

        if(image_URLs){
            const ans = await update_profile_photot(user_id , image_URLs)
            if(ans.success){
                deleteFromCloudinary(oldImageUrl)
                res.json({imgurl: image_URLs})
            }
            else{
                throw new Error("image upload error")
            }

        }
    }catch(err){
        console.log(err)
        const  eror =  new Error("internal server error");
        eror.status =  500
        next(eror)
    }
}



export const handle_edit_profile = async(req, res , next)=>{
    const userid = req.user_id
    const user_info = req.body
    console.log("iam in getupadte_info" , userid , user_info)
  
    const ans = await update_user_info_db(userid , user_info)
    
    if(ans.success){
        res.json(ans)
    }
    else{
        const err = new Error("Error in login:please login again")
        err.status = 501
        next(err)
    }


}


export const handle_post_upload = async(req, res , next)=>{
    const userid = req.user_id
    const user_role = req.user_role 
    const images = req.files
    const user_info = req.body
    if((["local_community_representative", "local_community_member"].includes(user_role) && user_info.type.toUpperCase() === 'ADVERTISEMENT')
    || (user_role === 'user' && (user_info.type.toUpperCase() !== 'WORK' ))){
        const err = new Error("un-successfull : account with this email is not eligible to do this")
         err.status = 409
         next(err)
    }
    if(user_info.type.toUpperCase() === 'ADVERTISEMENT' && user_role === 'business' ){
        const vres = await verify_busines_post(userid)

        if(!vres.success){
            const err = new Error("un-successfull : delete the first adverisement ")
            err.status = 409
            next(err)
        }
    }
    console.log(req.body)
    console.log("iam in getupadte_info" , images,userid , user_info ,user_role)

    //
    if(!images) return res.json("something went wrong please check the image ");
    const image_URLs =  await  uploadToCloudinary(images[0].buffer)
    console.log("hey upload complted ", image_URLs)
    
    if(image_URLs){
    
    const values = [userid,user_info.title,user_info.type.toUpperCase(),
                        user_info.description,image_URLs,user_info.user_img_url,user_info.state,
                        user_info.district,user_info.taluk ,user_info.locality,user_role,user_info.name];
  
    const ans = await insert_posts(values)
      if(ans.success){
        res.json(ans)
        }
    }else{
    const err = new Error("Error while ipload pls try again")
    err.status = 501
    next(err)
    }
}

export const logout = (req, res ,next) => {
    console.log("iam loggged out")
    try {
        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: true, // Set to true if using HTTPS
            sameSite:'none' // Adjust this based on your needs
        });

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true, // Set to true if using HTTPS
            sameSite:'none' // Adjust this based on your needs
        });

        return res.json({
            success: true,
            message: "Logged out successfully"
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Logout failed"
        });
    }
};


///////////handle_save ,handle_like}
export const handle_save = async(req, res , next)=>{
    const userid = req.user_id
    const {saved_id} = req.body
    //posts table update 
    const ans2= await actSaves(saved_id ,userid) 

    const ans3 = await get_from_postID(saved_id)
    const to_name = ans3.name || "user"
    const to_id = ans3.to_is
    
    console.log(">>>>>>>><<<<<<<<<<<<" , ans2)
    //save table insert
    if(ans2.success && ans2.action === "inserted")
        {
        const ans1 = await actTableSL(saved_id, 'saves') 
        const msg =  `${ans1.counts} user saved your post}`
        send_notifiaction(userid,to_name,to_id,'saves',msg)
        console.log(">>><<<<<",ans1)
         if(ans1.success || ans2.success){
            return  res.json(ans1)
        }
        }
    else if(ans2.success && ans2.action === "deleted"){
        const ans1 = await actTableSL_dec(saved_id, 'saves') 
       
        console.log(">>><<<<<",ans1)
        if(ans1.success || ans2.success){
             const msg =  `${ans1.counts} user saved your post}`
            send_notifiaction(userid,to_name,to_id,'saves',msg)
            return  res.json(ans1)
            }
    } 

    console.log("eroooooor",ans2)
    const er = new Error('error while handling save')
    er.status = 500 
    next(er)
    


  
}
export const handle_like = async(req, res , next)=>{
    const userid = req.user_id
    const {liked_id} = req.body

    //posts table update 
    const ans2= await actLikes(liked_id , userid) 
    //save table insert
    console.log(">>>>>>>><<<<<<<<<<<<" , ans2)

    const ans3 = await get_from_postID(liked_id)
    const to_name = ans3.name || "user"
    const to_id = ans3.to_is

     if(ans2.success && ans2.action === "inserted")
        {
        const ans1 = await actTableSL(liked_id, 'likes') 

        console.log(">>><<<<<",ans1)
         if(ans1.success || ans2.success){
            const msg =  `${ans1.counts} users liked your post}`
            send_notifiaction(userid,to_name,to_id,'likes',msg)
            return  res.json(ans1)
        }
        }
    else if(ans2.success && ans2.action === "deleted"){
        const ans1 = await actTableSL_dec(liked_id , 'likes') 
        console.log(">>><<<<<",ans1)
        if(ans1.success || ans2.success){
             const msg =  `${ans1.counts} users liked your post}`
             send_notifiaction(userid,to_name,to_id,'likes',msg)
           return  res.json(ans1)
            }
    }    
    console.log(ans2)
    const er = new Error('error while handling like')
    next(er)

  
}
export const hndl_insrt_Cmnt = async(req, res , next)=>{
    const userid = req.user_id
    const {name,img ,post_id,msg} = req.body
    console.log(name,img ,post_id,msg)
    const user_info = {name :name ,img :img }
    //posts table update 
    const ans2= await actComments(post_id ,userid,user_info,msg)


    const ans3 = await get_from_postID(post_id)
    const to_name = ans3.name || "user"
    const to_id = ans3.to_is
    //save table insert
    console.log(">>>>>>>><<<<<<<<<<<<" , ans2)
     if(ans2.success )
        {
        const ans1 = await actTableSL(post_id, 'comments') 
        console.log(">>><<<<<",ans1)
         if(ans1.success || ans2.success){
            const msge =  `${name} commented : ${msg}`
             send_notifiaction(userid,to_name,to_id,'comments',msge)
            return  res.json( {...ans1, data :ans2.data})
        }
        }
 
    console.log(ans2)
    const er = new Error('error while handling Comments')
    next(er)

  
}
export const hndl_del_Cmnt = async(req, res , next)=>{
    const userid = req.user_id
    const {cmnt_id ,post_id} = req.body
    console.log(req.body)

    //posts table update 
    const ans2= await delComments(cmnt_id , userid)
    //save table insert
    console.log(">>>>>>>><<<<<<<<<<<<" , ans2)
     if(ans2.success )
        {
      const ans1 = await actTableSL_dec(post_id, 'comments')
        console.log(">>><<<<<",ans1)
        if(ans1.success || ans2.success){
           return  res.json(ans1)
            }
        }
        
 
    console.log(ans2)
    const er = new Error('error while handling Comments')
    next(er)

  
}
      
export const hndl_get_Cmnt = async(req, res , next)=>{
    const userid = req.user_id
    const {post_id} = req.body
    console.log(req.body)

    //posts table update 
    const ans = await hndl_get_Cmnt_db(post_id)
    console.log(ans)
    if(ans.success){
        res.json(ans) 
    }else{
    console.log(ans)
    const er = new Error('error while handling Comments')
    next(er)
    }

  
}
export const handle_get_liked = async(req, res , next)=>{
     console.log("/><><<<></")
    const userid = req.user_id
    const page  = req.body.page
    console.log(req.body)

    //posts table update 
    const ans = await handle_get_liked_db(userid ,page)
    console.log(ans)
    if(ans.success){
        res.json(ans) 
    }else{
    console.log(ans)
    const er = new Error('error while handling like')
    next(er)
    }

  
}
export const handle_get_saved = async(req, res , next)=>{
     console.log("/><><<<></")
    const userid = req.user_id
    const page  = req.body.page
    console.log("/><><<<></")
    console.log(req.body)

    //posts table update 
    const ans = await handle_get_saved_db(userid , page)
    console.log("saved",ans)
    if(ans.success){
        res.json(ans) 
    }else{
    console.log(ans)
    const er = new Error('error while handling saved posts')
    next(er)
    }

  
}
export const handle_get_mypst = async(req, res , next)=>{
     console.log("/><><<<></")
    const userid = req.user_id
    const page  = req.body.page
    console.log("/><><<<></")
    console.log(req.body)

    //posts table update 
    const ans = await handle_get_mypst_db(userid , page)
    console.log("saved",ans)
    if(ans.success){
        res.json(ans) 
    }else{
    console.log(ans)
    const er = new Error('error while handling MyPosts')
    next(er)
    }

  
}

export const handle_get_search = async(req, res , next)=>{
     console.log("/><><<<></")

    const userid = req.user_id
    const {type, value, page}  = req.body
    console.log("/><><<<></")
    console.log(req.body.type === "locality" , req.body.type === "taluk" , req.body.type === "district")
    

    if (!["locality", "taluk", "district"].includes(type)) {
        const er = new Error("Invalid location column")
        er.status = 409
        next(er)
       
    }

    //posts table update 
    const ans = await handle_get_search_db(userid, type, value, page)
    console.log("search",ans)
    if(ans.success){
        res.json(ans) 
    }else{
    console.log(ans)
    const er = new Error('error while handling Search')
    next(er)
    }

  
}
      

export const hndl_Upreq = async(req, res , next)=>{
    console.log("/><><<<></")
    const userid = req.user_id
    const role  = req.body.role
    const desc = req.body.disc
     const user_location =req.user_location 
    console.log("/><><<<></")
    console.log(req.body)

    //posts table update 
    const ans = await hndl_Upreq_db(userid ,user_location ,role ,desc)
    console.log("saved",ans)
    if(ans.success){
        
        const ans2 = await handle_get_sndreqst_db(userid ,user_location)
        console.log(ans2)
        if(ans2.success){
            res.json(ans2) 
        }else{
            res.json(ans) 
        }
    }else{
    console.log(ans)
    const er = new Error('error while handling MyPosts')
    next(er)
    }

  
}

// ,
export const handle_get_sndreqst = async(req, res , next)=>{
    console.log("/><><<<></")
    const userid = req.user_id
     const user_role = req.user_role 
    const user_location =req.user_location 
    console.log("/><><<<></")
    if([
        "admin",
        "local_community_representative",
        "local_community_member",
    ].includes(user_role)){
         const er = new Error('error while loading')
         next(er)
    }

    


    //posts table update 
    const ans = await handle_get_sndreqst_db(userid ,user_location)
    console.log("saved",ans)
    if(ans.success){
        res.json(ans) 
    }else{
    console.log(ans)
    const er = new Error('error while handling MyPosts')
    next(er)
    }

  
}
export const handle_get_grntreqst = async(req, res , next)=>{
    console.log("/><><<<></")
    
     const user_role = req.user_role 
    const user_location =req.user_location 
    const page = req.body.page
    console.log("/><><<<></")
    if(![
        "admin",
        "local_community_representative",
        "local_community_member",
    ].includes(user_role)){
         const er = new Error('error while loading')
         next(er)
    }

    

    
    //posts table update 
    
    const ans =user_role === "admin" ? await handle_get_grntreqst_admin(page):await handle_get_grntreqst_db(page ,user_location)
    console.log("saved",ans)
    if(ans.success){
        res.json(ans) 
    }else{
    console.log(ans)
    const er = new Error('error while handling MyPosts')
    next(er)
    }

  
}
export const hndl_del_delup = async(req, res , next)=>{
    const userid = req.user_id
    const upid = req.body.id
    const ans = await hndl_del_delup_db(userid,upid) 
     if(ans.success){
        res.json(ans) 
    }else{
    console.log(ans)
    const er = new Error('error while handling Delete')
    next(er)
    }
  
}
export const handle_grntup = async(req, res , next)=>{
    let ans2 = {success : true}
    const {upid ,decsn ,wrole,user_id } = req.body
    
    const ans =decsn ? await hndl_grnt_up_db(upid ,'approved') :
                await hndl_grnt_up_db(upid,'rejected') 
    if(decsn && ans.success){
         ans2= await hndl_up_role_db(user_id ,wrole ) 
    }
    
     if(ans.success){
        res.json(ans) 
    }else{
    console.log(ans)
    const er = new Error('error while handling Delete')
    next(er)
    }
  
}


export const get_all_noti = async(req, res , next)=>{
    console.log("alll all noti",req.user_id)
    const user_id = req.user_id 
    
    const ans = await get_allnoti_db(user_id)

    console.log("alll all noti",ans)
    if(ans.success){
        res.json({success : true ,data: ans.info })
    }
    else{
        const err = new Error("Error in login:please login again")
        err.status = 501
        next(err)
    }

}

export const handle_notiSeen = async(req, res , next)=>{
     const user_id = req.user_id
     console.log(user_id)
     const ans = noti_seen_db(user_id)
     res.json(ans)
}