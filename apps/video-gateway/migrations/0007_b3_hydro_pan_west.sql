-- 接入 B3 新增第 6 路摄像头：CAM-HYDRO-PAN-01（B3 · 蔬菜全景（向西），192.168.0.218）

UPDATE cameras
SET
  name = 'B3 · 蔬菜全景（向西）',
  zone = 'hydro',
  visibility = 'public_trace',
  ip_address = '192.168.0.218',
  rtsp_channel = 102,
  stream_mode = 'on-demand',
  audio_enabled = 0,
  updated_at = '2026-11-25T07:47:00.000Z'
WHERE cam_id = 'CAM-HYDRO-PAN-01';
