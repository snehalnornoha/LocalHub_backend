import { pool } from '../../configs/database_config.js';

export const get_advert_post = async(user_id) =>{
    const result = await pool.query(
        `SELECT COUNT(*) AS total_posts
        FROM posts
        WHERE user_id = $1`,
        [user_id]
        );
    const totalPosts = Number(result.rows[0].total_posts);
    if(totalPosts === 0){
      return({success : true})
    }else{return({success : false})}
}


export const get_user_info_db = async(user_data )=>{
   

    try{
        const get_user_qury = `SELECT
        id,
        name,
        email,
        role,
        location,
        profile_image_url,
      
        is_active,
        created_at,
        updated_at
         FROM user_info
      WHERE id = ANY($1)
    `;
    const ans = (await pool.query(get_user_qury ,[user_data])).rows
     return {success : true , info : ans }
    }
    
    catch(error){
        console.log(error)
        return {success : false}
    }

}


export const get_posts_db = async (type,user_data,page = 0) => {
  console.log(user_data,page)
  const q = `
    WITH ads AS (
      SELECT p.*, NULL::integer AS location_priority
      FROM posts p
      WHERE p.type = 'ADVERTISEMENT'
        AND p.is_active = TRUE
      ORDER BY p.created_at DESC
      LIMIT 1
    ),
    matching AS (
      SELECT p.*,
        CASE
          WHEN p.locality = $1 AND p.taluk = $2
            AND p.district = $3 AND p.state = $4 THEN 1
          WHEN p.taluk = $2 AND p.district = $3
            AND p.state = $4 THEN 2
          WHEN p.district = $3 AND p.state = $4 THEN 3
          ELSE 4
        END AS location_priority
      FROM posts p
      WHERE p.type = ANY($5::varchar[])
        AND p.is_active = TRUE
    ),
    selected AS (
      SELECT *
      FROM matching
      ORDER BY location_priority, created_at DESC
      LIMIT 10 OFFSET $6
    )
    SELECT *
    FROM (
      SELECT ads.*, 1 AS pos FROM ads
      UNION ALL
      SELECT selected.*, 2 AS pos FROM selected
    ) AS feed
    ORDER BY pos, location_priority, created_at DESC;
  `;

  const postTypes = {
    JOBS: ["JOB", "WORK"],
    EVENTS: ["EVENT"],
    ALERTS: ["ALERT"],
    PUBLIC_NOTICES: ["COMMUNITY"]
  };

  try {
    const offset = page * 9;

    const ans = (
      await pool.query(q, [
        ...user_data,
        postTypes[type],
        offset
      ])
    ).rows;

    return {
      success: true,
      posts: ans.slice(0, 10),
      isnext: ans.length > 10
    };
  } catch (error) {
    console.log(error);
    return { success: false };
  }
};

//home page
export const  get_explore_db= async(user_data ,page = 0)=>{
  console.log(user_data,page)
    const q= `
                WITH ads AS (
            SELECT *,
                ROW_NUMBER() OVER (ORDER BY created_at DESC) AS rn
            FROM posts
            WHERE type = 'ADVERTISEMENT'
            AND is_active = TRUE
        ),
        others AS (
            SELECT *,
                ROW_NUMBER() OVER (
                    ORDER BY
                        CASE
                            WHEN locality = $1
                                AND taluk = $2
                                AND district = $3
                                AND state = $4 THEN 1
                            WHEN taluk = $2
                                AND district = $3
                                AND state = $4 THEN 2
                            WHEN district = $3
                                AND state = $4 THEN 3
                            ELSE 4
                        END,
                        created_at DESC
                ) AS rn
            FROM posts
            WHERE type <> 'ADVERTISEMENT'
            AND is_active = TRUE
        )
        SELECT *
        FROM (
            SELECT ads.*, 1 AS pos
            FROM ads
            WHERE rn = 1

            UNION ALL

            SELECT others.*,
                CASE
                    WHEN rn < 9 THEN rn + 1
                    ELSE rn + 2
                END AS pos
            FROM others
            WHERE rn <= 18

            UNION ALL

            SELECT ads.*, 10 AS pos
            FROM ads
            WHERE rn = 2
        ) AS feed
        ORDER BY pos
        LIMIT 21 OFFSET $5;
        `
    try{
        const offset = page * 9;
        const ans = (await pool.query(q, [...user_data, offset])).rows;

        const next = ans.length > 10;

        return {
        success: true,
        posts: ans.slice(0, 10),
        isnext :next
        };
    }
    
    catch(error){
        console.log(error)
        return {success : false}
    }

}
export const get_advertisements_db = async (snd_data,page = 0) => {
  console.log(snd_data,page)
    const q =` SELECT *
            FROM posts
            WHERE type = 'ADVERTISEMENT'
              AND is_active = TRUE
              AND state = $1
              AND district = $2
              AND taluk = $3
              AND locality = $4
            ORDER BY created_at DESC
            LIMIT 11 OFFSET $5;
          `

    try{
        const offset = page * 9;
        const ans = (await pool.query(q, [...snd_data, offset])).rows;

        const next = ans.length > 10;

        return {
        success: true,
        posts: ans.slice(0, 10),
        isnext : next
        };
    }
    
    catch(error){
        console.log(error)
        return {success : false}
    }
};

export const get_jobs_db = async (snd_data,page = 0) => {
   return get_posts_db('JOBS',snd_data,page)
};



export const get_public_notices_db = async (snd_data,page = 0) => {
   return get_posts_db('PUBLIC_NOTICES',snd_data,page)
};

export const get_alerts_db = async (snd_data,page = 0) => {
    return get_posts_db('ALERTS',snd_data,page)
};

export const get_events_db = async (snd_data,page = 0) => {
    return get_posts_db('EVENTS',snd_data,page)
};
