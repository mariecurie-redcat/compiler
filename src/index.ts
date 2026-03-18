import fs from 'fs';
import path from 'path';
import { Scanner } from './scanner.js';
import { Parser } from './parser.js';
import { Interpreter } from './visitor.js';

const rootDir = path.resolve('src/calc.txt');

export function scan(filePath: string): string[] {
  const file = fs.readFileSync(filePath, 'utf-8');
  return file.split('\n');
}

const sanner = new Scanner(scan(rootDir).join('\n'))
const tokens = sanner.scanTokens()

console.log(tokens)

const parser = new Parser(tokens)
const statements = parser.parse()

const interpreter = new Interpreter()
interpreter.interpret(statements)