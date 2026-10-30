import { pool } from '../../configs/database_config.js';

 

export const  actTableSL = async(id,column)=>{
    const q = `
    UPDATE posts
    SET ${column} = ${column} + 1
    WHERE id = $1
    RETURNING ${column}
    `;
    try{
        const ans = await pool.query(q ,[id])
         console.log(ans.rows)
        const counts = ans.rows[0][column]
        return {success : true ,counts : counts }
    }catch(error){
        console.log(error)
        return {success : false}
    }


} 





export const  actTableSL_dec = async(id,column)=>{
    const q = `
    UPDATE posts
    SET ${column} = ${column} - 1
    WHERE id = $1
     RETURNING ${column}
    `;
    console.log(q)
    try{
        const ans = await pool.query(q ,[id])
         console.log(ans.rows)
         const counts = ans.rows[0][column]
        return {success : true ,counts : counts }
    }catch(error){
        console.log(error)
        return {success : false}
    }


} 
export const  actSaves = async(post_id ,user_id)=>{
const q2 = `
    WITH deleted AS (
        DELETE FROM saved_posts
        WHERE post_id = $1 AND user_id = $2
        RETURNING post_id
    ),
    inserted AS (
        INSERT INTO saved_posts (post_id, user_id)
        SELECT $1, $2
        WHERE NOT EXISTS (SELECT 1 FROM deleted)
        RETURNING post_id
    )
    SELECT 'deleted' AS action FROM deleted
    UNION ALL
    SELECT 'inserted' AS action FROM inserted;
    `;
    try{
        const ans = await pool.query(q2 , [post_id ,user_id])
        const action = ans.rows[0].action
        return {success : true ,action :action}
    }catch(error){
        console.log(error)
        return {success : false}
    }


}

export const  actLikes = async(post_id ,user_id)=>{
  const q2 = `
    WITH deleted AS (
        DELETE FROM post_likes
        WHERE post_id = $1 AND user_id = $2
        RETURNING post_id
    ),
    inserted AS (
        INSERT INTO post_likes (post_id, user_id)
        SELECT $1, $2
        WHERE NOT EXISTS (SELECT 1 FROM deleted)
        RETURNING post_id
    )
    SELECT 'deleted' AS action FROM deleted
    UNION ALL
    SELECT 'inserted' AS action FROM inserted;
    `;
    try{
        const ans = await pool.query(q2 , [post_id ,user_id])
         const action = ans.rows[0].action
        return {success : true ,action :action}
    }catch(error){
        console.log(error)
        return {success : false}
    }
}

export const  actComments = async(post_id ,user_id,user_info,comment)=>{
    const q = `
    INSERT INTO comments (post_id, user_id, user_info, text)
    VALUES ($1, $2, $3, $4)
    RETURNING *
`;
    try{
        const ans = (await pool.query(q, [post_id ,user_id ,user_info ,comment])).rows[0]
        return {success : true , data :ans }
    }catch(error){
        console.log(error)
        return {success : false}
    }


}
export const   hndl_grnt_up_db = async(upid,status)=>{
    const q = `
    UPDATE account_upgrade_requests set status = $1 where id =$2 
`;
    try{
        const ans = (await pool.query(q, [status , upid])).rows[0]
        console.log(ans)
        return {success : true , data :ans }
    }catch(error){
        console.log(error)
        return {success : false}
    }


}
export const   hndl_up_role_db = async(user_id ,wrole )=>{
    const q = `
    UPDATE user_info set role = $1 where id =$2 
`;
    try{
        const ans = await pool.query(q, [wrole, user_id])
        return {success : true }
    }catch(error){
        console.log(error)
        return {success : false}
    }


}
