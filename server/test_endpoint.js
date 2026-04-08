const fetch = require('node-fetch');

async function test() {
  try {
    const res = await fetch("http://localhost:5000/api/products/1");
    const json = await res.json();
    console.log(json);
  } catch (e) {
    console.error(e);
  }
}
test();
