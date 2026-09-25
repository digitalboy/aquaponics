#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
向飞书多维表格《数字化农业工厂·生产流转与资产SSOT》批量写入初始化示范数据：
Base Token: Cy3Ybwe77aUokUsQDdicDmNonPh
"""

import json
import subprocess
import sys

BASE_TOKEN = "Cy3Ybwe77aUokUsQDdicDmNonPh"

TABLES = {
    "seeds": "tbliWTW44wNYYpW4",
    "nursery": "tblj0R75Dug3RGiZ",
    "beds": "tbldWoNunSZPG6Fk",
    "rafts": "tblcJ21TI1ge5thc",
    "production": "tbllOGGf3agxQhaV"
}

def run_batch_create(table_id, records):
    payload = {"create_records": records}
    cmd = [
        "lark-cli", "base", "+record-batch-create",
        "--base-token", BASE_TOKEN,
        "--table-id", table_id,
        "--json", json.dumps(payload, ensure_ascii=False),
        "--as", "user"
    ]
    res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", shell=True)
    if res.returncode != 0:
        print(f"❌ 写入失败 table {table_id}:\n{res.stderr}\n{res.stdout}")
        return False
    print(f"✅ 成功向表 {table_id} 批量写入 {len(records)} 条记录！")
    return True

def main():
    print("=== 开始写入初始化生产与设施数据 ===")

    # 1. 菜池设施空间表
    bed_records = [
        {
            "菜池设施编号": "BED-TP-01",
            "菜池俗称与位置": "1号刀刮布落地水培菜池 (Zone A 北侧01)",
            "设施物理类型": ["刀刮布落地水培菜池 (BED-TP)"],
            "所在微气候分区": ["Zone A 水培大宗区"],
            "物理长宽规格(米)": "48.0m x 1.2m x 0.35m",
            "额定浮板容量(块)": 40,
            "当前推板状态": ["部分在池推板"],
            "责任技术员": "张扬"
        },
        {
            "菜池设施编号": "BED-TP-02",
            "菜池俗称与位置": "2号刀刮布落地水培菜池 (Zone A 北侧02)",
            "设施物理类型": ["刀刮布落地水培菜池 (BED-TP)"],
            "所在微气候分区": ["Zone A 水培大宗区"],
            "物理长宽规格(米)": "48.0m x 1.2m x 0.35m",
            "额定浮板容量(块)": 40,
            "当前推板状态": ["清池消杀休整中"],
            "责任技术员": "张扬"
        },
        {
            "菜池设施编号": "BED-SS-01",
            "菜池俗称与位置": "1号不锈钢离地水培菜池 (Zone B 观摩动线)",
            "设施物理类型": ["不锈钢离地水培菜池 (BED-SS)"],
            "所在微气候分区": ["Zone B 精品展示区"],
            "物理长宽规格(米)": "24.0m x 1.2m (离地0.85m)",
            "额定浮板容量(块)": 20,
            "当前推板状态": ["满负荷生产中"],
            "责任技术员": "张扬"
        },
        {
            "菜池设施编号": "RACK-AF-01",
            "菜池俗称与位置": "1号A字架立体基质栽培架 (Zone D 草莓专线)",
            "设施物理类型": ["A字架立体基质架 (RACK-AF)"],
            "所在微气候分区": ["Zone D 果菜基质区"],
            "物理长宽规格(米)": "18.0m 双侧5层斜面 (高坪效)",
            "额定浮板容量(块)": 0,
            "当前推板状态": ["满负荷生产中"],
            "责任技术员": "张扬"
        }
    ]
    run_batch_create(TABLES["beds"], bed_records)

    # 2. 浮板实物资产台账
    raft_records = []
    for i in range(1, 11):
        raft_records.append({
            "浮板编号": f"RFT-24H-A-{i:04d}",
            "定植孔数规格": ["24孔 (4x6)"],
            "浮板几何尺寸(米)": "1.2m x 0.9m x 0.03m",
            "当前所在菜池": "BED-TP-01" if i <= 5 else "闲置待命",
            "浮板当前状态": ["培育栽培在池"] if i <= 5 else ["二级消杀备用"],
            "累计周转采收茬数": 1,
            "资产登记入库日期": "2026-10-01 09:00",
            "资产维护备注": "高密度食品级HDPE抑藻板，激光蚀刻永久打标"
        })
    run_batch_create(TABLES["rafts"], raft_records)

    # 3. 种子与种苗台账
    seed_records = [
        {
            "种子批次号": "SEED-202610-WAT01",
            "作物名称": ["西洋菜 (豆瓣菜)"],
            "具体品种": "广府大叶西洋菜",
            "供应商与生产商": "广东省农科院蔬菜所实验基地",
            "到货日期": "2026-10-01 10:00",
            "原厂包装批号": "GDAAS-WAT-202609",
            "实测发芽率(%)": 92.0,
            "剩余库存(克或粒)": 500,
            "质量状态": ["合格正常"],
            "农艺备注": "秋凉播种适期，适宜深水落地菜池连续割茬采收"
        },
        {
            "种子批次号": "SEED-202610-BUT01",
            "作物名称": ["奶油生菜"],
            "具体品种": "萨拉诺瓦绿奶油 (Salanova Green Butter)",
            "供应商与生产商": "荷兰瑞克斯旺 (Rijk Zwaan)",
            "到货日期": "2026-10-05 14:00",
            "原厂包装批号": "RZ-NL-99824B",
            "实测发芽率(%)": 96.0,
            "剩余库存(克或粒)": 2500,
            "质量状态": ["合格正常"],
            "农艺备注": "精品生食沙拉当家品种，出厂最低糖度控制在2.8度以上"
        },
        {
            "种子批次号": "SEED-202610-CHO01",
            "作物名称": ["广东菜心"],
            "具体品种": "四九油青菜心 (特选优质系)",
            "供应商与生产商": "广州市农业科学研究院",
            "到货日期": "2026-10-08 09:30",
            "原厂包装批号": "GZ-49-202608",
            "实测发芽率(%)": 95.0,
            "剩余库存(克或粒)": 1000,
            "质量状态": ["合格正常"],
            "农艺备注": "生长周期26天，粗纤维严格控制无筋清脆"
        }
    ]
    run_batch_create(TABLES["seeds"], seed_records)

    # 4. 育苗记录
    nursery_records = [
        {
            "育苗批次号": "NUR-261015-01",
            "关联种子批次": "SEED-202610-WAT01",
            "播种日期": "2026-10-15 08:30",
            "育苗海绵穴盘规格": ["96孔方块海绵盘"],
            "播种盘数(张)": 5,
            "理论出苗数(株)": 440,
            "暗室出苗日期": "2026-10-17 08:30",
            "当前育苗状态": ["待分苗定植"],
            "育苗责任技术员": "张扬",
            "作业备注": "催芽室温度22℃，湿度95%，发芽整齐健壮"
        }
    ]
    run_batch_create(TABLES["nursery"], nursery_records)

    # 5. 定植生产生命周期示范
    prod_records = [
        {
            "生产工单批次号": "LOT-261101-WAT-TP01",
            "作物名称": ["西洋菜 (豆瓣菜)"],
            "种植菜池编号": "BED-TP-01",
            "来源育苗批次": "NUR-261015-01",
            "投入浮板编号列表": "RFT-24H-A-0001 ~ RFT-24H-A-0005",
            "定植总板数(块)": 5,
            "定植总株数(株)": 120,
            "定植入池日期": "2026-11-01 09:00",
            "预计采收日期": "2026-11-29 09:00",
            "异常孔位死苗记录": "无死苗，长势旺盛",
            "生产批次状态": ["定植生长中"],
            "质检与品控备注": "水温18.5℃，EC 1.6 mS/cm，无病虫害"
        }
    ]
    run_batch_create(TABLES["production"], prod_records)

    print("\n🎉 初始示范数据写入完成！您可以直接在飞书查看完整多维表格！")

if __name__ == "__main__":
    main()
