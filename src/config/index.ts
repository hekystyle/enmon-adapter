import plainConfig from 'config';
import { parseConfig } from './parse.js';

export default await parseConfig(plainConfig);
