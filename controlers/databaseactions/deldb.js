import { pool } from '../../configs/database_config.js';


export const  delComments = async(post_id , user_id)=>{
 const q = `delete from comments  where id =$1 and  user_id=$2 `;
    try{
        const ans = (await pool.query(q, [post_id , user_id])).rows[0]
        return {success : true }
    }catch(error){
        console.log(error)
        return {success : false}
    }


}
export const  hndl_del_delup_db = async(userid,upid)=>{
 const q = `delete from account_upgrade_requests  where id =$1 and  user_id=$2 `;
    try{
        const ans = await pool.query(q, [upid,userid])
        return {success : true }
    }catch(error){
        console.log(error)
        return {success : false}
    }


}

export const  noti_seen_db  =  async(to_id)=>{
    try{
    
    const query = `
        DELETE FROM notifications
        WHERE to_id = $1
    `;

    await pool.query(query, [to_id]);
    return{success:true }
    }catch(er){
        console.log(er)
        return{success: false}
    }
    
}