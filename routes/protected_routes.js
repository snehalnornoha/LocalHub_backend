import express from 'express'
import upload from '../middle_ware/mltr.js'
import {handle_get_user_info ,handle_edit_profile,logout,handle_updtprofimg,handle_post_upload ,handle_get_explore ,handle_get_posts ,hndl_get_Cmnt, handle_save ,handle_like,hndl_insrt_Cmnt ,hndl_del_Cmnt , hndl_Upreq, handle_notiSeen} from '../controlers/protected_controlers.js'
import {handle_get_saved , handle_get_liked,handle_get_mypst,handle_get_search,handle_get_sndreqst ,handle_get_grntreqst,hndl_del_delup,handle_grntup,get_all_noti} from '../controlers/protected_controlers.js'
import {get_jobs_db ,get_advertisements_db ,get_public_notices_db ,get_alerts_db ,get_events_db} from '../controlers/databaseactions/getdb.js'


const p_routes = express.Router()

/*getuserinfo */
p_routes.get('/get_user_info',handle_get_user_info)
p_routes.get('/sndreqst',handle_get_sndreqst)
p_routes.get(`/all_noti`,get_all_noti)
p_routes.get(`/noti_seen`,handle_notiSeen)


p_routes.post('/grntreqst',handle_get_grntreqst)
p_routes.post('/Explore',handle_get_explore)
p_routes.post('/Jobs', handle_get_posts(get_jobs_db));
p_routes.post('/Advertisements', handle_get_posts(get_advertisements_db));
p_routes.post('/PublicNotices', handle_get_posts(get_public_notices_db));
p_routes.post('/Alerts', handle_get_posts(get_alerts_db));
p_routes.post('/Events', handle_get_posts(get_events_db));
p_routes.post('/get_saved',handle_get_saved);
p_routes.post('/get_liked',handle_get_liked);
p_routes.post('/get_mypst',handle_get_mypst );
p_routes.post('/search',handle_get_search);

/*POST */
p_routes.post('/post_upload',upload.array('images'),handle_post_upload)
p_routes.post('/entrCmnt',hndl_insrt_Cmnt)
p_routes.post('/getCmnts',hndl_get_Cmnt)
p_routes.post('/upReq',hndl_Upreq)



/*DELTE*/
p_routes.delete('/cmnt',hndl_del_Cmnt)
p_routes.delete('/delup',hndl_del_delup)


/*edit profile */
p_routes.put('/edit_profile',handle_edit_profile)
p_routes.put('/save',handle_save)
p_routes.put('/like',handle_like)
p_routes.put('/updtprofimg',upload.array('images'),handle_updtprofimg)
p_routes.put('/grntup',handle_grntup)

/* logout */
p_routes.post(`/logout`,logout)

export default p_routes;