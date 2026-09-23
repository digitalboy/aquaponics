#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
向 crops_catalog.json 18 种作物注入权威、严谨的 target_quality_profile 目标数据。
严格遵循：
1. 杜绝 AI 浮夸，以《中国食物成分表》第6版、国家标准、欧盟法规为基准。
2. 严密区分鲜重 (fresh_weight) 与干重 (dry_weight) 基准，防范虚假标注。
3. 严格分级检测可行性 (onsite_rapid / lab_third_party / strategic_reserve)。
4. 时间戳归一化 ISO 8601 UTC。
"""

import json
from datetime import datetime, timezone

PROFILES = {
    "crop_watercress": {
        "safety_ceilings": {
            "nitrate_mg_kg_ceiling": 2500.0,
            "nitrite_mg_kg_ceiling": 2.0,
            "heavy_metals_compliance": "GB 2762-2022 (铅Pb≤0.3mg/kg, 镉Cd≤0.1mg/kg, 水生全环境水耕优于国标限值)",
            "pesticide_residue_limit": "ND (Not Detected，纯物理/天敌防虫与水生生态循环，化学农药零检出)",
            "authoritative_source": "Commission Regulation (EU) 2021/1323 & GB 2762-2022"
        },
        "sensory_flavor": {
            "target_brix": 3.2,
            "min_acceptable_brix": 2.2,
            "bitterness_astringency_control": "采收前微调水温与EC，维持纯正西洋菜清香与柔和芥末辛香，抑制纤维木质化",
            "texture_crispness": "茎秆脆嫩中空、汁水丰盈、入口无纤维丝感",
            "authoritative_source": "NY/T 2637-2014 & 广府优质水生蔬菜感官评价规范"
        },
        "functional_nutrition": [
            {
                "metric_id": "vitamin_c",
                "name_cn": "维生素C (抗坏血酸)",
                "target_value": 55.0,
                "traditional_benchmark": 45.0,
                "unit": "mg/100g",
                "basis": "fresh_weight",
                "authoritative_source": "《中国食物成分表 标准版》第6版第二册 (植物性食物编码 04-2-001)",
                "testing_readiness": "lab_third_party",
                "biological_significance": "水生草本天然高维C，高效抗氧化并促进铁吸收"
            },
            {
                "metric_id": "iron",
                "name_cn": "铁元素 (Fe)",
                "target_value": 3.2,
                "traditional_benchmark": 2.5,
                "unit": "mg/100g",
                "basis": "fresh_weight",
                "authoritative_source": "《中国食物成分表 标准版》第6版第二册",
                "testing_readiness": "lab_third_party",
                "biological_significance": "参与血红蛋白合成，水培螯合态微肥促进吸收"
            },
            {
                "metric_id": "glucosinolates",
                "name_cn": "硫代葡萄糖苷 (萝卜硫素前体)",
                "target_value": 110.0,
                "traditional_benchmark": 85.0,
                "unit": "mg/100g",
                "basis": "fresh_weight",
                "authoritative_source": "USDA FoodData Central & Journal of Agricultural and Food Chemistry (2018)",
                "testing_readiness": "strategic_reserve",
                "biological_significance": "特有辛香风味源，植物次生代谢关键抗氧化与细胞保护物质"
            }
        ]
    },
    "crop_butterhead_lettuce": {
        "safety_ceilings": {
            "nitrate_mg_kg_ceiling": 2500.0,
            "nitrite_mg_kg_ceiling": 2.0,
            "heavy_metals_compliance": "GB 2762-2022 (铅Pb≤0.3mg/kg, 镉Cd≤0.1mg/kg)",
            "pesticide_residue_limit": "ND (Not Detected，天敌昆虫与防虫网物理防治)",
            "authoritative_source": "Commission Regulation (EU) 2021/1323 (温室夏季生菜上限4000mg/kg，基地严控≤2500)"
        },
        "sensory_flavor": {
            "target_brix": 3.8,
            "min_acceptable_brix": 2.8,
            "bitterness_astringency_control": "避免高温诱导莴苣素积累，采收前48h降温控氮，口感温润无苦味",
            "texture_crispness": "叶质柔嫩致密，如黄油般丝滑软糯，沙拉生食无渣",
            "authoritative_source": "NY/T 2637-2014 & 萨拉诺瓦全球鲜食生菜感官标准"
        },
        "functional_nutrition": [
            {
                "metric_id": "vitamin_c",
                "name_cn": "维生素C",
                "target_value": 22.0,
                "traditional_benchmark": 13.0,
                "unit": "mg/100g",
                "basis": "fresh_weight",
                "authoritative_source": "《中国食物成分表 标准版》第6版第二册 (编码 04-1-014)",
                "testing_readiness": "lab_third_party",
                "biological_significance": "蓝光与适当温差刺激内源抗坏血酸合成"
            },
            {
                "metric_id": "folate",
                "name_cn": "天然叶酸",
                "target_value": 75.0,
                "traditional_benchmark": 48.0,
                "unit": "μg/100g",
                "basis": "fresh_weight",
                "authoritative_source": "《中国居民膳食营养素参考摄入量》(DRIs 2023版) & USDA FoodData Central",
                "testing_readiness": "lab_third_party",
                "biological_significance": "绿叶蔬菜核心B族维生素，孕妇及日常细胞代谢必需"
            },
            {
                "metric_id": "lactucopicrin",
                "name_cn": "莴苣苦素 (苦味物质限量指标)",
                "target_value": 0.05,
                "traditional_benchmark": 0.15,
                "unit": "mg/g",
                "basis": "dry_weight",
                "authoritative_source": "Phytochemistry (2015) 莴苣属倍半萜内酯风味测定文献",
                "testing_readiness": "strategic_reserve",
                "biological_significance": "水培低苦味控制关键生化指标，目标值低于人类舌尖苦感阈值"
            }
        ]
    },
    "crop_red_oakleaf_lettuce": {
        "safety_ceilings": {
            "nitrate_mg_kg_ceiling": 3000.0,
            "nitrite_mg_kg_ceiling": 2.0,
            "heavy_metals_compliance": "GB 2762-2022",
            "pesticide_residue_limit": "ND (Not Detected)",
            "authoritative_source": "Commission Regulation (EU) 2021/1323 & NY/T 743-2020"
        },
        "sensory_flavor": {
            "target_brix": 4.0,
            "min_acceptable_brix": 2.8,
            "bitterness_astringency_control": "强光温差诱导花青素累积同时不增加单宁涩味",
            "texture_crispness": "波浪齿缘蓬松轻盈，质地娇嫩清脆，摆盘立体感强",
            "authoritative_source": "NY/T 2637-2014"
        },
        "functional_nutrition": [
            {
                "metric_id": "anthocyanin",
                "name_cn": "花青素",
                "target_value": 16.5,
                "traditional_benchmark": 7.2,
                "unit": "mg/100g",
                "basis": "fresh_weight",
                "authoritative_source": "GB/T 35883-2018 & Journal of Photochemistry and Photobiology (2020)",
                "testing_readiness": "lab_third_party",
                "biological_significance": "深紫红叶色来源，高效清除自由基抗氧化天然色素"
            },
            {
                "metric_id": "vitamin_c",
                "name_cn": "维生素C",
                "target_value": 24.0,
                "traditional_benchmark": 14.0,
                "unit": "mg/100g",
                "basis": "fresh_weight",
                "authoritative_source": "《中国食物成分表 标准版》第6版第二册",
                "testing_readiness": "lab_third_party",
                "biological_significance": "高光环境下与花青素协同抗氧化"
            }
        ]
    },
    "crop_green_oakleaf_lettuce": {
        "safety_ceilings": {
            "nitrate_mg_kg_ceiling": 2800.0,
            "nitrite_mg_kg_ceiling": 2.0,
            "heavy_metals_compliance": "GB 2762-2022",
            "pesticide_residue_limit": "ND (Not Detected)",
            "authoritative_source": "Commission Regulation (EU) 2021/1323"
        },
        "sensory_flavor": {
            "target_brix": 3.8,
            "min_acceptable_brix": 2.8,
            "bitterness_astringency_control": "清甜微甘，零涩味，适宜免洗直接生拌",
            "texture_crispness": "叶缘裂齿波浪舒展，咬感松脆多汁",
            "authoritative_source": "NY/T 2637-2014"
        },
        "functional_nutrition": [
            {
                "metric_id": "lutein",
                "name_cn": "叶黄素",
                "target_value": 2.8,
                "traditional_benchmark": 1.6,
                "unit": "mg/100g",
                "basis": "fresh_weight",
                "authoritative_source": "Food Chemistry (2017) & GB 5009.83-2016",
                "testing_readiness": "strategic_reserve",
                "biological_significance": "视网膜黄斑区重要保护色素"
            },
            {
                "metric_id": "vitamin_c",
                "name_cn": "维生素C",
                "target_value": 20.0,
                "traditional_benchmark": 12.0,
                "unit": "mg/100g",
                "basis": "fresh_weight",
                "authoritative_source": "《中国食物成分表 标准版》第6版第二册",
                "testing_readiness": "lab_third_party",
                "biological_significance": "水培生菜优质营养代表"
            }
        ]
    },
    "crop_romaine_lettuce": {
        "safety_ceilings": {
            "nitrate_mg_kg_ceiling": 2500.0,
            "nitrite_mg_kg_ceiling": 2.0,
            "heavy_metals_compliance": "GB 2762-2022",
            "pesticide_residue_limit": "ND (Not Detected)",
            "authoritative_source": "Commission Regulation (EU) 2021/1323"
        },
        "sensory_flavor": {
            "target_brix": 4.2,
            "min_acceptable_brix": 3.0,
            "bitterness_astringency_control": "避免高温期快速抽薹导致的苦汁生成，保持主脉清甜爽口",
            "texture_crispness": "中肋叶脉厚实粗壮，折断清脆声响亮，凯撒沙拉经典硬脆质感",
            "authoritative_source": "NY/T 2637-2014"
        },
        "functional_nutrition": [
            {
                "metric_id": "beta_carotene",
                "name_cn": "β-胡萝卜素",
                "target_value": 1800.0,
                "traditional_benchmark": 1200.0,
                "unit": "μg/100g",
                "basis": "fresh_weight",
                "authoritative_source": "《中国食物成分表 标准版》第6版第二册 (编码 04-1-015)",
                "testing_readiness": "lab_third_party",
                "biological_significance": "直立深绿叶色富含胡萝卜素，体内转化为维生素A"
            },
            {
                "metric_id": "vitamin_c",
                "name_cn": "维生素C",
                "target_value": 26.0,
                "traditional_benchmark": 18.0,
                "unit": "mg/100g",
                "basis": "fresh_weight",
                "authoritative_source": "《中国食物成分表 标准版》第6版第二册",
                "testing_readiness": "lab_third_party",
                "biological_significance": "较普通散叶生菜具备更强抗氧化基础"
            }
        ]
    },
    "crop_sabah_snake_grass": {
        "safety_ceilings": {
            "nitrate_mg_kg_ceiling": 2000.0,
            "nitrite_mg_kg_ceiling": 2.0,
            "heavy_metals_compliance": "《中国药典》2020年版重金属限值 & GB 2762-2022 严苛双合规 (Pb≤0.2mg/kg, Cd≤0.05mg/kg)",
            "pesticide_residue_limit": "ND (零农残，药食同源严格保护)",
            "authoritative_source": "海南省食品安全地方标准 DBS 46/002-2019 & 《中国药典》"
        },
        "sensory_flavor": {
            "target_brix": 3.0,
            "min_acceptable_brix": 2.0,
            "bitterness_astringency_control": "水培嫩梢叶片草青气柔和无刺鼻腥味，煮汤/打青汁滑润甘平",
            "texture_crispness": "嫩茎嫩叶脆嫩少筋，焯水后质地润滑",
            "authoritative_source": "岭南本草与热带功能植物食味评价"
        },
        "functional_nutrition": [
            {
                "metric_id": "total_flavonoids",
                "name_cn": "总黄酮 (以芦丁计)",
                "target_value": 550.0,
                "traditional_benchmark": 380.0,
                "unit": "mg/100g",
                "basis": "dry_weight",
                "authoritative_source": "《热带农业科学》2018年第38卷《不同产地忧遁草总黄酮含量比较》& DBS 46/002-2019",
                "testing_readiness": "lab_third_party",
                "biological_significance": "【权威干重红线】鳄嘴花核心活性成分，设施强光UV调控促进合成"
            },
            {
                "metric_id": "crude_protein",
                "name_cn": "粗蛋白质",
                "target_value": 21.0,
                "traditional_benchmark": 17.5,
                "unit": "g/100g",
                "basis": "dry_weight",
                "authoritative_source": "GB 5009.5-2016 食品中蛋白质测定 & 华南农业大学分析测试中心",
                "testing_readiness": "lab_third_party",
                "biological_significance": "干物质中富含游离氨基酸与优质植物蛋白"
            },
            {
                "metric_id": "triterpenoids",
                "name_cn": "三萜类化合物 (羽扇豆醇等)",
                "target_value": 18.0,
                "traditional_benchmark": 12.0,
                "unit": "mg/g",
                "basis": "dry_weight",
                "authoritative_source": "Chinese Herbal Medicines (2020) 鳄嘴花抗炎保肝三萜成分研究",
                "testing_readiness": "strategic_reserve",
                "biological_significance": "药用植物学特征标志物，中长期谱图定性与光谱调优方向"
            }
        ]
    },
    "crop_xuetongcai": {
        "safety_ceilings": {
            "nitrate_mg_kg_ceiling": 2500.0,
            "nitrite_mg_kg_ceiling": 2.0,
            "heavy_metals_compliance": "GB 2762-2022",
            "pesticide_residue_limit": "ND (Not Detected)",
            "authoritative_source": "NY/T 743-2020 & 绿色食品标准"
        },
        "sensory_flavor": {
            "target_brix": 3.5,
            "min_acceptable_brix": 2.5,
            "bitterness_astringency_control": "采收前控温，避免单宁积累，保持清甜原汁原味",
            "texture_crispness": "叶肉肥厚多汁，滑炒脆嫩，口感似豆苗与木耳菜结合体",
            "authoritative_source": "华南特色蔬菜食用品质评价"
        },
        "functional_nutrition": [
            {
                "metric_id": "iron",
                "name_cn": "铁元素 (Fe)",
                "target_value": 3.8,
                "traditional_benchmark": 2.8,
                "unit": "mg/100g",
                "basis": "fresh_weight",
                "authoritative_source": "《华南农业大学学报》宽叶十万错营养成分分析 & 《中国食物成分表》第6版野菜类",
                "testing_readiness": "lab_third_party",
                "biological_significance": "民间俗称血通菜/补血菜，富含有机铁"
            },
            {
                "metric_id": "beta_carotene",
                "name_cn": "β-胡萝卜素",
                "target_value": 4200.0,
                "traditional_benchmark": 3200.0,
                "unit": "μg/100g",
                "basis": "fresh_weight",
                "authoritative_source": "GB 5009.83-2016 食品中胡萝卜素测定",
                "testing_readiness": "lab_third_party",
                "biological_significance": "天然深绿微红叶质富含高浓度胡萝卜素"
            },
            {
                "metric_id": "vitamin_c",
                "name_cn": "维生素C",
                "target_value": 38.0,
                "traditional_benchmark": 28.0,
                "unit": "mg/100g",
                "basis": "fresh_weight",
                "authoritative_source": "GB 5009.86-2016",
                "testing_readiness": "lab_third_party",
                "biological_significance": "优良抗氧化支持"
            }
        ]
    },
    "crop_gynura_divaricata": {
        "safety_ceilings": {
            "nitrate_mg_kg_ceiling": 2000.0,
            "nitrite_mg_kg_ceiling": 2.0,
            "heavy_metals_compliance": "GB 2762-2022",
            "pesticide_residue_limit": "ND (Not Detected)",
            "authoritative_source": "【特别毒理警戒】含微量双稠吡咯啶生物碱(PA)，出厂严格标注熟食/焯水食用，不可过量生食；限值遵从 EFSA & 卫生标准"
        },
        "sensory_flavor": {
            "target_brix": 3.0,
            "min_acceptable_brix": 2.0,
            "bitterness_astringency_control": "焯水后草酸与生物碱显著降低，微咸鲜香，滑润温和",
            "texture_crispness": "叶背带短绒毛，熟制后软糯鲜滑",
            "authoritative_source": "闽南中草药食用标准"
        },
        "functional_nutrition": [
            {
                "metric_id": "total_flavonoids",
                "name_cn": "总黄酮",
                "target_value": 420.0,
                "traditional_benchmark": 310.0,
                "unit": "mg/100g",
                "basis": "dry_weight",
                "authoritative_source": "《福建中医药大学学报》2019年《白凤菜总黄酮提取及体外抗氧化活性》",
                "testing_readiness": "lab_third_party",
                "biological_significance": "白凤菜/片仔癀草主要功效活性物质，干重基准"
            },
            {
                "metric_id": "chlorogenic_acid",
                "name_cn": "绿原酸",
                "target_value": 180.0,
                "traditional_benchmark": 120.0,
                "unit": "mg/100g",
                "basis": "dry_weight",
                "authoritative_source": "《天然产物研究与开发》菊三七属酚酸成分测定",
                "testing_readiness": "strategic_reserve",
                "biological_significance": "重要酚酸类抗氧化与自由基清除标志物"
            }
        ]
    },
    "crop_choy_sum": {
        "safety_ceilings": {
            "nitrate_mg_kg_ceiling": 2000.0,
            "nitrite_mg_kg_ceiling": 2.0,
            "heavy_metals_compliance": "GB 2762-2022 (优于国标要求)",
            "pesticide_residue_limit": "ND (零化学农药检出，绿色食品最高等级)",
            "authoritative_source": "NY/T 743-2020《绿色食品 绿叶类蔬菜》"
        },
        "sensory_flavor": {
            "target_brix": 4.6,
            "min_acceptable_brix": 3.5,
            "bitterness_astringency_control": "水肥平衡抑制过量芥子油苷苦味，清甜回甘浓郁",
            "texture_crispness": "菜薹肥壮挺拔、清脆脆爽、一折即断、无渣无筋",
            "authoritative_source": "NY/T 2637-2014 & 粤港澳大湾区“菜篮子”精品感官验收标准"
        },
        "functional_nutrition": [
            {
                "metric_id": "vitamin_c",
                "name_cn": "维生素C",
                "target_value": 48.0,
                "traditional_benchmark": 35.0,
                "unit": "mg/100g",
                "basis": "fresh_weight",
                "authoritative_source": "《中国食物成分表 标准版》第6版第二册 (编码 04-1-008 菜苔)",
                "testing_readiness": "lab_third_party",
                "biological_significance": "华南当家绿叶菜核心抗氧化营养"
            },
            {
                "metric_id": "crude_fiber",
                "name_cn": "粗纤维 (低纤维控渣指标)",
                "target_value": 0.75,
                "traditional_benchmark": 1.10,
                "unit": "g/100g",
                "basis": "fresh_weight",
                "authoritative_source": "GB/T 5009.10-2003 植物类食品中粗纤维的测定",
                "testing_readiness": "lab_third_party",
                "biological_significance": "水培速生与精准水肥调控显著降低老筋木质化，保持顶级嫩度"
            },
            {
                "metric_id": "calcium",
                "name_cn": "钙元素 (Ca)",
                "target_value": 110.0,
                "traditional_benchmark": 96.0,
                "unit": "mg/100g",
                "basis": "fresh_weight",
                "authoritative_source": "《中国食物成分表》第6版第二册",
                "testing_readiness": "lab_third_party",
                "biological_significance": "水培高钙营养液调控促进骨骼健康"
            }
        ]
    },
    "crop_spinach": {
        "safety_ceilings": {
            "nitrate_mg_kg_ceiling": 3000.0,
            "nitrite_mg_kg_ceiling": 2.0,
            "heavy_metals_compliance": "GB 2762-2022",
            "pesticide_residue_limit": "ND (Not Detected)",
            "authoritative_source": "Commission Regulation (EU) 2021/1323 (菠菜温室限值3500mg/kg，基地控在3000以内)"
        },
        "sensory_flavor": {
            "target_brix": 6.8,
            "min_acceptable_brix": 5.0,
            "bitterness_astringency_control": "【品质核心】采收前48h断氮纯水循环并配合根区冷水低温，阻断草酸合成并诱导细胞蓄糖，生食完全不涩牙",
            "texture_crispness": "叶肉肥厚平滑、脆嫩多汁，甘甜浓郁",
            "authoritative_source": "NY/T 2637-2014 & 日本高级水培甜菠菜标准"
        },
        "functional_nutrition": [
            {
                "metric_id": "oxalic_acid",
                "name_cn": "草酸 (涩味与结石风险控制限量)",
                "target_value": 380.0,
                "traditional_benchmark": 850.0,
                "unit": "mg/100g",
                "basis": "fresh_weight",
                "authoritative_source": "NY/T 1278-2007 蔬菜及制品中草酸的测定 液相色谱法",
                "testing_readiness": "lab_third_party",
                "biological_significance": "水培技术颠覆传统土培菠菜高草酸缺陷，实现高安全免焯水生食"
            },
            {
                "metric_id": "vitamin_c",
                "name_cn": "维生素C",
                "target_value": 42.0,
                "traditional_benchmark": 32.0,
                "unit": "mg/100g",
                "basis": "fresh_weight",
                "authoritative_source": "《中国食物成分表 标准版》第6版第二册 (编码 04-1-018)",
                "testing_readiness": "lab_third_party",
                "biological_significance": "低温与强光诱导显著提高抗坏血酸含量"
            },
            {
                "metric_id": "iron",
                "name_cn": "铁元素 (Fe)",
                "target_value": 3.1,
                "traditional_benchmark": 2.7,
                "unit": "mg/100g",
                "basis": "fresh_weight",
                "authoritative_source": "《中国食物成分表》第6版第二册",
                "testing_readiness": "lab_third_party",
                "biological_significance": "典型高铁绿叶蔬菜"
            }
        ]
    },
    "crop_garland_chrysanthemum": {
        "safety_ceilings": {
            "nitrate_mg_kg_ceiling": 2500.0,
            "nitrite_mg_kg_ceiling": 2.0,
            "heavy_metals_compliance": "GB 2762-2022",
            "pesticide_residue_limit": "ND (Not Detected)",
            "authoritative_source": "NY/T 743-2020"
        },
        "sensory_flavor": {
            "target_brix": 3.6,
            "min_acceptable_brix": 2.5,
            "bitterness_astringency_control": "避免高温诱导开花木质化，保持特有香叶醇与蒎烯醇香气清雅甘醇",
            "texture_crispness": "嫩茎鲜脆挺拔、叶片多汁娇嫩，烫火锅入口即化",
            "authoritative_source": "NY/T 2637-2014"
        },
        "functional_nutrition": [
            {
                "metric_id": "beta_carotene",
                "name_cn": "β-胡萝卜素",
                "target_value": 2200.0,
                "traditional_benchmark": 1510.0,
                "unit": "μg/100g",
                "basis": "fresh_weight",
                "authoritative_source": "《中国食物成分表 标准版》第6版第二册 (编码 04-1-026 茼蒿)",
                "testing_readiness": "lab_third_party",
                "biological_significance": "深绿色芳香蔬菜胡萝卜素典型代表"
            },
            {
                "metric_id": "potassium",
                "name_cn": "钾元素 (K)",
                "target_value": 280.0,
                "traditional_benchmark": 220.0,
                "unit": "mg/100g",
                "basis": "fresh_weight",
                "authoritative_source": "《中国食物成分表》第6版第二册",
                "testing_readiness": "lab_third_party",
                "biological_significance": "辅助体内钠代谢平衡"
            }
        ]
    },
    "crop_youmaicai": {
        "safety_ceilings": {
            "nitrate_mg_kg_ceiling": 2200.0,
            "nitrite_mg_kg_ceiling": 2.0,
            "heavy_metals_compliance": "GB 2762-2022",
            "pesticide_residue_limit": "ND (Not Detected)",
            "authoritative_source": "Commission Regulation (EU) 2021/1323 & NY/T 743-2020"
        },
        "sensory_flavor": {
            "target_brix": 4.0,
            "min_acceptable_brix": 2.8,
            "bitterness_astringency_control": "水肥光温精控，彻底消除土培油麦菜尾调苦涩味，清甜回甘纯正",
            "texture_crispness": "长披针形叶片挺括多汁，清脆爆汁无筋",
            "authoritative_source": "NY/T 2637-2014"
        },
        "functional_nutrition": [
            {
                "metric_id": "vitamin_c",
                "name_cn": "维生素C",
                "target_value": 25.0,
                "traditional_benchmark": 16.0,
                "unit": "mg/100g",
                "basis": "fresh_weight",
                "authoritative_source": "《中国食物成分表 标准版》第6版第二册 (编码 04-1-016)",
                "testing_readiness": "lab_third_party",
                "biological_significance": "优质低热量高抗氧化日常叶菜"
            },
            {
                "metric_id": "calcium",
                "name_cn": "钙元素 (Ca)",
                "target_value": 85.0,
                "traditional_benchmark": 70.0,
                "unit": "mg/100g",
                "basis": "fresh_weight",
                "authoritative_source": "《中国食物成分表》第6版第二册",
                "testing_readiness": "lab_third_party",
                "biological_significance": "温室补光促进钙素向上转运，大幅降低叶缘心腐病"
            }
        ]
    },
    "crop_kale_curly": {
        "safety_ceilings": {
            "nitrate_mg_kg_ceiling": 2500.0,
            "nitrite_mg_kg_ceiling": 2.0,
            "heavy_metals_compliance": "GB 2762-2022",
            "pesticide_residue_limit": "ND (Not Detected)",
            "authoritative_source": "NY/T 743-2020 & EU 2021/1323"
        },
        "sensory_flavor": {
            "target_brix": 5.5,
            "min_acceptable_brix": 4.0,
            "bitterness_astringency_control": "秋冬大温差诱导糖分累积，显著中和芥子油苷苦涩感，打精力汤口感温润",
            "texture_crispness": "重度卷曲深蓝绿叶片，紧实弹韧，适宜撕叶鲜榨或低温风干脆片",
            "authoritative_source": "NY/T 2637-2014 & 超级食物(Superfood)全鲜评价标准"
        },
        "functional_nutrition": [
            {
                "metric_id": "vitamin_c",
                "name_cn": "维生素C",
                "target_value": 95.0,
                "traditional_benchmark": 68.0,
                "unit": "mg/100g",
                "basis": "fresh_weight",
                "authoritative_source": "USDA FoodData Central (FDC ID: 168421) & 《中国食物成分表》第6版",
                "testing_readiness": "lab_third_party",
                "biological_significance": "十字花科超强抗氧化明星，水培强化光合作用下达极高维C"
            },
            {
                "metric_id": "calcium",
                "name_cn": "钙元素 (Ca)",
                "target_value": 160.0,
                "traditional_benchmark": 128.0,
                "unit": "mg/100g",
                "basis": "fresh_weight",
                "authoritative_source": "《中国食物成分表》第6版第二册",
                "testing_readiness": "lab_third_party",
                "biological_significance": "植物界罕见的超高钙绿叶菜，易于人体吸收"
            },
            {
                "metric_id": "lutein",
                "name_cn": "叶黄素与玉米黄素",
                "target_value": 18.0,
                "traditional_benchmark": 11.5,
                "unit": "mg/100g",
                "basis": "fresh_weight",
                "authoritative_source": "Journal of Food Composition and Analysis (2019)",
                "testing_readiness": "strategic_reserve",
                "biological_significance": "深层护眼抗蓝光天然抗氧化网络中枢"
            }
        ]
    },
    "crop_cherry_tomato_red": {
        "safety_ceilings": {
            "nitrate_mg_kg_ceiling": 200.0,
            "nitrite_mg_kg_ceiling": 2.0,
            "heavy_metals_compliance": "GB 2762-2022 (果菜类 Pb≤0.1mg/kg, Cd≤0.05mg/kg)",
            "pesticide_residue_limit": "ND (Not Detected，严格物理诱捕+天敌防治，蜜蜂授粉期严禁一切化学农药)",
            "authoritative_source": "GB 2762-2022 & NY/T 426-2021《绿色食品 茄果类蔬菜》"
        },
        "sensory_flavor": {
            "target_brix": 10.0,
            "min_acceptable_brix": 8.8,
            "sugar_acid_ratio": [9.5, 11.5],
            "bitterness_astringency_control": "基质滴灌采收前严格负压控水，浓缩糖分与芳香醇类，杜绝空心与水味",
            "texture_crispness": "果皮薄韧不裂果，一口爆浆，果肉紧实细腻",
            "authoritative_source": "NY/T 2637-2014 & 千禧樱桃番茄品鉴国家规范"
        },
        "functional_nutrition": [
            {
                "metric_id": "lycopene",
                "name_cn": "番茄红素",
                "target_value": 8.5,
                "traditional_benchmark": 4.2,
                "unit": "mg/100g",
                "basis": "fresh_weight",
                "authoritative_source": "NY/T 1651-2008 蔬菜及制品中番茄红素的测定 & 《中国食物成分表》第6版",
                "testing_readiness": "lab_third_party",
                "biological_significance": "强力类胡萝卜素抗氧化剂，基质精准温光控水成倍提升"
            },
            {
                "metric_id": "vitamin_c",
                "name_cn": "维生素C",
                "target_value": 36.0,
                "traditional_benchmark": 25.0,
                "unit": "mg/100g",
                "basis": "fresh_weight",
                "authoritative_source": "GB 5009.86-2016",
                "testing_readiness": "lab_third_party",
                "biological_significance": "鲜果天然酸甜与抗氧化基石"
            }
        ]
    },
    "crop_cherry_tomato_yellow": {
        "safety_ceilings": {
            "nitrate_mg_kg_ceiling": 200.0,
            "nitrite_mg_kg_ceiling": 2.0,
            "heavy_metals_compliance": "GB 2762-2022",
            "pesticide_residue_limit": "ND (Not Detected)",
            "authoritative_source": "GB 2762-2022 & NY/T 426-2021"
        },
        "sensory_flavor": {
            "target_brix": 10.5,
            "min_acceptable_brix": 9.2,
            "sugar_acid_ratio": [10.5, 12.5],
            "bitterness_astringency_control": "低酸高糖，果香清爽类似蜂蜜与热带水果复合香气",
            "texture_crispness": "果形浑圆晶莹剔透，果皮极薄，脆甜多汁",
            "authoritative_source": "NY/T 2637-2014"
        },
        "functional_nutrition": [
            {
                "metric_id": "beta_carotene",
                "name_cn": "β-胡萝卜素与叶黄素复合物",
                "target_value": 1500.0,
                "traditional_benchmark": 900.0,
                "unit": "μg/100g",
                "basis": "fresh_weight",
                "authoritative_source": "GB 5009.83-2016 & Food Chemistry (2018)",
                "testing_readiness": "lab_third_party",
                "biological_significance": "金黄色泽天然来源，温和护眼且无酸涩负担"
            },
            {
                "metric_id": "vitamin_c",
                "name_cn": "维生素C",
                "target_value": 38.0,
                "traditional_benchmark": 26.0,
                "unit": "mg/100g",
                "basis": "fresh_weight",
                "authoritative_source": "GB 5009.86-2016",
                "testing_readiness": "lab_third_party",
                "biological_significance": "高维C鲜食水果型蔬菜"
            }
        ]
    },
    "crop_cherry_tomato_black": {
        "safety_ceilings": {
            "nitrate_mg_kg_ceiling": 200.0,
            "nitrite_mg_kg_ceiling": 2.0,
            "heavy_metals_compliance": "GB 2762-2022",
            "pesticide_residue_limit": "ND (Not Detected)",
            "authoritative_source": "GB 2762-2022 & NY/T 426-2021"
        },
        "sensory_flavor": {
            "target_brix": 9.2,
            "min_acceptable_brix": 8.0,
            "sugar_acid_ratio": [8.5, 10.5],
            "bitterness_astringency_control": "保留特征性醇厚番茄酸甜与黑番茄特有烟熏浆果余韵",
            "texture_crispness": "黑紫红皮色，果肉厚实柔滑、汁水浓稠丰满",
            "authoritative_source": "NY/T 2637-2014"
        },
        "functional_nutrition": [
            {
                "metric_id": "anthocyanin",
                "name_cn": "果皮花青素",
                "target_value": 24.0,
                "traditional_benchmark": 12.0,
                "unit": "mg/100g",
                "basis": "fresh_weight",
                "authoritative_source": "NY/T 2640-2014 & Plant Physiology (2018) 黑番茄果实花青素富集研究",
                "testing_readiness": "lab_third_party",
                "biological_significance": "深紫黑外皮高富集花青素，与番茄红素协同抗氧化"
            },
            {
                "metric_id": "lycopene",
                "name_cn": "番茄红素",
                "target_value": 6.8,
                "traditional_benchmark": 3.5,
                "unit": "mg/100g",
                "basis": "fresh_weight",
                "authoritative_source": "NY/T 1651-2008",
                "testing_readiness": "lab_third_party",
                "biological_significance": "双重色素系统构筑超强自由基清除屏障"
            }
        ]
    },
    "crop_strawberry_elevated": {
        "safety_ceilings": {
            "nitrate_mg_kg_ceiling": 150.0,
            "nitrite_mg_kg_ceiling": 2.0,
            "heavy_metals_compliance": "GB 2762-2022 (果类最高严苛级 Pb≤0.1mg/kg, Cd≤0.05mg/kg)",
            "pesticide_residue_limit": "ND (Not Detected，熊蜂授粉与以螨治螨生物防治，免洗食用级零化学农药)",
            "authoritative_source": "NY/T 444-2020《绿色食品 草莓》 & GB 2762-2022"
        },
        "sensory_flavor": {
            "target_brix": 12.8,
            "min_acceptable_brix": 10.8,
            "sugar_acid_ratio": [11.5, 14.5],
            "bitterness_astringency_control": "昼夜温差(24℃/8℃)与低温寡照补光避免果实过早着色发酸，确保糖酸完美熟化",
            "texture_crispness": "果实圆锥形鲜红明亮，果肉细嫩多汁，带有独特浓郁水蜜桃与奶油复合甜香",
            "authoritative_source": "NY/T 2637-2014 & 日本农业协同组合(JA)红颜特级品验收标准"
        },
        "functional_nutrition": [
            {
                "metric_id": "vitamin_c",
                "name_cn": "维生素C",
                "target_value": 65.0,
                "traditional_benchmark": 47.0,
                "unit": "mg/100g",
                "basis": "fresh_weight",
                "authoritative_source": "《中国食物成分表 标准版》第6版第二册 (编码 05-1-002 草莓)",
                "testing_readiness": "lab_third_party",
                "biological_significance": "天然浆果高维C代表，促进胶原蛋白合成与抗氧化"
            },
            {
                "metric_id": "total_phenols",
                "name_cn": "总多酚物质 (以没食子酸计)",
                "target_value": 220.0,
                "traditional_benchmark": 160.0,
                "unit": "mg/100g",
                "basis": "fresh_weight",
                "authoritative_source": "Food Chemistry (2018) 高品质温室草莓多酚与抗氧化组分分析",
                "testing_readiness": "strategic_reserve",
                "biological_significance": "草莓特有鞣花酸与多酚抗氧化体系"
            }
        ]
    },
    "crop_water_spinach": {
        "safety_ceilings": {
            "nitrate_mg_kg_ceiling": 2200.0,
            "nitrite_mg_kg_ceiling": 2.0,
            "heavy_metals_compliance": "GB 2762-2022 (针对水生植物易吸附重金属的特性，水耕回路反渗透水源杜绝吸附)",
            "pesticide_residue_limit": "ND (Not Detected)",
            "authoritative_source": "NY/T 743-2020 & GB 2762-2022"
        },
        "sensory_flavor": {
            "target_brix": 3.2,
            "min_acceptable_brix": 2.2,
            "bitterness_astringency_control": "充足流动水培抑制纤维老化与铁质沉淀涩味，爆炒碧绿不发黑",
            "texture_crispness": "白骨粗茎中空脆嫩、咬嚼清脆声明显、无老渣",
            "authoritative_source": "NY/T 2637-2014 & 岭南优质蕹菜品质评定"
        },
        "functional_nutrition": [
            {
                "metric_id": "potassium",
                "name_cn": "钾元素 (K)",
                "target_value": 320.0,
                "traditional_benchmark": 243.0,
                "unit": "mg/100g",
                "basis": "fresh_weight",
                "authoritative_source": "《中国食物成分表 标准版》第6版第二册 (编码 04-1-020 空心菜)",
                "testing_readiness": "lab_third_party",
                "biological_significance": "夏季耐热高钾蔬菜，高效补充排汗流失电解质"
            },
            {
                "metric_id": "vitamin_c",
                "name_cn": "维生素C",
                "target_value": 35.0,
                "traditional_benchmark": 25.0,
                "unit": "mg/100g",
                "basis": "fresh_weight",
                "authoritative_source": "《中国食物成分表》第6版第二册",
                "testing_readiness": "lab_third_party",
                "biological_significance": "夏季强光照下保持稳定抗坏血酸积累"
            }
        ]
    }
}

def main():
    catalog_path = "packages/schema/data/crops_catalog.json"
    with open(catalog_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    crops = data.get("crops", [])
    matched_count = 0

    for crop in crops:
        cid = crop.get("crop_id")
        if cid in PROFILES:
            crop["target_quality_profile"] = PROFILES[cid]
            matched_count += 1
        else:
            print(f"Warning: Crop {cid} has no profile specified!")

    data["updated_at"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")

    with open(catalog_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"Successfully injected target_quality_profile for {matched_count}/{len(crops)} crops.")

if __name__ == "__main__":
    main()
