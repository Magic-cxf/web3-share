//计算接下来要发布的区块的目标哈希值
const BigInt = require('big-integer');

// 最大哈希值
const MAX_HASH_VALUE = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');

// 当前难度
const difficulty = BigInt('86871474313761');

// 计算目标哈希值
const targetHashValue = MAX_HASH_VALUE.divide(difficulty);

console.log('目标哈希值（16进制）：', targetHashValue.toString(16));
