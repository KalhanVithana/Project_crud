const jwt = require('jsonwebtoken')

const verifyToken = (req,res,next)=>{
    
    const brearHeader = req.headers['authorization']
    const token = brearHeader && brearHeader.split(' ')[1]

    if(token == null) return res.sendStatus(401);
        let verify = jwt.verify(token, process.env.JWT_Token);
        if(!verify){
            return res.status(401).json({msg:"Token verification faild"})
        }
        console.log(verify)
        req.user = verify.id
        next();
}


module.exports =verifyToken;