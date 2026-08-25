// Run with: node api/contact.test.js   (no dependencies, no test runner)
const handler = require('./contact.js');

function mockRes() {
  const r = { statusCode: null, payload: null, headers: {} };
  r.setHeader = (k, v) => { r.headers[k] = v; };
  r.status = (c) => { r.statusCode = c; return r; };
  r.json = (o) => { r.payload = o; return r; };
  return r;
}
const run = async (req) => { const res = mockRes(); await handler(req, res); return res; };
const form = (o) => new URLSearchParams(o).toString();
let pass = 0, fail = 0;
const check = (name, cond, extra) => {
  (cond ? pass++ : fail++);
  console.log(`${cond ? 'PASS' : 'FAIL'} :: ${name}${extra ? ' :: ' + extra : ''}`);
};

(async () => {
  // method guard
  let r = await run({ method: 'GET' });
  check('GET is rejected', r.statusCode === 405 && r.headers.Allow === 'POST');

  // validation
  r = await run({ method: 'POST', body: form({ name: '', email: '', message: '' }) });
  check('empty submission rejected', r.statusCode === 400 && r.payload.error === 'invalid');
  check('names all three missing fields',
        JSON.stringify(r.payload.fields) === JSON.stringify(['name','email','message']),
        JSON.stringify(r.payload.fields));

  r = await run({ method: 'POST', body: form({ name: 'Sai', email: 'nope', message: 'hi' }) });
  check('bad email rejected', r.statusCode === 400 && r.payload.fields.includes('email'));

  r = await run({ method: 'POST', body: form({ name: 'Sai', email: 'a@b.co', message: 'x'.repeat(6000) }) });
  check('oversized message rejected', r.statusCode === 400 && r.payload.error === 'too_long');

  // honeypot: accepted, but never delivered
  let fetched = false;
  global.fetch = async () => { fetched = true; return { ok: true, text: async () => '' }; };
  r = await run({ method: 'POST', body: form({ name: 'Bot', email: 'b@b.co', message: 'spam', 'bot-field': 'gotcha' }) });
  check('honeypot returns success', r.statusCode === 200 && r.payload.ok === true);
  check('honeypot never sends mail', fetched === false);

  // valid, but not configured yet
  delete process.env.RESEND_API_KEY; delete process.env.CONTACT_TO;
  r = await run({ method: 'POST', body: form({ name: 'Sai', email: 'a@b.co', message: 'hello' }) });
  check('unconfigured says so (503)', r.statusCode === 503 && r.payload.error === 'not_configured');

  // configured and delivering
  process.env.RESEND_API_KEY = 'test-key';
  process.env.CONTACT_TO = 'sai@example.com';
  let sent = null;
  global.fetch = async (url, opts) => { sent = { url, opts }; return { ok: true, text: async () => '' }; };
  r = await run({ method: 'POST', body: form({
    name: 'Sai', email: 'sai@school.edu', organization: 'Rock Hill',
    message: 'Hello there', audience: 'Retailer / organization' }) });
  check('valid submission accepted', r.statusCode === 200 && r.payload.ok === true);
  check('calls Resend', sent && sent.url === 'https://api.resend.com/emails');
  check('sends the API key', sent.opts.headers.Authorization === 'Bearer test-key');
  const b = JSON.parse(sent.opts.body);
  check('delivers to CONTACT_TO', b.to[0] === 'sai@example.com');
  check('reply-to is the sender', b.reply_to === 'sai@school.edu');
  check('body carries the message', b.text.includes('Hello there'));
  check('body carries organization', b.text.includes('Rock Hill'));
  check('body carries audience', b.text.includes('Retailer / organization'));

  // provider failure surfaces as 502, not a false success
  global.fetch = async () => ({ ok: false, status: 401, text: async () => 'bad key' });
  r = await run({ method: 'POST', body: form({ name: 'Sai', email: 'a@b.co', message: 'hi' }) });
  check('provider error is not a false success', r.statusCode === 502 && r.payload.error === 'delivery_failed');

  global.fetch = async () => { throw new Error('network down'); };
  r = await run({ method: 'POST', body: form({ name: 'Sai', email: 'a@b.co', message: 'hi' }) });
  check('network failure handled', r.statusCode === 502);

  // object body (how Vercel normally hands it over)
  global.fetch = async () => ({ ok: true, text: async () => '' });
  r = await run({ method: 'POST', body: { name: 'Sai', email: 'a@b.co', message: 'hi' } });
  check('accepts a pre-parsed object body', r.statusCode === 200);

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
