-- 0002_seed_guangming01.sql
-- 对齐 09_全厂视频监控PoE网络布线与交换机端口线号施工规范.md 的 10 路机位字典

INSERT OR IGNORE INTO cameras (
  cam_id, site_id, name, zone, visibility, ip_address, rtsp_channel,
  stream_mode, audio_enabled, online_status, created_at, updated_at
) VALUES
  ('CAM-GATE-IN-01',   'guangming-01', '正门内',         'gate',  'internal_ops', '192.168.1.101', 102, 'snapshot', 0, 'unknown', '2026-11-16T08:09:00.000Z', '2026-11-16T08:09:00.000Z'),
  ('CAM-GATE-OUT-01',  'guangming-01', '正门外',         'gate',  'internal_ops', '192.168.1.102', 102, 'snapshot', 0, 'unknown', '2026-11-16T08:09:00.000Z', '2026-11-16T08:09:00.000Z'),
  ('CAM-BACK-IN-01',   'guangming-01', '后门内',         'gate',  'internal_ops', '192.168.1.103', 102, 'snapshot', 0, 'unknown', '2026-11-16T08:09:00.000Z', '2026-11-16T08:09:00.000Z'),
  ('CAM-FISH-PAN-01',  'guangming-01', '鱼池全景（向北）', 'fish',  'public_trace', '192.168.1.104', 102, 'snapshot', 0, 'unknown', '2026-11-16T08:09:00.000Z', '2026-11-16T08:09:00.000Z'),
  ('CAM-FISH-P5-01',   'guangming-01', '5号3米池近景',    'fish',  'public_trace', '192.168.1.105', 102, 'snapshot', 0, 'unknown', '2026-11-16T08:09:00.000Z', '2026-11-16T08:09:00.000Z'),
  ('CAM-HYDRO-PAN-01', 'guangming-01', '蔬菜全景（向西）', 'hydro', 'public_trace', '192.168.1.106', 102, 'snapshot', 0, 'unknown', '2026-11-16T08:09:00.000Z', '2026-11-16T08:09:00.000Z'),
  ('CAM-EQUIP-IN-01',  'guangming-01', '设备进出门内',    'equip', 'internal_ops', '192.168.1.107', 102, 'snapshot', 0, 'unknown', '2026-11-16T08:09:00.000Z', '2026-11-16T08:09:00.000Z'),
  ('CAM-LAB-01',       'guangming-01', '检验室',         'lab',   'internal_ops', '192.168.1.108', 102, 'disabled', 0, 'unknown', '2026-11-16T08:09:00.000Z', '2026-11-16T08:09:00.000Z'),
  ('CAM-PACK-VEG-01',  'guangming-01', '蔬菜包装区',      'pack',  'internal_ops', '192.168.1.111', 102, 'disabled', 0, 'unknown', '2026-11-16T08:09:00.000Z', '2026-11-16T08:09:00.000Z'),
  ('CAM-PACK-FISH-01', 'guangming-01', '鱼包装区',        'pack',  'internal_ops', '192.168.1.112', 102, 'disabled', 0, 'unknown', '2026-11-16T08:09:00.000Z', '2026-11-16T08:09:00.000Z');
