// server.js
const http = require('http');
const ExcelJS = require('exceljs');

const PORT = 3000;

const server = http.createServer(async (req, res) => {
  // Solo aceptamos GET /reporte
  if (req.method === 'GET' && req.url === '/reporte') {
    try {
      
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Ventas');

      sheet.columns = [
        { header: 'Producto', key: 'producto', width: 25 },
        { header: 'Cantidad', key: 'cantidad', width: 12 },
        { header: 'Precio',   key: 'precio',   width: 12 }
      ];

      const rows = [];
      for (let i = 1; i <= 20; i++) {
        rows.push({
          producto: `Producto ${i}`,
          cantidad: Math.ceil((i * 3) % 17) + 1, 
          precio: Number((i * 2.5).toFixed(2))   
        });
      }
      sheet.addRows(rows);
      sheet.getColumn('precio').numFmt = '[$S/] #,##0.00';

      res.writeHead(200, {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="reporte.xlsx"',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Expires: '0',
        Pragma: 'no-cache'
      });

      await workbook.xlsx.write(res);

      res.end();
    } catch (err) {
      console.error('Error generando el Excel:', err);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      }
      res.end('Error del servidor al generar el Excel');
    }

    return;
  }

  // Validación de rutas: cualquier otra ruta
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Visita /reporte para descargar el Excel');
});

server.on('clientError', (err, socket) => {
  try {
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
  } catch { /* noop */ }
});

server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
