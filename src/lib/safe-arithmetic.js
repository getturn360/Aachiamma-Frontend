/**
 * Evaluate a numeric arithmetic expression without eval/Function.
 * Supports +, -, *, /, %, parentheses, and unary +/-.
 */
export function evaluateSafeArithmetic(expr) {
  const s = String(expr).replace(/\s/g, "");
  if (!s) throw new Error("empty expression");

  let pos = 0;

  function parseExpression() {
    let left = parseTerm();
    while (pos < s.length && (s[pos] === "+" || s[pos] === "-")) {
      const op = s[pos++];
      const right = parseTerm();
      left = op === "+" ? left + right : left - right;
    }
    return left;
  }

  function parseTerm() {
    let left = parseFactor();
    while (pos < s.length && (s[pos] === "*" || s[pos] === "/" || s[pos] === "%")) {
      const op = s[pos++];
      const right = parseFactor();
      if (op === "*") left = left * right;
      else if (op === "/") left = left / right;
      else left = left % right;
    }
    return left;
  }

  function parseFactor() {
    if (s[pos] === "(") {
      pos++;
      const val = parseExpression();
      if (s[pos] !== ")") throw new Error("expected )");
      pos++;
      return val;
    }
    if (s[pos] === "-") {
      pos++;
      return -parseFactor();
    }
    if (s[pos] === "+") {
      pos++;
      return parseFactor();
    }

    const start = pos;
    if (s[pos] === ".") pos++;
    while (pos < s.length && /[0-9.]/.test(s[pos])) pos++;
    if (start === pos) throw new Error("expected number");

    const num = parseFloat(s.slice(start, pos));
    if (Number.isNaN(num)) throw new Error("invalid number");
    return num;
  }

  const result = parseExpression();
  if (pos !== s.length) throw new Error("unexpected trailing input");
  return result;
}
