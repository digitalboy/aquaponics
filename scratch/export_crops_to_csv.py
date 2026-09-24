#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
将 crops_catalog.json 导出为纯中文表述的 CSV 表格（采用 utf-8-sig 编码，确保 Windows Excel 双击直接打开不乱码）：
1. crops_nutrition_metrics.csv：营养功效与权威信源明细表（字段名全中文，无程序员式英文字符，给领导、客户、投资人和质检部门汇报使用）
2. crops_catalog.csv：作物综合农艺主数据与品质总表（全中文表头与枚举值中文翻译）
"""

import json
import csv

# 辅助枚举中文映射字典
CATEGORY_MAP = {
    "lettuce": "散叶/结球生菜 (莴苣属)",
    "aquatic_herb": "水生草本植物",
    "brassica_greens": "十字花科绿叶菜",
    "leafy_greens": "特色绿叶菜类",
    "medicinal_herb": "药食同源功能蔬菜",
    "solanaceous_fruit": "茄果类 (小番茄/辣椒)",
    "cucurbit_fruit": "瓜果类 (黄瓜/西瓜/甜瓜)",
    "berry_fruit": "浆果类 (高架草莓)",
    "warm_summer_greens": "盛夏耐热绿叶菜"
}

SEASONALITY_MAP = {
    "cool_season": "冷凉喜凉型",
    "warm_season": "喜温耐热型",
    "neutral_flexible": "四季广温型"
}

SYSTEM_MAP = {
    "ground_tarpaulin_bed": "刀刮布落地水培菜池",
    "elevated_stainless_bed": "不锈钢离地水培菜池",
    "a_frame_substrate_rack": "A字架立体基质架",
    "dwc_raceway": "通用水培深水池",
    "nft_gully": "浅液流水培管道",
    "substrate_trough": "高架单层基质槽",
    "dutch_bucket": "独立荷兰桶/种植袋",
    "aeroponics_tower": "垂直气雾栽培塔"
}

HARVEST_MAP = {
    "single_cut_head": "整株一次性切根采收",
    "continuous_cut": "割茬连续多次采收",
    "fruit_picking": "分批成熟采摘",
    "leaf_stripping": "分批剥叶采收"
}

SENSITIVITY_MAP = {
    "low": "低敏感",
    "medium": "中等敏感",
    "high": "高敏感 (需补钙)",
    "severe": "极高敏感 (严防心腐)"
}

TOLERANCE_MAP = {
    "low": "耐受度低 (要求硝化彻底)",
    "medium": "中等耐受",
    "high": "高耐受度"
}

READINESS_MAP = {
    "onsite_rapid": "基地现场自测快检 (糖度计/便携试纸)",
    "lab_third_party": "第三方权威实验室送检 (国标法定检验)",
    "strategic_reserve": "理论攻关与战略储备 (中长期光配方研发)"
}

def export_csv():
    json_path = "packages/schema/data/crops_catalog.json"
    nutrition_csv_path = "packages/schema/data/crops_nutrition_metrics.csv"
    main_csv_path = "packages/schema/data/crops_catalog.csv"

    with open(json_path, "r", encoding="utf-8") as f:
        catalog = json.load(f)

    crops = catalog.get("crops", [])

    # =========================================================================
    # 1. 导出营养功效与权威信源明细表：crops_nutrition_metrics.csv (纯中文面向外部汇报)
    # =========================================================================
    nutr_headers = [
        "作物编号",
        "作物名称",
        "具体品种品系",
        "营养与功能性成分",
        "成分英文标识",
        "基地调控目标值",
        "传统土培参考基线",
        "计量单位",
        "形态计算基准",
        "当前检测实施阶段",
        "权威检测依据与文献出处",
        "营养健康价值与提质机理说明"
    ]

    nutr_rows = []
    for c in crops:
        cid = c.get("crop_id")
        cname = c.get("common_name")
        vname = c.get("variety_name")
        qp = c.get("target_quality_profile", {})
        for n in qp.get("functional_nutrition", []):
            basis_cn = "鲜重 (直接食用形态)" if n.get("basis") == "fresh_weight" else "干重 (烘干脱水干样)"
            readiness_cn = READINESS_MAP.get(n.get("testing_readiness"), n.get("testing_readiness"))

            row = [
                cid,
                cname,
                vname,
                n.get("name_cn"),
                n.get("metric_id"),
                n.get("target_value"),
                n.get("traditional_benchmark"),
                n.get("unit"),
                basis_cn,
                readiness_cn,
                n.get("authoritative_source"),
                n.get("biological_significance", "")
            ]
            nutr_rows.append(row)

    with open(nutrition_csv_path, "w", encoding="utf-8-sig", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(nutr_headers)
        writer.writerows(nutr_rows)

    # =========================================================================
    # 2. 导出综合大表：crops_catalog.csv (全中文表头与枚举值翻译)
    # =========================================================================
    main_headers = [
        "作物编号",
        "作物名称",
        "具体品种名",
        "植物拉丁学名",
        "作物品类",
        "适生季节型",
        "适用栽培设施",
        "采收模式",
        "最适昼温(℃)",
        "最适夜温(℃)",
        "最适水温(℃)",
        "耐高温极限(℃)",
        "耐低温极限(℃)",
        "最适营养液EC浓度(mS/cm)",
        "最适酸碱度pH范围",
        "最低溶解氧DO(mg/L)",
        "顶烧病(缺钙)敏感度",
        "分子氨耐受能力",
        "最适日累积光照DLI(mol/m²/天)",
        "光周期日照时长(小时/天)",
        "光饱和点(Lux)",
        "育苗周期(天)",
        "定植生长期(天)",
        "全生命周期总天数(天)",
        "建议定植株距(cm)",
        "定植密度(株/㎡)",
        "预期单茬产量(kg/㎡)",
        "目标糖度(Brix°)",
        "出厂最低合格糖度(Brix°)",
        "最适糖酸比",
        "硝酸盐控制上限(mg/kg)",
        "亚硝酸盐控制上限(mg/kg)",
        "化学农药残留要求",
        "安全限值法定法规依据",
        "口感质构特征",
        "风味纯化与苦涩味抑制技术",
        "核心营养与功效成分概要",
        "相克共线禁忌作物",
        "农艺生产与排产备注"
    ]

    main_rows = []
    for c in crops:
        temp = c.get("temperature", {})
        fert = c.get("fertigation", {})
        light = c.get("lighting", {})
        qp = c.get("target_quality_profile", {})
        safe = qp.get("safety_ceilings", {})
        flavor = qp.get("sensory_flavor", {})
        nutr_list = qp.get("functional_nutrition", [])

        # 汇总营养指标中文串
        nutr_summaries = []
        for n in nutr_list:
            basis_str = "鲜重" if n.get("basis") == "fresh_weight" else "干重"
            nutr_summaries.append(f"{n.get('name_cn')}: 目标{n.get('target_value')} {n.get('unit')}({basis_str})")
        nutr_summary_str = "；".join(nutr_summaries)

        nursery_days = c.get("nursery_cycle_days", 0)
        growth_days = c.get("growth_cycle_days", 0)
        total_days = nursery_days + growth_days

        sar = flavor.get("sugar_acid_ratio")
        sar_str = f"{sar[0]}~{sar[1]}" if sar else "-"

        # 翻译设施
        systems_cn = [SYSTEM_MAP.get(s, s) for s in c.get("supported_systems", [])]

        row = [
            c.get("crop_id"),
            c.get("common_name"),
            c.get("variety_name"),
            c.get("botanical_name", ""),
            CATEGORY_MAP.get(c.get("category"), c.get("category")),
            SEASONALITY_MAP.get(c.get("seasonality"), c.get("seasonality")),
            "、".join(systems_cn),
            HARVEST_MAP.get(c.get("harvest_mode"), c.get("harvest_mode")),
            f"{temp.get('day_temp_c', [0, 0])[0]}~{temp.get('day_temp_c', [0, 0])[1]}",
            f"{temp.get('night_temp_c', [0, 0])[0]}~{temp.get('night_temp_c', [0, 0])[1]}",
            f"{temp.get('water_temp_c', [0, 0])[0]}~{temp.get('water_temp_c', [0, 0])[1]}",
            temp.get("critical_high_temp_c"),
            temp.get("critical_low_temp_c"),
            f"{fert.get('optimal_ec_ms_cm', [0, 0])[0]}~{fert.get('optimal_ec_ms_cm', [0, 0])[1]}",
            f"{fert.get('optimal_ph', [0, 0])[0]}~{fert.get('optimal_ph', [0, 0])[1]}",
            fert.get("min_dissolved_oxygen_mg_l"),
            SENSITIVITY_MAP.get(fert.get("tipburn_sensitivity"), fert.get("tipburn_sensitivity")),
            TOLERANCE_MAP.get(fert.get("ammonia_tolerance"), fert.get("ammonia_tolerance")),
            f"{light.get('optimal_dli_mol_m2_day', [0, 0])[0]}~{light.get('optimal_dli_mol_m2_day', [0, 0])[1]}",
            f"{light.get('photoperiod_hours', [0, 0])[0]}~{light.get('photoperiod_hours', [0, 0])[1]}",
            light.get("light_saturation_point_lux"),
            nursery_days,
            growth_days,
            total_days,
            c.get("recommended_plant_spacing_cm"),
            c.get("target_plant_density_per_m2"),
            c.get("expected_yield_kg_per_m2_cycle"),
            flavor.get("target_brix", "-"),
            flavor.get("min_acceptable_brix", "-"),
            sar_str,
            safe.get("nitrate_mg_kg_ceiling", "-"),
            safe.get("nitrite_mg_kg_ceiling", "-"),
            safe.get("pesticide_residue_limit", "-"),
            safe.get("authoritative_source", "-"),
            flavor.get("texture_crispness", "-"),
            flavor.get("bitterness_astringency_control", "-"),
            nutr_summary_str,
            "、".join(c.get("incompatible_crop_ids", [])),
            c.get("notes", "")
        ]
        main_rows.append(row)

    with open(main_csv_path, "w", encoding="utf-8-sig", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(main_headers)
        writer.writerows(main_rows)

    print(f"✅ 成功更新纯中文营养细表: {nutrition_csv_path} (共 {len(nutr_rows)} 项指标)")
    print(f"✅ 成功更新纯中文综合大表: {main_csv_path} (共 {len(main_rows)} 种作物)")

if __name__ == "__main__":
    export_csv()
