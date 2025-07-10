const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const youtubedl = require('youtube-dl-exec');
const readline = require('readline');

// Usage: node index.js <youtube_url> <start_time> <end_time>
// Example: node index.js https://www.youtube.com/watch?v=xxxx 00:01:00 00:02:00

const [,, youtubeUrl, startTime, endTime] = process.argv;

const outputFile = 'trimmed_video.mp4';
const tempFile = 'downloaded_video.mp4';

// Parse optional --cookies <path> argument
let cookiesPath = null;
const cookiesIndex = process.argv.indexOf('--cookies');
if (cookiesIndex !== -1 && process.argv[cookiesIndex + 1]) {
  cookiesPath = process.argv[cookiesIndex + 1];
}

async function promptAuth() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question('Email: ', (email) => {
      rl.question('Password: ', (password) => {
        rl.close();
        resolve({ email, password });
      });
    });
  });
}

async function main() {
  // Prompt for email/password
  const { email, password } = await promptAuth();
  // Simple hardcoded check (replace with env or config for production)
  if (email !== 'admin@example.com' || password !== 'secret') {
    console.error('Authentication failed.');
    process.exit(1);
  }

  if (!youtubeUrl || !startTime || !endTime) {
    console.error('Usage: node index.js <youtube_url> <start_time> <end_time>');
    process.exit(1);
  }

  console.log('Downloading video with yt-dlp...');
  try {
    const ytdlpOptions = {
      output: tempFile,
      format: 'mp4',
    };
    if (cookiesPath) {
      ytdlpOptions.cookies = cookiesPath;
    }
    await youtubedl(youtubeUrl, ytdlpOptions);
  } catch (err) {
    console.error('Failed to download video with yt-dlp:', err.stderr || err.message);
    process.exit(1);
  }

  console.log(`Trimming video from ${startTime} to ${endTime}...`);
  ffmpeg(tempFile)
    .setStartTime(startTime)
    .setDuration(timeToSeconds(endTime) - timeToSeconds(startTime))
    .output(outputFile)
    .on('end', () => {
      console.log(`Trimmed video saved as ${outputFile}`);
      fs.unlinkSync(tempFile); // Clean up temp file
    })
    .on('error', (err) => {
      console.error('Error:', err.message);
    })
    .run();
}

main();

function timeToSeconds(time) {
  const parts = time.split(':').map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else {
    return Number(time);
  }
}
