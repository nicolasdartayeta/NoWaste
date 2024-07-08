const roleModel = require('../models/role')
const usuarioModel = require ('../models/usuario')

const createRoles = async () => {
    const count = await roleModel.estimatedDocumentCount()

    if (count > 0) return;  //Si los roles ya estan creados, no se hace nada

    await Promise.all([
        new roleModel({nombre:'user'}).save(),
        new roleModel({nombre:'superAdmin'}).save(),
    ])

    const role = await roleModel.findOne({nombre:"superAdmin"})
    const nuevoSuperAdmin = new usuarioModel({
        email: process.env.SUPER_ADMIN_EMAIL,
        username: 'SuperAdmin',
        password: process.env.SUPER_ADMIN_PASSWORD,
        roles: [role._id]
      });
    nuevoSuperAdmin.password = await nuevoSuperAdmin.encriptar(process.env.SUPER_ADMIN_PASSWORD)
    await nuevoSuperAdmin.save()
}

module.exports = createRoles;