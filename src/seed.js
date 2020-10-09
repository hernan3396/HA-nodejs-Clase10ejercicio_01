const mongoose = require('mongoose');
const teams = require('./teams.json');
const Team = require('./models/team');

mongoose
  .connect('mongodb://localhost/clase10', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('Base de datos lista para recibir conexiones');
    return Team.estimatedDocumentCount();
  })
  .then((count) => {
    if (count > 0) {
      return mongoose.connection.dropCollection(Team.collection.name);
    }
  })
  .then(() => {
    return Team.insertMany(teams);
  })
  .then((docs) => {
    console.log(`Se guardaron ${docs.length} equipos en la base de datos`);
  })
  .catch(console.error)
  .finally(() => {
    mongoose.connection.close();
  });
