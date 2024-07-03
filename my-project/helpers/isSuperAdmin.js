const roleModel = require('../models/role')

async function isSuperAdmin(req,res,next){
    const roles = await roleModel.find({_id: {$in: req.user.roles}})

    for (let i =0; i< roles.length; i++){
        console.log(roles)
        if (roles[i].nombre === 'superAdmin'){
            return next()
        }
    }
    res.status(403).send()
}

module.exports = isSuperAdmin