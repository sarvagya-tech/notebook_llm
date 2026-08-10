import express from "express";
import "dotenv/config"
import prisma from "./db.js";

const app = express();

const port = process.env.PORT ??  3000;


app.get('/',async(req,res)=>{
    const allUser = await prisma.user.findMany()
    res.json({status :200,data :allUser,message :"this is all user"})
});

app.listen(port,()=>{
   console.log( `server is running on the  portnumber ${port}`);
})

export {app};