import { auth } from "../lib/auth";

try {
    const isAuthenticated = async (req,res,next)=>{
    
        const session = await auth.api.getSession({
            headers : req.headers,
        });
         if (!session) {
          return res.status(401).json({
            success: false,
            message: "You are not logged in",
          });
        }
        req.session = session;
        req.user = session.user;
        next();
    
    
    }
    
} catch (error) {
    console.log("authentication err",error);
      return res.status(500).json({
      success: false,
      message: "Authentication failed",
      });
    
}