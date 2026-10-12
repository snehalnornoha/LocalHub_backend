import express from 'express'
import upload from '../middle_ware/mltr.js'
import {handle_get_user_info ,handle_edit_profile,logout,handle_updtprofimg,handle_post_upload ,handle_get_explore ,handle_get_posts} from '../controlers/protected_controlers.js'
import {get_jobs_db ,get_advertisements_db ,get_public_notices_db ,get_alerts_db ,get_events_db} from '../controlers/databaseactions/getdb.js'


const p_routes = express.Router()

/*getuserinfo */
p_routes.get('/get_user_info',handle_get_user_info)
p_routes.post('/Explore',handle_get_explore)
p_routes.post('/Jobs', handle_get_posts(get_jobs_db));
p_routes.post('/Advertisements', handle_get_posts(get_advertisements_db));
p_routes.post('/PublicNotices', handle_get_posts(get_public_notices_db));
p_routes.post('/Alerts', handle_get_posts(get_alerts_db));
p_routes.post('/Events', handle_get_posts(get_events_db));
/*POST */
p_routes.post('/post_upload',upload.array('images'),handle_post_upload)

/*edit profile */
p_routes.put('/edit_profile',handle_edit_profile)
p_routes.put('/updtprofimg',upload.array('images'),handle_updtprofimg)

/* logout */
p_routes.post(`/logout`,logout)

export default p_routes;