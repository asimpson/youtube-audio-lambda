'use strict';
const aws = require('aws-sdk');
const ytdl = require('ytdl-core')
const qs = require('querystring');

const youtubeAudio = (event, context, callback) => {
  const query = qs.parse(event.url);
  const id = query[`${Object.keys(query)[0]}`];
  const s3 = new aws.S3({params: {Bucket: 'youtube-podcasts', Key: `${id}.mp4`, ACL: "public-read"}});

  const stream = ytdl(event.url, { filter: (f) => /audio/.test(f.type) && f.container === 'mp4' });
  s3.upload({Body: stream}, (err, data) => {
    if (err) {
      callback(err);
    } else {
      const url = JSON.stringify({url: `https://s3.amazonaws.com/youtube-podcasts/${id}.mp4`});
      callback(null, url);
    }
  })
  .on('httpUploadProgress', (evt) => {
    console.log(evt);
  });
}

exports.handler = youtubeAudio;
