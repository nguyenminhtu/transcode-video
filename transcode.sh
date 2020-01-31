#!/bin/sh
path=${1}
title=${2}
filename=${3}

rm -rf tmp/$title/*
mkdir -p tmp/$title/$filename/output/manifest
mkdir -p tmp/$title/$filename/output/video

wget -c -O tmp/$title/$filename/video "$path"

ffmpeg -i tmp/$title/$filename/video \
  ${option} \
  -var_stream_map "${streamMap}" \
  -master_pl_name master.m3u8 \
  -f hls -hls_time 6 -hls_list_size 0 \
  -hls_base_url "../video/" \
  -hls_segment_filename "tmp/$title/$filename/output/video/v%v_file%d.ts" \
  tmp/$title/$filename/output/manifest/v%v.m3u8

rm -rf tmp/$title/$filename/video