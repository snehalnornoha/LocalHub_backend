import pg  from 'pg';
import { pool } from '../../configs/database_config.js';

import {createUpdateQuery} from '../protected_helper_controlers.js'


export const datacreate = async ()=>{
    const Q = `CREATE TABLE IF NOT EXISTS user_info( 
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    
    role VARCHAR(30) DEFAULT 'user'
        CHECK (
            role IN (
                'user',
                'local_community_member',
                'local_community_representative',
                'admin',
                'business'
            )
        ),

    location JSONB,

    profile_image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`
    

     const query12 = `
    -- 1. Posts
    CREATE TABLE IF NOT EXISTS posts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES user_info(id),
      title VARCHAR(200) NOT NULL,

      type VARCHAR(30) NOT NULL CHECK (
        type IN (
          'JOB',
          'EVENT',
          'ADVERTISEMENT',
          'ALERT',
          'COMMUNITY',
          'WORK'
        )
      ),

      description TEXT NOT NULL,
      image_url TEXT,
      profile_image_url TEXT,
      name VARCHAR(200) NOT NULL,
      acc_type VARCHAR(200) NOT NULL,


      state VARCHAR(100) NOT NULL,
      district VARCHAR(100) NOT NULL,
      taluk VARCHAR(100) NOT NULL,
      locality VARCHAR(150) NOT NULL,
      likes INTEGER NOT NULL DEFAULT 0,
      comments INTEGER NOT NULL DEFAULT 0,
      saves INTEGER NOT NULL DEFAULT 0,
     

      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      is_active BOOLEAN NOT NULL DEFAULT TRUE
    );

    -- 2. Comments
    CREATE TABLE IF NOT EXISTS comments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      post_id UUID NOT NULL
        REFERENCES posts(id) ON DELETE CASCADE,
      user_id UUID NOT NULL
        REFERENCES user_info(id) ON DELETE CASCADE,
      user_info JSONB,
      text TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- 3. Likes
    CREATE TABLE IF NOT EXISTS post_likes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      post_id UUID NOT NULL
        REFERENCES posts(id) ON DELETE CASCADE,
      user_id UUID NOT NULL
        REFERENCES user_info(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (post_id, user_id)
    );

    -- 4. Saved posts
    CREATE TABLE IF NOT EXISTS saved_posts (   
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      post_id UUID NOT NULL
        REFERENCES posts(id) ON DELETE CASCADE,
      user_id UUID NOT NULL
        REFERENCES user_info(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (post_id, user_id)
    );

    -- 5. Indexes
    CREATE INDEX IF NOT EXISTS idx_posts_feed
      ON posts (is_active, created_at DESC);

    CREATE INDEX IF NOT EXISTS idx_posts_location
      ON posts (state, district, taluk,locality);

    CREATE INDEX IF NOT EXISTS idx_posts_type
      ON posts (type, created_at DESC);

    CREATE INDEX IF NOT EXISTS idx_comments_post
      ON comments (post_id, created_at DESC);

    CREATE INDEX IF NOT EXISTS idx_likes_post
      ON post_likes (post_id);

    CREATE INDEX IF NOT EXISTS idx_saved_posts_user
      ON saved_posts (user_id, created_at DESC);
  `;

    const q2 = `
      CREATE TABLE IF NOT EXISTS account_upgrade_requests (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

          user_id UUID NOT NULL
              REFERENCES user_info(id) ON DELETE CASCADE,

          wanted_role VARCHAR(40) NOT NULL
              CHECK (
                  wanted_role IN (
                      'business',
                      'local_community_member',
                      'local_community_representative'
                  )
              ),

          state VARCHAR(100) NOT NULL,
          district VARCHAR(100) NOT NULL,
          taluk VARCHAR(100) NOT NULL,
          locality VARCHAR(150) NOT NULL,

          status VARCHAR(20) NOT NULL DEFAULT 'pending'
              CHECK (
                  status IN ('pending', 'approved', 'rejected')
              ),

          reason TEXT,
          rspns_note TEXT,

          reviewed_by UUID
              REFERENCES user_info(id) ON DELETE SET NULL,

          reviewed_at TIMESTAMPTZ,

          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_upgrade_requests_user_id
          ON account_upgrade_requests(user_id);

      CREATE INDEX IF NOT EXISTS idx_upgrade_requests_status
          ON account_upgrade_requests(status);
    `;
    try {
    await pool.query(Q)
    await pool.query(query12);
    await pool.query(q2);
    await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,

        to_id UUID NOT NULL
            REFERENCES user_info(id)
            ON DELETE CASCADE,

        from_id UUID NOT NULL
            REFERENCES user_info(id)
            ON DELETE CASCADE,
        from_name  VARCHAR(100),

        type VARCHAR(50) NOT NULL,
        msg TEXT,
       

        is_read BOOLEAN DEFAULT FALSE,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
        `);
    console.log("Post, comment, like, and saved-post tables created successfully.");
  } catch (error) {
    console.error("Error creating post tables:", error.message);
    throw error;
  }
}




export const insert_user = async(user_data) =>{
    console.log("ism in dbinsert",user_data)
   

    
    try {
        const query_string = `INSERT INTO user_info (name, email, password_hash, location) VALUES($1,$2,$3,$4 ) RETURNING id ,location , role ;`
        const query_data = [user_data.name , user_data.email , user_data.hassed_pass, user_data.location]
        const res =  (await pool.query(query_string ,query_data)).rows[0]
        console.log(res.id)
        return  {msg : "succesfull" , id : res.id ,role :res.role , location :res.location}

    }
    catch(err){
        console.log(err)
        return {msg : "un-succesfull"}

    }
     
}
export const insert_admin = async(user_data) =>{
    console.log("ism in dbinsert admin",user_data)
 
    try {
        const query_string = `
          INSERT INTO user_info (name, email, password_hash, location, role)
          VALUES ($1, $2, $3, $4, 'admin')
          RETURNING id, location, role;
      `;

        const query_data = [user_data.name , user_data.email , user_data.hassed_pass, user_data.location]
        const res =  (await pool.query(query_string ,query_data)).rows[0]
        console.log(res.id)
        return  {msg : "succesfull" , id : res.id ,role :res.role , location :res.location}

    }
    catch(err){
        console.log(err)
        return {msg : "un-succesfull"}

    }
}


export const insert_noti = async(From_id,from_name ,to_id ,type,msg )=>{
   
    console.log("insert notification")
    try{
        const ans = await pool.query(`INSERT INTO notifications(to_id, from_id,from_name,type ,msg)VALUES($1, $2, $3 ,$4,$5)`,[to_id,From_id,from_name,type,msg] )
        console.log("insert notification")
     return {success : true }
    }
    
    catch(error){
        console.log(error)
        return {success : false}
    }

}



export const  sign_in_retrive =async (user_data)=>{

    try {
      
        const query_string = `SELECT id,password_hash,location , role  FROM user_info where email = $1 `
        const query_data = [ user_data.email ]

        const res =(await pool.query(query_string ,query_data))
        if (res.rows.length === 0) {
        return { msg: "un-succesfull" };
        }
        const user = res.rows[0]
        return {msg : "succesfull" , hash_pass : user.password_hash,id : user.id ,role :user.role , location :user.location}

    }
    catch(err){
        console.log(err)
        return {msg : "un-succesfull"}

    }



}

export const update_user = async(user_data) =>{
      try {
        const query_update = `UPDATE user_info SET  password_hash = $1 WHERE email = $2;`
      
        const query_data = [user_data.pass, user_data.email]

        const res = await pool.query(query_update,query_data)
        return {msg : "succesfull" }

    }
    catch(err){
        console.log(err)
        return {msg : "un-succesfull"}

    }

   

}





export const update_user_info_db = async(user_data, user_id)=>{
    console.log("iam in udpdatequerey create function")

    try{
        const ans_query = createUpdateQuery(user_data ,user_id)
        const get_user_qury =ans_query.query
        const values = ans_query.values
        console.log(get_user_qury,values)
        pool.query(get_user_qury ,values)
        
        return {success : true };
    }

    catch(error){
        console.log(error)
        return {error : error}
    }

}

export const update_profile_photot = async(id ,url)=>{
    try{
    await pool.query(
    `
    UPDATE user_info
    SET profile_image_url = $1
    WHERE id = $2;
    `,
    [url, id]);

    return {success : true}
    }catch(eror){
        console.log("error while update profile " ,eror)
        return {success : false}

    }

}


export const insert_posts = async(values)=>{
    const query = `
        INSERT INTO posts (
            user_id,
            title,
            type,
            description,
            image_url,
            profile_image_url,
            state,
            district,
            taluk,
            locality,
            acc_type,
            name
            
           
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9,$10,$11,$12);
        `;
    
       
    try{

        const result = await pool.query(query, values);
        return {success : true}
    }catch(eror){
        console.log("error while update profile " ,eror)
        return {success : false}

    }


}

export const hndl_Upreq_db = async(user_id, user_location ,role ,desc)=>{
    const query = `
        INSERT INTO account_upgrade_requests (
            user_id,
            wanted_role,
            state,
            district,
            taluk,
            locality,
            reason
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
    `;
    const values = [
        user_id,
        role,
        user_location.state,
        user_location.district,
        user_location.taluk,
        user_location.locality,
        desc
    ];
    try{
        const result = (await pool.query(query, values)).rows;
        return {success : true , data : result}
    }catch(eror){
        console.log("error while update profile " ,eror)
        return {success : false}

    }


}



