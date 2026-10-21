/**
 * Client-side arithmetic from the visitor's own inputs.
 * No default savings figure. Nothing is sent to a server.
 */
(function () {
  var form = document.getElementById('calc-form');
  var out = document.getElementById('calc-result');
  if (!form || !out) return;

  function read(id) {
    var el = document.getElementById(id);
    var raw = el && el.value ? el.value.trim() : '';
    if (raw === '') return null;
    var n = Number(raw);
    return Number.isFinite(n) ? n : NaN;
  }

  function money(n) {
    return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
  }

  function line(label, expr, value) {
    return label + ' = ' + expr + ' = ' + money(value);
  }

  function run(event) {
    if (event) event.preventDefault();
    var spendIn = read('calc-spend');
    var tokens = read('calc-tokens');
    var price = read('calc-price');
    var cachePct = read('calc-cache-pct');
    var cacheMult = read('calc-cache-mult');
    var batchPct = read('calc-batch-pct');
    var batchOff = read('calc-batch-off');
    var localPct = read('calc-local-pct');
    var localMult = read('calc-local-mult');

    var fields = [spendIn, tokens, price, cachePct, cacheMult, batchPct, batchOff, localPct, localMult];
    if (fields.some(function (n) { return Number.isNaN(n); })) {
      out.textContent = 'Use numbers only.';
      return;
    }

    var spend = spendIn;
    var spendHow = 'monthly spend you entered';
    if (spend === null) {
      if (tokens === null || price === null) {
        out.textContent = 'Enter a monthly spend, or both a token volume and your price per million tokens.';
        return;
      }
      spend = tokens * price;
      spendHow = String(tokens) + ' million tokens × ' + money(price) + ' per million';
    }

    var assumptions = [cachePct, cacheMult, batchPct, batchOff, localPct, localMult];
    if (assumptions.some(function (n) { return n === null; })) {
      out.textContent = 'Enter every assumption, including 0 where you mean none. Blank is not treated as zero.';
      return;
    }

    if (spend < 0 || cacheMult < 0 || localMult < 0) {
      out.textContent = 'Spend and price multiples cannot be negative.';
      return;
    }
    var pcts = [cachePct, batchPct, localPct, batchOff];
    if (pcts.some(function (n) { return n < 0 || n > 100; })) {
      out.textContent = 'Percent fields must be from 0 to 100.';
      return;
    }
    if (cachePct + batchPct + localPct > 100) {
      out.textContent = 'Caching, batch, and local shares overlap. Those three percents have to add up to 100 or less. The remainder stays at today’s interactive cloud price.';
      return;
    }

    var c = cachePct / 100;
    var b = batchPct / 100;
    var h = localPct / 100;
    var d = batchOff / 100;
    var interactive = spend * (1 - c - b - h);
    var cached = spend * c * cacheMult;
    var batched = spend * b * (1 - d);
    var local = spend * h * localMult;
    var estimate = interactive + cached + batched + local;
    var difference = spend - estimate;

    out.textContent = [
      'This is arithmetic on your inputs. It is not a Boole measurement and not a promise.',
      'S = ' + money(spend) + ' (' + spendHow + ')',
      line('Interactive cloud', money(spend) + ' × (1 − ' + c + ' − ' + b + ' − ' + h + ')', interactive),
      line('Cached slice', money(spend) + ' × ' + c + ' × ' + cacheMult, cached),
      line('Batch slice', money(spend) + ' × ' + b + ' × (1 − ' + d + ')', batched),
      line('Local slice', money(spend) + ' × ' + h + ' × ' + localMult, local),
      'Estimate = interactive + cached + batch + local = ' + money(estimate),
      'Difference from today’s spend = ' + money(difference),
      'A positive difference means your assumptions cost less than today’s spend. Local hardware has a fixed cost this formula does not include. The audit calculates that break-even from your volumes.',
    ].join('\n');
  }

  form.addEventListener('submit', run);
})();
