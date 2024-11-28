import {start} from './router';
import {wss} from './wss';
import {CONFIG} from "../browser/common/config";
import * as fs from "fs";

try {
  const config = JSON.parse(fs.readFileSync('./static/config.json', {encoding: 'utf8', flag: 'r'}));
  console.log('loaded config', config);
  console.log('final config: ', JSON.stringify(CONFIG));

  const {server, router} = start();
  console.log(`** Router: ${router.report}`);
  console.log(`** Server address: ${server.address()}`);
  console.log(`** Wss address: ${wss().address()}`);
} catch (e) {
  console.error('Wrong start', e);
}
