const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT,'0.0.0.0', () => {
  console.log(`Servidor rodando na porta,  ${PORT}`);
  console.log('Backend do Guia Santa Cruz está online! 🚀');
});