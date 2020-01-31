const ffmpeg = require("fluent-ffmpeg");
const { spawn } = require("child_process");

const resizeVideo = (url, title, fileName, option, streamMap) => {
  const env = Object.create(process.env);

  env.option = option;
  env.streamMap = streamMap;

  const ffmpegCommand = spawn(
    `./transcode.sh`,
    [`${url}`, `${title}`, `${fileName}`],
    { env }
  );

  ffmpegCommand.stdout.on("data", data => {
    console.log(`============= ffmpegCommand stdout: ${data}`);
  });

  ffmpegCommand.stderr.on("data", data => {
    console.error(`============= ffmpegCommand stderr: ${data}`);
  });

  ffmpegCommand.on("close", code => {
    console.log(`============= process exited with code: ${code}`);
  });
};

const run = () => {
  const argvs = process.argv;

  const url = argvs[2];
  const title = argvs[3];
  const fileName = argvs[4];

  ffmpeg.ffprobe(url, (err, metaData) => {
    if (err) {
      console.log("============= ffprobe err", err);
      return;
    }

    let videoHeight = 0,
      option = "",
      streamMap = "";

    for (let i = 0; i < metaData.streams.length; i++) {
      const stream = metaData.streams[i];
      if (stream.height && stream.width) {
        videoHeight = parseInt(stream.height);
      }
    }

    if (videoHeight > 720) {
      option = `
        -map 0:0 -map 0:1 -map 0:0 -map 0:1 \
        -c:v:0 libx264 -filter:v:0 scale=720:-2 \
        -c:v:1 libx264 -filter:v:1 scale=480:-2 \
        -c:a copy \
      `;
      streamMap = "v:0,a:0 v:1,a:1";
    } else if (videoHeight === 720) {
      option = `
        -map 0:0 -map 0:1 -map 0:0 -map 0:1 \
        -c:v:0 copy \
        -c:v:1 libx264 -filter:v:1 scale=480:-2 \
        -c:a copy \
      `;
      streamMap = "v:0,a:0 v:1,a:1";
    } else if (videoHeight < 720 && videoHeight > 480) {
      option = `
        -map 0:0 -map 0:1 \
        -c:v:0 libx264 -filter:v:0 scale=480:-2 \
        -c:a copy \
      `;
      streamMap = "v:0,a:0";
    } else if (videoHeight <= 480) {
      option = `
        -map 0:0 -map 0:1 \
        -c:v:0 copy \
        -c:a copy \
      `;
      streamMap = "v:0,a:0";
    }

    resizeVideo(url, title, fileName, option, streamMap);
  });
};

run();
