const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');

// Usage: node index.js <youtube_url> <start_time> <end_time>
// Example: node index.js https://www.youtube.com/watch?v=xxxx 00:01:00 00:02:00

const [,, youtubeUrl, startTime, endTime] = process.argv;

if (!youtubeUrl || !startTime || !endTime) {
  console.error('Usage: node index.js <youtube_url> <start_time> <end_time>');
  process.exit(1);
}

const outputFile = 'trimmed_video.mp4';

console.log('Downloading video...');
let videoStream;
try {
  videoStream = ytdl(youtubeUrl, { quality: 'highest', filter: 'audioandvideo' });
} catch (err) {
  console.error('Failed to get video stream. The video may be protected, private, or unavailable.');
  process.exit(1);
}

console.log(`Trimming video from ${startTime} to ${endTime}...`);
ffmpeg(videoStream)
  .setStartTime(startTime)
  .setDuration(timeToSeconds(endTime) - timeToSeconds(startTime))
  .output(outputFile)
  .on('end', () => {
    console.log(`Trimmed video saved as ${outputFile}`);
  })
  .on('error', (err) => {
    console.error('Error:', err.message);
    if (err.message.includes('410')) {
      console.error('YouTube may have blocked this download method. Try updating ytdl-core or check if the video is age-restricted, private, or protected.');
    }
  })
  .run();

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
