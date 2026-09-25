#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
自动化调用 lark-cli 创建飞书多维表格《数字化农业工厂·生产流转与资产SSOT》
包含 5 张核心数据表：
1. 种子与种苗台账 (初始首表)
2. 育苗与播种记录表
3. 菜池设施空间表
4. 浮板实物资产台账
5. 定植生产与采收生命周期表
"""

import json
import subprocess
import sys
import time

def run_cmd(cmd_list):
    print(f">> 正在执行: {' '.join(cmd_list[:4])} ...")
    res = subprocess.run(cmd_list, capture_output=True, text=True, encoding="utf-8", shell=True)
    if res.returncode != 0:
        print(f"❌ 命令执行失败:\nSTDOUT: {res.stdout}\nSTDERR: {res.stderr}")
        sys.exit(1)
    try:
        return json.loads(res.stdout)
    except Exception:
        return res.stdout


def main():
    print("=== [1] 开始创建飞书多维表格与首表《种子与种苗台账》 ===")
    
    seeds_fields = [
        {"name": "种子批次号", "type": "text"},
        {"name": "作物名称", "type": "select", "options": [
            {"name": "西洋菜 (豆瓣菜)"}, {"name": "奶油生菜"}, {"name": "红橡叶生菜"},
            {"name": "绿橡叶生菜"}, {"name": "罗马生菜"}, {"name": "广东菜心"},
            {"name": "大叶菠菜"}, {"name": "茼蒿菜"}, {"name": "油麦菜"},
            {"name": "羽衣甘蓝"}, {"name": "千禧红圣女果"}, {"name": "黄金蜜黄圣女果"},
            {"name": "黑珍珠巧克力小番茄"}, {"name": "红颜高架草莓"}, {"name": "空心菜 (水蕹菜)"},
            {"name": "忧遁草 (鳄嘴花)"}, {"name": "血通菜 (宽叶十万错)"}, {"name": "片仔癀草 (白凤菜)"}
        ]},
        {"name": "具体品种", "type": "text"},
        {"name": "供应商与生产商", "type": "text"},
        {"name": "到货日期", "type": "datetime"},
        {"name": "原厂包装批号", "type": "text"},
        {"name": "实测发芽率(%)", "type": "number"},
        {"name": "剩余库存(克或粒)", "type": "number"},
        {"name": "质量状态", "type": "select", "options": [
            {"name": "合格正常"}, {"name": "临期预警"}, {"name": "发芽率衰退"}, {"name": "封存停用"}
        ]},
        {"name": "农艺备注", "type": "text"}
    ]

    create_base_cmd = [
        "lark-cli", "base", "+base-create",
        "--name", "数字化农业工厂·生产流转与资产SSOT",
        "--table-name", "种子与种苗台账",
        "--fields", json.dumps(seeds_fields, ensure_ascii=False),
        "--as", "user",
        "--json"
    ]
    
    base_res = run_cmd(create_base_cmd)
    base_token = base_res.get("data", {}).get("base", {}).get("base_token") or base_res.get("data", {}).get("base_token")
    if not base_token:
        # 有时直接在根 data 字典中
        base_token = base_res.get("base_token") or base_res.get("data", {}).get("app", {}).get("app_token")
        
    print(f"✅ Base 创建成功！Base Token: {base_token}")

    # =========================================================================
    # 创建其余 4 张表
    # =========================================================================
    tables_to_create = [
        {
            "name": "育苗与播种记录表",
            "fields": [
                {"name": "育苗批次号", "type": "text"},
                {"name": "关联种子批次", "type": "text"},
                {"name": "播种日期", "type": "datetime"},
                {"name": "育苗海绵穴盘规格", "type": "select", "options": [
                    {"name": "96孔方块海绵盘"}, {"name": "72孔标准穴盘"}, {"name": "128孔密集穴盘"}, {"name": "岩棉育苗块"}
                ]},
                {"name": "播种盘数(张)", "type": "number"},
                {"name": "理论出苗数(株)", "type": "number"},
                {"name": "暗室出苗日期", "type": "datetime"},
                {"name": "当前育苗状态", "type": "select", "options": [
                    {"name": "暗室催芽中"}, {"name": "绿化补光中"}, {"name": "待分苗定植"}, {"name": "已移栽入池完毕"}, {"name": "僵苗报废"}
                ]},
                {"name": "育苗责任技术员", "type": "text"},
                {"name": "作业备注", "type": "text"}
            ]
        },
        {
            "name": "菜池设施空间表",
            "fields": [
                {"name": "菜池设施编号", "type": "text"},
                {"name": "菜池俗称与位置", "type": "text"},
                {"name": "设施物理类型", "type": "select", "options": [
                    {"name": "刀刮布落地水培菜池 (BED-TP)"},
                    {"name": "不锈钢离地水培菜池 (BED-SS)"},
                    {"name": "A字架立体基质架 (RACK-AF)"},
                    {"name": "荷兰桶滴灌排 (ROW-DB)"}
                ]},
                {"name": "所在微气候分区", "type": "select", "options": [
                    {"name": "Zone A 水培大宗区"},
                    {"name": "Zone B 精品展示区"},
                    {"name": "Zone C 育苗试验区"},
                    {"name": "Zone D 果菜基质区"}
                ]},
                {"name": "物理长宽规格(米)", "type": "text"},
                {"name": "额定浮板容量(块)", "type": "number"},
                {"name": "当前推板状态", "type": "select", "options": [
                    {"name": "满负荷生产中"},
                    {"name": "部分在池推板"},
                    {"name": "清池消杀休整中"},
                    {"name": "设备检修维护"}
                ]},
                {"name": "责任技术员", "type": "text"}
            ]
        },
        {
            "name": "浮板实物资产台账",
            "fields": [
                {"name": "浮板编号", "type": "text"},
                {"name": "定植孔数规格", "type": "select", "options": [
                    {"name": "24孔 (4x6)"},
                    {"name": "18孔 (3x6)"},
                    {"name": "72孔密植型"},
                    {"name": "36孔中密度"}
                ]},
                {"name": "浮板几何尺寸(米)", "type": "text"},
                {"name": "当前所在菜池", "type": "text"},
                {"name": "浮板当前状态", "type": "select", "options": [
                    {"name": "闲置待清洗"},
                    {"name": "二级消杀备用"},
                    {"name": "培育栽培在池"},
                    {"name": "破损老化报废"}
                ]},
                {"name": "累计周转采收茬数", "type": "number"},
                {"name": "资产登记入库日期", "type": "datetime"},
                {"name": "资产维护备注", "type": "text"}
            ]
        },
        {
            "name": "定植生产与采收生命周期表",
            "fields": [
                {"name": "生产工单批次号", "type": "text"},
                {"name": "作物名称", "type": "select", "options": [
                    {"name": "西洋菜 (豆瓣菜)"}, {"name": "奶油生菜"}, {"name": "红橡叶生菜"},
                    {"name": "绿橡叶生菜"}, {"name": "罗马生菜"}, {"name": "广东菜心"},
                    {"name": "大叶菠菜"}, {"name": "茼蒿菜"}, {"name": "油麦菜"},
                    {"name": "羽衣甘蓝"}, {"name": "千禧红圣女果"}, {"name": "黄金蜜黄圣女果"},
                    {"name": "黑珍珠巧克力小番茄"}, {"name": "红颜高架草莓"}, {"name": "空心菜 (水蕹菜)"},
                    {"name": "忧遁草 (鳄嘴花)"}, {"name": "血通菜 (宽叶十万错)"}, {"name": "片仔癀草 (白凤菜)"}
                ]},
                {"name": "种植菜池编号", "type": "text"},
                {"name": "来源育苗批次", "type": "text"},
                {"name": "投入浮板编号列表", "type": "text"},
                {"name": "定植总板数(块)", "type": "number"},
                {"name": "定植总株数(株)", "type": "number"},
                {"name": "定植入池日期", "type": "datetime"},
                {"name": "预计采收日期", "type": "datetime"},
                {"name": "实际采收日期", "type": "datetime"},
                {"name": "实际采收毛重(kg)", "type": "number"},
                {"name": "初切根净重(kg)", "type": "number"},
                {"name": "实测糖度(Brix°)", "type": "number"},
                {"name": "异常孔位死苗记录", "type": "text"},
                {"name": "生产批次状态", "type": "select", "options": [
                    {"name": "定植生长中"},
                    {"name": "预采收控氮中"},
                    {"name": "采收初加工完毕"},
                    {"name": "批次归档结束"}
                ]},
                {"name": "质检与品控备注", "type": "text"}
            ]
        }
    ]

    for t in tables_to_create:
        print(f"\n>> 正在创建数据表: 《{t['name']}》...")
        t_cmd = [
            "lark-cli", "base", "+table-create",
            "--base-token", base_token,
            "--name", t["name"],
            "--fields", json.dumps(t["fields"], ensure_ascii=False),
            "--as", "user",
            "--json"
        ]
        t_res = run_cmd(t_cmd)
        t_id = t_res.get("data", {}).get("table_id") or t_res.get("table_id")
        print(f"✅ 《{t['name']}》创建成功！Table ID: {t_id}")
        time.sleep(1)

    print("\n=======================================================")
    print("🎉 恭喜！《数字化农业工厂·生产流转与资产SSOT》多维表格已全部创建就绪！")
    print(f"🔗 访问 Base Token: {base_token}")
    print(f"🔗 浏览器直达链接: https://feishu.cn/base/{base_token}")
    print("=======================================================")

if __name__ == "__main__":
    main()
