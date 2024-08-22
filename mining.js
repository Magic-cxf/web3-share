
//模拟node环境下的挖矿程序
const crypto = require('crypto');

// 随机数上限 32位无符号整数
const MAX_NONCE = 2 ** 32; 

//版本号
const version = 0x20600000

// 上一个区块的hash值 模拟的 从官方获取
const prevHash = "0000000000000000000029f633f47c47adc3d14da40131f190ffe837f2b48099"; 

//模拟的默克尔树根
const merkleRoot = "67e163408917554beb1aae505c62b59b70e5ba9c8201a3596ee437b1a13f58ea"

// 当前时间戳
const timestamp = getCurrentUnixTimestamp(); 

// 难度值 经过压缩处理
const bits = 0x17033d76; 

// 目标哈希阈值
const target = restoreTargetThreshold(bits); 


/**
 * 获取当前的 UTC 时间戳（UNIX 时间戳）
 * @returns {number} UTC 格式的时间戳（秒）
 */
function getCurrentUnixTimestamp() {
    // 获取当前时间的毫秒级时间戳
    const now = Date.now();
    
    // 转换为秒级时间戳
    const unixTimestamp = Math.floor(now / 1000);

    return unixTimestamp;
}

//还原难度阈值
function restoreTargetThreshold(bits) {
    //向右移位 24 位 取前8位 作为 指数
    const exponent = bits >>> 24; // 最高字节
    const coefficient = bits & 0xFFFFFF; // 最低三字节
    
    // 计算目标值
    return BigInt(coefficient * Math.pow(2, 8 * (exponent - 3)));
};


//将16进制字符串转换为小端格式
function reverseLittleEndian(hex) {
    let result = '';
    for (let i = 0; i < hex.length; i += 2) {
        result = hex.slice(i, i + 2) + result;
    }
    return result;
};

//挖矿程序
function mine() {
    //将参数转换为16进制字符串
    //计算机架构原因 需要从big-endian转换为little-endian
    const _version = reverseLittleEndian(version.toString(16).padStart(8, '0'));
    const _prevHash = reverseLittleEndian(prevHash.padStart(64, '0'));
    const _merkleRoot = reverseLittleEndian(merkleRoot.padStart(64, '0'));
    const _timestamp = reverseLittleEndian(timestamp.toString(16).padStart(8, '0'));
    const _bits = reverseLittleEndian(bits.toString(16).padStart(8, '0'));

    //前面固定参数拼接
    const data = _version + _prevHash + _merkleRoot + _timestamp + _bits;
    console.time('挖矿开始');
    for (let i = 0 ; i < MAX_NONCE ; i++) {
        const nonce = reverseLittleEndian(i.toString(16).padStart(8, '0'));
        //拼接字符串 进行两次哈希计算
        // 将十六进制字符串转换为二进制数据
        const buffer = Buffer.from(data + nonce, 'hex');

        // 进行第一次 SHA-256 哈希计算
        const firstHash = crypto.createHash('sha256').update(buffer).digest();

        // 进行第二次 SHA-256 哈希计算
        const secondHash = crypto.createHash('sha256').update(firstHash).digest();

        // 将最终的哈希结果转换为 big-endian格式
        const result = secondHash.reverse().toString('hex');

        if (result.startsWith('00000')) {
            console.log(`第${i}次计算结果: ${result}`);
        }
        const bigIntResult = BigInt('0x' + result);

        if (bigIntResult < target) {
            console.log(`找到符合条件的nonce值: ${i}`);
            console.log(`找到符合条件的hash值: ${result}`);
            break;
        }
    }
    console.timeEnd('挖矿开始');
}

mine()