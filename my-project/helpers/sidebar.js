const restauranteModel = require('../models/restaurante')
class sidebarModel {
    #content = {}

    constructor(title){
        this.#content.title = title
        this.#content.items = []
    }

    addItem(title, requestURL, target, id, deletable){
        console.log(deletable)
        let item = {
            "title": title,
            "requestURL": requestURL,
            "target": target,
        }
        if (id){
            item.id = id
        }
        item.deletable = deletable
        // console.log(item)
        this.#content.items.push(item)
    }

    get sidebar(){
        return this.#content
    }
}

async function sidebarRestaurantes(baseURL, deletable="false") {
    const restaurantes = await restauranteModel.find().exec()
    const sidebar = new sidebarModel('Lista de comercios')
    console.log(deletable)
    restaurantes.forEach((restaurante) => sidebar.addItem(  restaurante.nombre, 
                                                            `${baseURL}/show/${restaurante._id}`, 
                                                            "#content", restaurante._id.toString(),
                                                            deletable,
                                                        ))
    return sidebar.sidebar
}

exports.Sidebar = sidebarModel
exports.sidebarRestaurantes = sidebarRestaurantes
