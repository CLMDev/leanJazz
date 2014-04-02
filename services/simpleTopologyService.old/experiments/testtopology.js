var pool = require('./testpool');

var mypool = pool.oPool();

console.log('public: ' + mypool.publicvar);
console.log('private: ' + mypool.privatevar);
