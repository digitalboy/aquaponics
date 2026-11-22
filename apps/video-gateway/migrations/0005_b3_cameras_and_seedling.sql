-- 同步 B3 大棚机位命名防混淆前缀（为未来 B2 大棚留出独立命名空间）并新增育苗区机位 CAM-SEEDLING-01

UPDATE cameras
SET name = 'B3 · 正门内', ip_address = '192.168.0.214', stream_mode = 'on-demand', updated_at = '2026-11-22T10:25:00.000Z'
WHERE cam_id = 'CAM-GATE-IN-01';

UPDATE cameras
SET name = 'B3 · 正门厅', ip_address = '192.168.0.217', stream_mode = 'on-demand', updated_at = '2026-11-22T10:25:00.000Z'
WHERE cam_id = 'CAM-GATE-OUT-01';

UPDATE cameras
SET name = 'B3 · 后门内', ip_address = '192.168.0.205', stream_mode = 'on-demand', visibility = 'internal_ops', audio_enabled = 0, updated_at = '2026-11-22T10:25:00.000Z'
WHERE cam_id = 'CAM-BACK-IN-01';

UPDATE cameras
SET name = 'B3 · 鱼池全景（向北）', ip_address = '192.168.0.215', stream_mode = 'on-demand', visibility = 'public_trace', audio_enabled = 0, updated_at = '2026-11-22T10:25:00.000Z'
WHERE cam_id = 'CAM-FISH-PAN-01';

UPDATE cameras
SET name = 'B3 · 5号3米池近景', updated_at = '2026-11-22T10:25:00.000Z'
WHERE cam_id = 'CAM-FISH-P5-01';

UPDATE cameras
SET name = 'B3 · 蔬菜全景（向西）', updated_at = '2026-11-22T10:25:00.000Z'
WHERE cam_id = 'CAM-HYDRO-PAN-01';

UPDATE cameras
SET name = 'B3 · 设备进出门内', updated_at = '2026-11-22T10:25:00.000Z'
WHERE cam_id = 'CAM-EQUIP-IN-01';

INSERT INTO cameras (
  cam_id, site_id, name, zone, visibility, ip_address, rtsp_channel,
  stream_mode, audio_enabled, online_status, created_at, updated_at
) VALUES (
  'CAM-SEEDLING-01', 'guangming-01', 'B3 · 育苗区', 'hydro', 'public_trace', '192.168.0.216', 102,
  'on-demand', 0, 'unknown', '2026-11-22T10:18:00.000Z', '2026-11-22T10:25:00.000Z'
)
ON CONFLICT(cam_id) DO UPDATE SET
  name = excluded.name,
  zone = excluded.zone,
  visibility = excluded.visibility,
  ip_address = excluded.ip_address,
  stream_mode = excluded.stream_mode,
  audio_enabled = 0,
  updated_at = excluded.updated_at;
