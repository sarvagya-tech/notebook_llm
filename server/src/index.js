import express from "express";
import "dotenv/config"
import prisma from "./lib/db.js";
import { auth } from "./lib/auth.js";
import { toNodeHandler } from "better-auth/node";
import { inngest } from "./inngest/client.js";
import { serve } from "inngest/express";
import { functions } from "./inngest/index.js";

const app = express();

const port = process.env.PORT ??  3000;


app.all("/api/auth/*any", toNodeHandler(auth));
// Mount express json middleware after Better Auth handler
// or only apply it to routes that don't interact with Better Auth
app.use(express.json());

app.use("/api/inngest", serve({ client: inngest, functions }));


app.get('/',async(req,res)=>{
    const allUser = await prisma.user.findMany()
    res.json({status :200,data :allUser,message :"this is all user"})
});

app.listen(port,()=>{
   console.log( `server is running on the  portnumber ${port}`);
})

export {app};