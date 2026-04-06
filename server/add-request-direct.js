const db = require('./utils/db');
const crypto = require('crypto');
const token = crypto.randomBytes(24).toString('hex');
const r = db.addApprovalRequest({ email:'trakinmining2006@gmail.com', data:{requester:{name:'RS Tester', email:'rs1572334@gmail.com'}, message:'Direct add test'}, token: token, status:'pending' });
console.log(JSON.stringify(r, null, 2));
