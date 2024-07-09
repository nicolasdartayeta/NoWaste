function obtenerCiudadl(lat,lng) {
    let key = process.env.APIKEY_LOCATIONIQ;
    const apiUrl = `https://us1.locationiq.com/v1/reverse?key=${key}&lat=${lat}&lon=${lng}&format=json&`;
    const options = {method: 'GET', headers: {accept: 'application/json'}};

    return new Promise((resolve, reject) => {
      fetch(apiUrl, options)
        .then(response => response.json())
        .then(data => {
          if (data && data.address && data.address.city) {
            resolve(data.address.city);
          } else {
            reject('No se pudo obtener la ciudad de la respuesta.');
          }
        })
        .catch(err => reject(err));
    });
}

module.exports = obtenerCiudadl