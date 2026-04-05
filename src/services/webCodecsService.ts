export const encodeVideoWebCodecs = async (
  frames: string[], 
  width: number, 
  height: number,
  fps: number = 30,
  codecType: 'H.264' | 'VP9' = 'H.264'
): Promise<Blob> => {
  if (!window.VideoEncoder) {
    throw new Error('WebCodecs not supported in this browser');
  }

  const chunks: ArrayBuffer[] = [];
  const encoder = new VideoEncoder({
    output: (chunk) => {
      const data = new ArrayBuffer(chunk.byteLength);
      chunk.copyTo(data);
      chunks.push(data);
    },
    error: (e) => console.error('WebCodecs Encoder Error:', e),
  });

  const config: VideoEncoderConfig = {
    codec: codecType === 'H.264' ? 'avc1.42E01E' : 'vp09.00.10.08', // H.264 or VP9
    width,
    height,
    bitrate: 2_000_000, // 2 Mbps
    framerate: fps,
  };

  encoder.configure(config);

  for (let i = 0; i < frames.length; i++) {
    const img = new Image();
    img.src = frames[i];
    await new Promise((resolve) => (img.onload = resolve));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0, width, height);

    const frame = new VideoFrame(canvas, { timestamp: (i * 1_000_000) / fps });
    encoder.encode(frame, { keyFrame: i % 30 === 0 });
    frame.close();
  }

  await encoder.flush();
  encoder.close();

  // Note: WebCodecs gives raw bitstream. For a playable MP4, we usually need a muxer.
  // Since we don't have a muxer library installed yet, we'll return the raw data
  // or use this as a "Neural Stream" demonstration.
  return new Blob(chunks, { type: 'video/mp4' });
};
