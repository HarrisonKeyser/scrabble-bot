import { BskyAgent } from '@atproto/api';
import * as dotenv from 'dotenv';
import * as sqlite3 from 'sqlite3';
import { open } from 'sqlite';

dotenv.config();

const agent = new BskyAgent({
  service: 'https://bsky.social',
});

async function main() {
  await agent.login({
    identifier: process.env.BLUESKY_USERNAME!,
    password: process.env.BLUESKY_PASSWORD!,
  });

  const db = await open({
    filename: './NWL2023.db',
    driver: sqlite3.Database,
  });

  try {
    const wordRow = await db.get(
      'SELECT word FROM words WHERE posted = 0 ORDER BY RANDOM() LIMIT 1'
    );

    if (!wordRow) {
      console.log('All words have been posted!');
      return;
    }

    const word = wordRow.word;
    const postText = `${word} is a legal word in Scrabble.`;

    await agent.post({ text: postText });
    console.log(`Posted: "${postText}"`);

    await db.run('UPDATE words SET posted = 1 WHERE word = ?', word);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.close();
  }
}

main();