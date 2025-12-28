"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encode = encode;
exports.decode = decode;
const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const BASE = BigInt(ALPHABET.length);
function encode(id) {
    let num = BigInt(id);
    if (num === 0n)
        return ALPHABET[0];
    let str = '';
    while (num > 0n) {
        str = ALPHABET[Number(num % BASE)] + str;
        num = num / BASE;
    }
    return str;
}
function decode(str) {
    let num = 0n;
    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        const index = ALPHABET.indexOf(char);
        if (index === -1) {
            throw new Error(`Invalid Base62 character: ${char}`);
        }
        num = num * BASE + BigInt(index);
    }
    return num;
}
