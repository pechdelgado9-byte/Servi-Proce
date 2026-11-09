const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// Inicializa Next.js en modo producción para cPanel / Passenger
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error al procesar la solicitud:', req.url, err);
      res.statusCode = 500;
      res.end('Error interno del servidor');
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Servidor ServiProce listo en puerto ${port}`);
  });
});
