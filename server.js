const express = require('express');
const db = require('./app/models');

const app = express();

app.use(express.json());

db.sequelize.sync()
    .then(() => console.log("Base de datos conectada."))
    .catch(err => console.error("Error al conectar la base de datos:", err));

app.use('/api', require('./app/routes/user.routes'));
app.use('/api', require('./app/routes/bootcamp.routes'));

app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});



