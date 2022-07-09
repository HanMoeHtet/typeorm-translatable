import fs from 'fs';
import path from 'path';

export const logToOut = (name: string, obj: any) => {
  fs.writeFileSync(
    path.join(__dirname, '../../out/', `${name}.json`),
    JSON.stringify(obj, null, 2)
  );
};
