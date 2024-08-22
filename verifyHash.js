//验证区块哈希值
const crypto = require('crypto');
//版本 16进制
const version = 0x20600000

//上一个区块的hash值
const prevHash = '00000000000000000002e74c95a8edb50992292c76947d57b6744da5a3bbfd5d'

//当前区块的默克尔根
const merkleRoot = 'cac893998de41f9e71803b69c8207e70c45662e31922d5244195376d9c181b28'

//爆块时间 时间戳 需要转为utc时间
const timestamp = '2024-08-22 10:38:40'
const localData = new Date(timestamp)
const utcTimestamp = Math.floor(localData.getTime() / 1000);

//随机数16进制
const nonce = 0x1f4e193e;

//难度目标 进过压缩处理的目标阈值
const bits = 0x17033d76

//将难度目标转换为目标阈值
const restoreTargetThreshold = (bits) => {
    //向右移位 24 位 取前8位 作为 指数
    const exponent = bits >>> 24; // 最高字节
    const coefficient = bits & 0xFFFFFF; // 最低三字节
    
    // 计算目标值
    return coefficient * Math.pow(2, 8 * (exponent - 3));
};


//将16进制字符串转换为小端格式
const reverseLittleEndian = (hex) => {
    let result = '';
    for (let i = 0; i < hex.length; i += 2) {
        result = hex.slice(i, i + 2) + result;
    }
    return result;
};

//计算区块哈希值
const main = () => {
    //将参数转换为16进制字符串
    //计算机架构原因 需要从big-endian转换为little-endian
    const _version = reverseLittleEndian(version.toString(16).padStart(8, '0'));
    const _prevHash = reverseLittleEndian(prevHash.padStart(64, '0'));
    const _merkleRoot = reverseLittleEndian(merkleRoot.padStart(64, '0'));
    const _timestamp = reverseLittleEndian(utcTimestamp.toString(16).padStart(8, '0'));
    const _bits = reverseLittleEndian(bits.toString(16).padStart(8, '0'));
    const _nonce = reverseLittleEndian(nonce.toString(16).padStart(8, '0'));


    //将参数拼接为16进制字符串 进行哈希计算的字符串
    const data = _version + _prevHash + _merkleRoot + _timestamp + _bits + _nonce;

    // 将十六进制字符串转换为二进制数据
    const buffer = Buffer.from(data, 'hex');

    // 进行第一次 SHA-256 哈希计算
    const firstHash = crypto.createHash('sha256').update(buffer).digest();

    // 进行第二次 SHA-256 哈希计算
    const secondHash = crypto.createHash('sha256').update(firstHash).digest();

    // 将最终的哈希结果转换为 big-endian格式
    const result = secondHash.reverse().toString('hex');
    // 计算目标阈值
    const target = BigInt(restoreTargetThreshold(bits));

    console.log('目标哈希值阈值:',target.toString(16).padStart(64, '0'));
    console.log('计算出的哈希值:',result);

    const bigIntResult = BigInt('0x' + result);

    if (bigIntResult < target) {
        console.log('区块哈希值有效');
    } else {
        console.log('区块哈希值无效');
    }
};

main();