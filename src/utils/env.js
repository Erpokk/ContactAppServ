import dotenv from 'dotenv';

dotenv.config();

export function env(name, defVal)  {
    const val = process.env[name];
    if (val) return val;

    if (defVal) return defVal;

    throw new Error(`Missing: process.env['${name}'].`);
};
