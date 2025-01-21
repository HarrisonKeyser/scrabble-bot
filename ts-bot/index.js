"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("@atproto/api");
const dotenv = __importStar(require("dotenv"));
const sqlite3 = __importStar(require("sqlite3"));
const sqlite_1 = require("sqlite");
dotenv.config();
const agent = new api_1.BskyAgent({
    service: 'https://bsky.social',
});
async function main() {
    await agent.login({
        identifier: process.env.BLUESKY_USERNAME,
        password: process.env.BLUESKY_PASSWORD,
    });
    const db = await (0, sqlite_1.open)({
        filename: './scrabble_words.db',
        driver: sqlite3.Database,
    });
    try {
        const wordRow = await db.get('SELECT word FROM words WHERE posted = 0 ORDER BY RANDOM() LIMIT 1');
        if (!wordRow) {
            console.log('All words have been posted!');
            return;
        }
        const word = wordRow.word;
        const postText = `${word} is a legal word in Scrabble.`;
        await agent.post({ text: postText });
        console.log(`Posted: "${postText}"`);
        await db.run('UPDATE words SET posted = 1 WHERE word = ?', word);
    }
    catch (error) {
        console.error('Error:', error);
    }
    finally {
        await db.close();
    }
}
main();
