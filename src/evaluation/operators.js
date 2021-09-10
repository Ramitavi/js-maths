// "<operator>": {
//   precedence: <int>,       // Precedence of operator
//   args: <int> | <int[]>,   // Argument count, or array of argument counts (for overloads)
//   fn: ...,                 // Function called if only one overload
//   fn<overload-n>: ...,     // Function called corresponding to arg length overload e.g. fn2, fn1
//   desc: <string>,          // Description of operator
//   syntax: <string>,        // Syntax of how operator is used
//   unary: <string|null>     // If present, and if operator meets unary criteria, use this operator instead
//   assoc: "ltr" | "rtl"
//   hidden?: <boolean>       // Hide operator i.e. operator is not an option in parsing. Optional.
// },

const { errors } = require("../errors");
const { UndefinedValue } = require("./values");

const operators = {
  ".": {
    name: 'member access',
    precedence: 20,
    args: 2,
    fn: (obj, prop) => {
      obj = obj.castTo('any');
      if (!obj.__get__) throw new Error(`[${errors.BAD_PROP}] Key Error: Cannot access property ${prop} of type ${obj.type()}`);
      return obj.castTo('any').__get__(prop.castTo('any'));
    },
    desc: `Access property <prop> of <obj>`,
    syntax: '<obj>.<prop>',
    assoc: 'ltr',
  },
  "?.": {
    name: 'oprional member access',
    precedence: 20,
    args: 2,
    fn: (obj, prop) => {
      obj = obj.castTo('any');
      if (obj instanceof UndefinedValue) return new UndefinedValue(obj.rs);
      if (!obj.__get__) throw new Error(`[${errors.BAD_PROP}] Key Error: Cannot access property ${prop} of type ${obj.type()}`);
      return obj.castTo('any').__get__(prop.castTo('any'));
    },
    desc: `Access property <prop> of <obj>`,
    syntax: '<obj>.<prop>',
    assoc: 'ltr',
  },
  "deg": { // !CUSTOM; degrees to radians
    name: 'degrees',
    precedence: 18,
    args: 1,
    fn: z => z.castTo('any').__deg__?.(),
    desc: `Take argument as degrees and convert to radians`,
    syntax: '<a>deg',
    assoc: 'rtl',
  },
  "~": {
    name: 'bitwise not',
    precedence: 17,
    args: 1,
    fn: x => x.castTo('any').__bitwiseNot__?.(),
    desc: `Bitwise NOT`,
    syntax: '~x',
    assoc: 'rtl',
  },
  "u&": {
    name: 'dereference',
    precedence: 17,
    args: 1,
    fn: t => t.castTo('any').__deref__(),
    desc: `Get value pointer to by a reference type`,
    syntax: '&t',
    unary: 'u&',
    assoc: 'rtl',
  },
  "u*": {
    name: 'reference',
    precedence: 17,
    args: 1,
    fn: t => t.castTo('any').__ref__(),
    desc: `Get a reference to a value`,
    syntax: '*t',
    unary: 'u*',
    assoc: 'rtl',
  },
  "u+": {
    name: 'unary plus',
    precedence: 17,
    args: 1,
    fn: n => n.castTo('any').__pos__?.(),
    desc: 'cast n into a number',
    syntax: '+n',
    unary: "u+",
    assoc: 'rtl',
  },
  "u-": {
    name: 'unary minus',
    precedence: 17,
    args: 1,
    fn: n => n.castTo('any').__neg__?.(),
    desc: 'cast n into a negative number',
    syntax: '-n',
    unary: "u-",
    assoc: 'rtl',
  },
  "'": {
    name: 'logical not',
    precedence: 17,
    args: 1,
    fn: x => x.castTo('any').__not__?.(),
    desc: `logical not unless x is of type set. Then, find complement of x (using universal set, ε)`,
    syntax: 'x\'',
    assoc: 'rtl',
  },
  "<cast>": {
    name: 'cast',
    precedence: 17,
    args: 1,
    fn: (val, type) => val.castTo(type),
    desc: `attempt to cast <val> to type <type>`,
    syntax: '<type> value',
    unary: "<cast>",
    assoc: 'rtl',
    hidden: true,
  },
  "**": {
    name: 'exponentation',
    precedence: 16,
    args: 2,
    fn: (a, b) => a.castTo('any').__pow__?.(b.castTo('any')),
    desc: `exponentation: raise a to the b`,
    syntax: 'a ** b',
    assoc: 'rtl',
  },
  ":": {
    name: 'sequence',
    precedence: 16,
    args: 2,
    fn: (a, b) => a.castTo('any').__seq__?.(b.castTo('any')),
    desc: `generates sequence a to b`,
    syntax: 'a:b',
    assoc: 'rtl',
  },
  "//": {
    name: 'interger division',
    precedence: 15,
    args: 2,
    fn: (a, b) => a.castTo('any').__intDiv__?.(b.castTo('any')),
    desc: `integer division a ÷ b`,
    syntax: 'a // b',
    assoc: 'ltr',
  },
  "/": {
    name: 'division',
    precedence: 15,
    args: 2,
    fn: (a, b) => a.castTo('any').__div__?.(b.castTo('any')),
    desc: `a ÷ b`,
    syntax: 'a / b',
    assoc: 'ltr',
  },
  "%": {
    name: 'modulo',
    precedence: 15,
    args: 2,
    fn: (a, b) => a.castTo('any').__mod__?.(b.castTo('any')),
    desc: `a % b (remainder of a ÷ b)`,
    syntax: 'a % b',
    assoc: 'ltr',
  },
  "*": {
    name: 'multiplication',
    precedence: 15,
    args: 2,
    fn: (a, b) => a.castTo('any').__mul__?.(b.castTo('any')),
    desc: `a × b`,
    syntax: 'a * b',
    unary: 'u*',
    assoc: 'ltr',
  },
  "∩": {
    name: 'intersection',
    precedence: 15,
    args: 2,
    fn: (a, b) => a.castTo('any').__intersect__?.(b.castTo('any')),
    desc: `a ∩ b`,
    syntax: 'intersection of a and b',
    assoc: 'ltr',
  },
  "+": {
    name: 'addition',
    precedence: 14,
    args: 2,
    fn: (a, b) => a.castTo('any').__add__?.(b.castTo('any')),
    desc: `a + b`,
    syntax: 'a + b',
    unary: 'u+',
    assoc: 'ltr',
  },
  "∪": {
    name: 'union',
    precedence: 14,
    args: 2,
    fn: (a, b) => a.castTo('any').__union__?.(b.castTo('any')),
    desc: `a ∪ b`,
    syntax: 'union of a and b',
    assoc: 'ltr',
  },
  "-": {
    name: 'subtract',
    precedence: 14,
    args: 2,
    fn: (a, b) => a.castTo('any').__sub__?.(b.castTo('any')),
    desc: `a - b`,
    syntax: 'a - b',
    unary: 'u-',
    assoc: 'ltr',
  },
  "<<": {
    name: 'right shift',
    precedence: 13,
    args: 2,
    fn: (a, b) => a.castTo('any').__lshift__?.(b.castTo('any')),
    desc: `Bitwise left shift a by b places`,
    syntax: 'a << b',
    assoc: 'ltr',
  },
  ">>": {
    name: 'left shift',
    precedence: 13,
    args: 2,
    fn: (a, b) => a.castTo('any').__rshift__?.(b.castTo('any')),
    desc: `Bitwise right shift a by b places`,
    syntax: 'a >> b',
    assoc: 'ltr',
  },
  "<=": {
    name: 'less than or equal to',
    precedence: 12,
    args: 2,
    fn: (a, b) => a.castTo('any').__le__?.(b.castTo('any')),
    desc: `a less than or equal to b`,
    syntax: 'a <= b',
    assoc: 'ltr',
  },
  "<": {
    name: 'less than',
    precedence: 12,
    args: 2,
    fn: (a, b) => a.castTo('any').__lt__?.(b.castTo('any')),
    desc: `a less than b`,
    syntax: 'a < b',
    assoc: 'ltr',
  },
  ">=": {
    name: 'greater than or equal to',
    precedence: 12,
    args: 2,
    fn: (a, b) => a.castTo('any').__ge__?.(b.castTo('any')),
    desc: `a greater than or equal to b`,
    syntax: 'a >= b',
    assoc: 'ltr',
  },
  ">": {
    name: 'greater than',
    precedence: 12,
    args: 2,
    fn: (a, b) => a.castTo('any').__gt__?.(b.castTo('any')),
    desc: `a greater than b`,
    syntax: 'a > b',
    assoc: 'ltr',
  },
  "in ": {
    name: 'in',
    precedence: 12,
    args: 2,
    fn: (a, b) => a.castTo('any').__in__?.(b.castTo('any')),
    desc: `check if <a> is in <b>. (NB a space after 'in' is required)`,
    syntax: 'a in b',
    assoc: 'rtl',
  },
  "==": {
    name: 'equality',
    precedence: 11,
    args: 2,
    fn: (a, b) => a.castTo('any').__eq__?.(b.castTo('any')),
    desc: `a equal to b`,
    syntax: 'a == b',
    assoc: 'ltr',
  },
  "!=": {
    name: 'inequality',
    precedence: 11,
    args: 2,
    fn: (a, b) => a.castTo('any').__neq__?.(b.castTo('any')),
    desc: `a not equal to b`,
    syntax: 'a != b',
    assoc: 'ltr',
  },
  "&&": {
    name: 'logical and',
    precedence: 7,
    args: 2,
    fn: (a, b) => a.castTo('any').__and__?.(b.castTo('any')),
    desc: `Logical AND`,
    syntax: 'a && b',
    assoc: 'ltr',
  },
  "&": {
    name: 'bitwise and',
    precedence: 10,
    args: 2,
    fn: (a, b) => a.castTo('any').__bitwiseAnd__?.(b.castTo('any')),
    desc: `Bitwise AND`,
    syntax: 'a & b',
    unary: 'u&',
    assoc: 'ltr',
  },
  "^": {
    name: 'bitwise xor',
    precedence: 9,
    args: 2,
    fn: (a, b) => a.castTo('any').__xor__?.(b.castTo('any')),
    desc: `Bitwise XOR`,
    syntax: 'a ^ b',
    assoc: 'ltr',
  },
  "||": {
    name: 'logical or',
    precedence: 6,
    args: 2,
    fn: (a, b) => a.castTo('any').__or__?.(b.castTo('any')),
    desc: `Logical OR`,
    syntax: 'a || b',
    assoc: 'ltr',
  },
  "|": {
    name: 'bitwise or',
    precedence: 8,
    args: 2,
    fn: (a, b) => a.castTo('any').__bitwiseOr__?.(b.castTo('any')),
    desc: `Bitwise OR`,
    syntax: 'a | b',
    assoc: 'ltr',
  },
  "??": {
    name: 'nullish coalescing',
    precedence: 5,
    args: 2,
    fn: (a, b) => a.castTo("any") instanceof UndefinedValue ? b : a,
    desc: `Returns <a> unless it is undefined, in which case return <b>`,
    syntax: 'a ?? b',
    assoc: 'ltr',
  },
  ":=": {
    name: 'constant assignment',
    precedence: 3,
    args: 2,
    fn: (symbol, value) => symbol.__assign__?.(value, true),
    desc: 'Set symbol <symbol> equal to <v> (cannot be reassigned)',
    syntax: 'symbol := v',
    assoc: 'rtl',
  },
  "=": {
    name: 'assignment',
    precedence: 3,
    args: 2,
    fn: (symbol, value) => symbol.__assign__?.(value, false),
    desc: 'Set symbol <symbol> equal to <v>',
    syntax: 'symbol = v',
    assoc: 'rtl',
  },

  "!": {
    name: 'factorial',
    precedence: 17,
    args: 1,
    fn: n => n.castTo('any').__excl__?.(),
    desc: `Calculate factorial of n. n must be a real, positive integer.`,
    syntax: 'a!',
    assoc: 'rtl',
  },
  ",": {
    name: 'comma',
    precedence: 1,
    args: 2,
    fn: (lhs, rhs) => rhs,
    desc: 'Used to seperate statements. Evaluates <lhs> and <rhs>, but only returns <rhs>',
    syntax: '<statement>, <statement>',
    assoc: 'ltr',
  }
};
module.exports = operators;