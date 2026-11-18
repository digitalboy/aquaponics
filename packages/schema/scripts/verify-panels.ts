import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { PanelAssemblySchema } from '../src/electrical/cabinet.ts';

const here = dirname(fileURLToPath(import.meta.url));
const fixtureDir = resolve(here, '../fixtures/panels');

const files = ['ap-ctrl.json', 'ap-edge-01.json', 'ap-edge-03.json'];

for (const f of files) {
  const raw = JSON.parse(readFileSync(resolve(fixtureDir, f), 'utf-8'));
  const parsed = PanelAssemblySchema.parse(raw);
  console.log(`[PASS] ${f} -> ${parsed.panel_id} (${parsed.name}) | rails=${parsed.din_rails.length}`);
}

// 负向红线校验测试
const apCtrl = JSON.parse(readFileSync(resolve(fixtureDir, 'ap-ctrl.json'), 'utf-8'));
const invalidVlan = structuredClone(apCtrl);
invalidVlan.poe_switches[0].dip_switch_mode = 'vlan_isolated';
const r1 = PanelAssemblySchema.safeParse(invalidVlan);
if (r1.success) throw new Error('Expected vlan_isolated check to fail');
console.log(`[PASS] Negative test (vlan_isolated blocked): ${r1.error.issues[0].message}`);

const apEdge01 = JSON.parse(readFileSync(resolve(fixtureDir, 'ap-edge-01.json'), 'utf-8'));
const invalidPoE = structuredClone(apEdge01);
invalidPoE.poe_splitters[0].downlink_load_w = 28;
const r2 = PanelAssemblySchema.safeParse(invalidPoE);
if (r2.success) throw new Error('Expected PoE splitter overload check to fail');
console.log(`[PASS] Negative test (PoE overload blocked): ${r2.error.issues[0].message}`);

const invalidRail = structuredClone(apEdge01);
invalidRail.din_rails[0].usable_width_mm = 50;
const r3 = PanelAssemblySchema.safeParse(invalidRail);
if (r3.success) throw new Error('Expected DIN rail overflow check to fail');
console.log(`[PASS] Negative test (DIN rail overflow blocked): ${r3.error.issues[0].message}`);

// Zod v4 原生 JSON Schema 导出测试
const jsonSchema = z.toJSONSchema(PanelAssemblySchema);
console.log(`[PASS] z.toJSONSchema generated (keys: ${Object.keys(jsonSchema).length})`);
