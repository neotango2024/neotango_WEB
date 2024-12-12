
import fs from 'fs';
import path from 'path';
import Sequelize from 'sequelize';
import configData from '../config/config.js';
import { fileURLToPath, pathToFileURL } from 'url';

const env = process.env.NODE_ENV || 'development';
const config = configData[env];

// Reemplazo de __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const basename = path.basename(__filename);
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}
sequelize.authenticate()
  .then(() => console.log('Conexión exitosa a la base de datos.'))
  .catch((err) => console.error('Error de conexión a la base de datos:', err));

const files = fs.readdirSync(__dirname).filter(file => {
  return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
});

for (const file of files) {
  const modelPath = pathToFileURL(path.join(__dirname, file)); 
  const { default: model } = await import(modelPath.href); 
  const modelInstance = model(sequelize, Sequelize.DataTypes);
  db[modelInstance.name] = modelInstance;
}

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;