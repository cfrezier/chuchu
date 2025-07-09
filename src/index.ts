import {start} from './router';
import {wss} from './wss';
import {CONFIG} from "../browser/common/config";
import * as fs from "fs";

try {
  const config = JSON.parse(fs.readFileSync('./static/config.json', {encoding: 'utf8', flag: 'r'}));
  console.log('loaded config', config);

  // Fusionne les valeurs de chaque clé de config dans CONFIG
  Object.keys(config).forEach(key => {
    if (typeof CONFIG[key] === 'object' && typeof config[key] === 'object' && CONFIG[key] !== null && config[key] !== null) {
      CONFIG[key] = {...CONFIG[key], ...config[key]};
    } else {
      CONFIG[key] = config[key];
    }
  });

  console.log('final config: ', JSON.stringify(CONFIG));

  const {server, router} = start();
  console.log(`** Router: ${router.report}`);
  console.log(`** Server address: ${server.address()}`);
  console.log(`** Wss address: ${wss().address()}`);
} catch (e) {
  console.error('Wrong start', e);
}
