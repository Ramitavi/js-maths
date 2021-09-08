const Runspace = require("./src/runspace/Runspace");
const readline = require("readline");
const { define, defineVars, defineFuncs } = require("./src/init/def");
const { consoleColours, printError } = require("./src/utils");
const Complex = require('./src/maths/Complex');
const { parseArgString } = require("./src/init/args");
const { RunspaceBuiltinFunction } = require("./src/runspace/Function");
const { StringValue, UndefinedValue } = require("./src/evaluation/values");
const { errors } = require("./src/errors");

// PARSE ARGV, SETUP RUNSPACE
const opts = parseArgString(process.argv, true);
if (opts.imag !== undefined) Complex.imagLetter = opts.imag; else opts.imag = Complex.imagLetter;
opts.app = 'CLI';
opts.dir = __dirname;
opts.file = __filename;
const rs = new Runspace(opts);
define(rs);
if (opts.defineVars) defineVars(rs);
if (opts.defineFuncs) defineFuncs(rs);

// Evaluate some input
async function evaluate(input) {
  let output, err, time;
  try {
    let start = Date.now();
    output = await rs.execute(input);
    time = Date.now() - start;
    if (output !== undefined) output = output.toString();
  } catch (e) {
    err = e;
  }

  if (err) {
    if (opts.niceErrors) {
      printError(err, str => rs.io.output.write(str));
    } else {
      console.trace(err);
    }
  } else {
    if (output !== undefined) {
      rs.io.output.write(output + '\n');
    }
    if (opts.timeExecution) {
      rs.io.output.write(`** Took ${time} ms\n`);
    }
  }
  return output;
}

async function main() {
  // Import standard IO library
  await rs.import("io.js");

  // Set prompt
  rs.io.setPrompt(opts.prompt);

  // Print intro stuff to screen
  if (opts.intro) {
    rs.io.output.write(`${__filename} - JS Maths CLI\nType help() for basic help\n`);
    let notes = [];
    if (opts.strict) notes.push("strict mode is enabled");
    if (!opts.bidmas) notes.push("BIDMAS is being ignored");
    if (!opts.niceErrors) notes.push("fatal errors are enabled");
    if (!opts.defineVars) notes.push("pre-defined variables were not defined");
    if (!opts.defineFuncs) notes.push("pre-defined functions were not defined");
    if (!opts.ans) notes.push("variable ans is not defined");
    if (!opts.defineAliases) notes.push("function/variables aliases were not defined");
    notes.forEach(note => rs.io.output.write(`${consoleColours.Bright}${consoleColours.FgWhite}${consoleColours.Reverse}Note${consoleColours.Reset} ${note}\n`));
    rs.io.output.write('\n');
  }

  // Set input event handlers
  if (opts.multiline) {
    const lines = []; // Line buffer
    rs.io.on('line', async (line) => {
      if (line.length === 0) {
        const input = lines.join('\n');
        lines.length = 0;
        await evaluate(input);
        rs.io.setPrompt(opts.prompt);
      } else {
        lines.push(line);
        rs.io.setPrompt('.'.repeat(opts.prompt.length - 1) + ' ');
      }

      rs.io.prompt();
    });
  } else {
    rs.io.on('line', async (line) => {
      await evaluate(line);
      rs.io.prompt();
    });
  }

  rs.io.on('close', async () => {
    rs.io.output.write('^C\n');
    await rs.execute('exit()'); // Simulate call to exit()
    process.exit(); // As a fallback
  });

  // Initialialise prompt
  rs.io.prompt();
}

main();
