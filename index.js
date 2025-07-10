const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');

// Usage: node index.js <input_file> <start_time> <end_time>
// Example: node index.js input.mp4 00:01:00 00:02:00

const [,, inputFile, startTime, endTime] = process.argv;
const outputFile = 'trimmed_video.mp4';

if (!inputFile || !startTime || !endTime) {
  console.error('Usage: node index.js <input_file> <start_time> <end_time>');
  process.exit(1);
}

console.log(`Trimming video from ${startTime} to ${endTime}...`);
ffmpeg(inputFile)
  .setStartTime(startTime)
  .setDuration(timeToSeconds(endTime) - timeToSeconds(startTime))
  .output(outputFile)
  .on('end', () => {
    console.log(`Trimmed video saved as ${outputFile}`);
  })
  .on('error', (err) => {
    console.error('Error:', err.message);
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
