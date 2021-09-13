const jwt=require('jsonwebtoken');

const isLoggedIn=(req,res,next)=>{

    try{

        const token=req.cookies.token;

        if(!token){
            return res.status(401).json({errorMessage:"Unauthorized User"});
        }
        const verified=jwt.verify(token,process.env.JWT_SECRET);
        req.user=verified.user;
        next();

    }catch(err){
        console.log(e);
        res.status(401).json({errorMessage:"Unauthorized User"})
    }
}

module.exports={isLoggedIn};