class sidebarModel {
    #content = {}

    constructor(title){
        this.#content.title = title
        this.#content.items = []
    }

    addItem(title, requestURL, target){
        this.#content.items.push({
            "title": title,
            "requestURL": requestURL,
            "target": target
        })
    }

    get sidebar(){
        return this.#content
    }
}

module.exports = sidebarModel
