import "dotenv/config";
import express from 'express'
import logger from './middle_ware/loggeres.js' 
import cors  from 'cors'
import error_handler from './middle_ware/ErrorHnadling.js'
import router from './routes/app_routes.js'
import p_routes from './routes/protected_routes.js'
import cookieParser from "cookie-parser";
import {datacreate} from './controlers/databaseactions/databse.js';
import authentication from './middle_ware/auth.js'
import {test_jwt_refresh} from './middle_ware/auth.js'
import { createServer } from "http";
import { Server } from "socket.io";
import { initSocket } from "./socket.js";
const FRONTEND_URL = process.env.FRONTEND_URL;
import { pool } from './configs/database_config.js';






//----databse------------

datacreate();





//  ----global declaration ----
const app = express()
const PORT = 8000

const users = new Map();

const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: FRONTEND_URL,
        credentials: true
    }
});
//initSocket(io,users);









//----serever----
app.use(cors({
    origin: FRONTEND_URL,
    credentials: true
}));
app.use(express.json())
app.use(cookieParser())
app.use(logger);




app.use("/api", router)
app.use(authentication)
app.use("/protectedApi",p_routes)






/*

io.use((socket, next) => {
    console.log("iam in socket .use")
    try {

        const cookies = socket.handshake.headers.cookie;

        if (!cookies) {
            return next(new Error("Authentication required"));
        }

        const accessToken = cookies
            .split("; ")
            .find(row => row.startsWith("refreshToken="))
            ?.split("=")[1];

        if (!accessToken) {
            return next(new Error("Authentication required"));
        }

        const ans = test_jwt_refresh(accessToken)
        // JWT authenticated user
        socket.user_id = ans.id;
        console.log("authenticated:", socket.user_id);
        next();

    } catch (error) {
        console.log("JWT error:", error.message);
        next(new Error("Unauthorized"));
    }

});

io.on("connection", async(socket ,next) => {
    console.log("//////////////////////////////////////////////////")
    console.log("User connected:", socket.user_id);
    users.set(socket.user_id, socket.id);
    const ansf = await  friend_id(socket.user_id)
    const userId = socket.user_id
    const friendIdS =  ansf.data || []
    console.log( "tyytyty:",ansf)
    if(ansf.success){
         
         /////
          const friendIds =  ansf.data

        // Find currently online friends
        const onlfr = friendIds.filter(friendId => users.has(friendId.friend_id))
       const onlineFriends = onlfr.map(friendId => friendId.friend_id);
        console.log("all_users" , users)
        console.log("online friends" , onlineFriends)

        // Tell this user
        socket.emit("friends_online", onlineFriends);

        // Tell online friends that this user came online
        for (const friendId of onlineFriends) {

            const friendSocket = users.get(friendId);
            console.log("socket : id",friendSocket ,friendId)

            if (friendSocket) {
                io.to(friendSocket).emit("friend_online", userId);
            }
        }





         //////


    }

    socket.on("send_message", async(data) => {
        console.log(data)
        const ans= await chat_update(data) 
        console.log("my firds" , ans)
        if(ans.success){
            const receiverSocketId = users.get(data.To);
            console.log(receiverSocketId,ans.data)
            if (receiverSocketId) {
            console.log("sent")
            io.to(receiverSocketId).emit("new_message", ans.data);
        }
        else{ console.log("offline")}
    }

    });






  socket.on("disconnect", () => {

    if (users.get(socket.user_id) === socket.id) {
        users.delete(socket.user_id);
        const onlfr = friendIdS.filter(friendId => users.has(friendId.friend_id))
       const onlineFriends = onlfr.map(friendId => friendId.friend_id);

            
      // Tell friends this user went offline
            for (const friendId of onlineFriends) {

                const friendSocketId = users.get(friendId);
                console.log(friendSocketId , friendId)

                if (friendSocketId) {

                    console.log("sending disconnect to ", friendSocketId)
                    io.to(friendSocketId).emit(
                        "friend_offline",
                        userId
                    );

                }
            }
        }
});
});        

*/

app.use((req ,res , next) =>{
    const err =new Error('not found');
    err.status =404;
    next(err)
})
app.use(error_handler)






server.listen(PORT, ()=>{
    console.log(`srever initiated at [${PORT}] .......`)


})