function obtenerCiudad(ip) {
    return new Promise((resolve, reject) => {
      // Opciones de la solicitud, construyendo la URL con la IP
      const options = {
        hostname: 'ip-api.com',
        port: 80,
        path: `/json/190.246.97.123`,
        method: 'GET'
      };
  
      const req = http.request(options, (res) => {
        let responseData = '';
  
        res.on('data', (chunk) => {
          responseData += chunk;
        });
  
        res.on('end', () => {
          try {
            const parsedData = JSON.parse(responseData);
            resolve(parsedData);
          } catch (e) {
            reject(e);
          }
        });
      });
  
      req.on('error', (error) => {
        reject(error);
      });
  
      req.end();
    });
}

module.exports = obtenerCiudad