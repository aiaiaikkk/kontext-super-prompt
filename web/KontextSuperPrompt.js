// Kontext Super Prompt Node - 完整复现Visual Prompt Editor功能
import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";

// 导入Visual Prompt Editor的模板和工具
const OPERATION_CATEGORIES = {
    local: {
        name: '🎯 局部编辑',
        description: 'Local object-specific editing operations',
        templates: [
            'add_object', 'change_color', 'change_style', 'replace_object', 'remove_object',
            'change_texture', 'change_pose', 'change_expression', 'change_clothing', 'change_background',
            'enhance_quality', 'blur_background', 'adjust_lighting', 'resize_object', 'enhance_skin_texture',
            'character_expression', 'character_hair', 'character_accessories'
        ]
    },
    global: {
        name: '🌍 全局编辑', 
        description: 'Whole image processing operations',
        templates: [
            'global_color_grade', 'global_style_transfer', 'global_brightness_contrast',
            'global_hue_saturation', 'global_sharpen_blur', 'global_noise_reduction',
            'global_enhance', 'global_filter', 'character_age', 'detail_enhance',
            'realism_enhance', 'camera_operation', 'global_perspective'
        ]
    },
    text: {
        name: '📝 文字编辑',
        description: 'Text editing and manipulation operations',
        templates: ['text_add', 'text_remove', 'text_edit', 'text_resize', 'object_combine']
    },
    professional: {
        name: '🔧 专业操作',
        description: 'Advanced professional editing tools', 
        templates: [
            'geometric_warp', 'perspective_transform', 'lens_distortion', 'content_aware_fill',
            'seamless_removal', 'smart_patch', 'style_blending', 'collage_integration',
            'texture_mixing', 'precision_cutout', 'alpha_composite', 'mask_feathering', 'depth_composite',
            'professional_product', 'zoom_focus', 'stylize_local', 'custom'
        ]
    }
};

const OPERATION_TEMPLATES = {
    // 局部编辑模板 - 14种专业类型
    'change_color': { template: 'transform {object} color to {target}', label: '颜色变换', category: 'local' },
    'change_style': { template: 'reimagine {object} in {target} aesthetic', label: '风格重构', category: 'local' },
    'replace_object': { template: 'thoughtfully replace {object} with {target}', label: '智能替换', category: 'local' },
    'add_object': { template: 'thoughtfully introduce {target} to complement {object}', label: '智能添加', category: 'local' },
    'remove_object': { template: 'seamlessly eliminate {object} while preserving scene integrity', label: '无缝移除', category: 'local' },
    'change_texture': { template: 'transform {object} surface to {target} texture', label: '纹理增强', category: 'local' },
    'change_pose': { template: 'guide {object} into {target} pose', label: '姿态调整', category: 'local' },
    'change_expression': { template: 'inspire {object} with {target} expression', label: '表情增强', category: 'local' },
    'change_clothing': { template: 'dress {object} in {target} attire', label: '服装造型', category: 'local' },
    'change_background': { template: 'change the background to {target}', label: '背景更改', category: 'local' },
    'enhance_quality': { template: 'enhance {object} quality', label: '质量增强', category: 'local' },
    'blur_background': { template: 'blur the background behind {object}', label: '背景虚化', category: 'local' },
    'adjust_lighting': { template: 'adjust lighting on {object}', label: '光照调整', category: 'local' },
    'resize_object': { template: 'make {object} {target} size', label: '大小调整', category: 'local' },
    'enhance_skin_texture': { template: 'enhance skin texture while {target}', label: '皮肤纹理增强', category: 'local' },
    'character_expression': { template: 'change character expression to {target}', label: '角色表情', category: 'local' },
    'character_hair': { template: 'change character hair to {target}', label: '角色发型', category: 'local' },
    'character_accessories': { template: 'add {target} accessories to character', label: '角色配饰', category: 'local' },
    
    // 全局编辑模板 - 12种专业类型
    'global_color_grade': { template: 'apply {target} color grading to entire image', label: '色彩分级', category: 'global' },
    'global_style_transfer': { template: 'turn entire image into {target} style', label: '风格转换', category: 'global' },
    'global_brightness_contrast': { template: 'adjust image brightness and contrast to {target}', label: '亮度对比度', category: 'global' },
    'global_hue_saturation': { template: 'change image hue and saturation to {target}', label: '色相饱和度', category: 'global' },
    'global_sharpen_blur': { template: 'apply {target} sharpening to entire image', label: '锐化模糊', category: 'global' },
    'global_noise_reduction': { template: 'reduce noise in entire image', label: '噪点消除', category: 'global' },
    'global_enhance': { template: 'enhance entire image quality', label: '全局增强', category: 'global' },
    'global_filter': { template: 'apply {target} filter to entire image', label: '滤镜效果', category: 'global' },
    'character_age': { template: 'make the person look {target}', label: '年龄调整', category: 'global' },
    'detail_enhance': { template: 'add more details to {object}', label: '细节增强', category: 'global' },
    'realism_enhance': { template: 'make {object} more realistic', label: '真实感增强', category: 'global' },
    'camera_operation': { template: 'zoom out and show {target}', label: '镜头操作', category: 'global' },
    'global_perspective': { template: 'adjust global perspective to {target}', label: '全局透视', category: 'global' },
    
    // 文字编辑模板 - 5种专业类型
    'text_add': { template: 'add text saying "{target}"', label: '添加文字', category: 'text' },
    'text_remove': { template: 'remove the text', label: '移除文字', category: 'text' },
    'text_edit': { template: 'change the text to "{target}"', label: '编辑文字', category: 'text' },
    'text_resize': { template: 'make the text {target} size', label: '文字大小', category: 'text' },
    'object_combine': { template: 'combine text with {target}', label: '对象合并', category: 'text' },
    
    // 专业操作模板 - 13种专业类型
    'geometric_warp': { template: 'apply {target} geometric transformation', label: '几何变形', category: 'professional' },
    'perspective_transform': { template: 'transform perspective to {target}', label: '透视变换', category: 'professional' },
    'lens_distortion': { template: 'correct lens distortion with {target}', label: '镜头畸变', category: 'professional' },
    'content_aware_fill': { template: 'fill selected area with {target}', label: '内容感知填充', category: 'professional' },
    'seamless_removal': { template: 'seamlessly remove {target}', label: '无缝移除', category: 'professional' },
    'smart_patch': { template: 'smart patch with {target}', label: '智能修补', category: 'professional' },
    'style_blending': { template: 'blend styles with {target}', label: '风格混合', category: 'professional' },
    'collage_integration': { template: 'integrate into collage with {target}', label: '拼贴集成', category: 'professional' },
    'texture_mixing': { template: 'mix textures with {target}', label: '纹理混合', category: 'professional' },
    'precision_cutout': { template: 'precise cutout of {target}', label: '精确抠图', category: 'professional' },
    'alpha_composite': { template: 'composite with alpha using {target}', label: '透明合成', category: 'professional' },
    'mask_feathering': { template: 'feather mask edges with {target}', label: '遮罩羽化', category: 'professional' },
    'depth_composite': { template: 'composite with depth using {target}', label: '深度合成', category: 'professional' },
    'professional_product': { template: 'create professional product presentation with {target}', label: '专业产品', category: 'professional' },
    'zoom_focus': { template: 'apply zoom focus effect with {target}', label: '缩放聚焦', category: 'professional' },
    'stylize_local': { template: 'apply local stylization with {target}', label: '局部风格化', category: 'professional' },
    'custom': { template: 'apply custom editing with {target}', label: '自定义', category: 'professional' }
};

// 约束性提示词模板
const CONSTRAINT_PROMPTS = {
    // === 🎨 外观转换约束 ===
    'change_color': [
        '保持原始材质纹理（织物编织、皮肤毛孔、表面粗糙度）',
        '保持重新着色表面的一致性光照反射和阴影',
        '避免颜色渗入相邻物体或区域',
        '保持相对于场景光照的相同饱和度和亮度水平'
    ],
    
    'replace_object': [
        '匹配原始物体的精确透视角度和观察方向',
        '复制场景中的光照方向、强度和色温',
        '缩放替换物以保持现实的比例关系',
        '集成与场景光照条件匹配的投射阴影'
    ],
    
    'change_style': [
        '保持物体的基本几何结构和比例',
        '在应用风格元素时保持可识别的关键特征',
        '确保风格变化不与周围的真实环境冲突',
        '保持边缘过渡平滑以避免刺眼的视觉断裂'
    ],

    'change_expression': [
        '保持双侧面部对称和自然的肌肉运动模式',
        '保持个人面部特征和骨骼结构特征',
        '确保表情变化遵循现实的面部解剖约束',
        '保持眼神接触方向和注视焦点与原始一致'
    ],
    
    'change_clothing': [
        '确保织物悬垂遵循现实物理和身体轮廓',
        '将服装风格与个人的年龄、体型和场合背景相匹配',
        '保持与肤色和周围环境的适当色彩和谐',
        '保持通过服装可见的原始身体比例'
    ],
    
    'change_texture': [
        '保持原始表面材质的物理光学属性（反射率、粗糙度、折射率）',
        '确保新纹理与原始几何形状和曲面完美贴合',
        '维持纹理映射的透视正确性和比例一致性',
        '避免纹理替换造成的光照不匹配或阴影异常'
    ],
    
    'change_pose': [
        '遵循人体解剖关节限制和自然的运动范围',
        '保持现实的重量分布和平衡点',
        '在姿势变化过程中保持肌肉张力一致性',
        '确保新姿势在环境背景中逻辑合理'
    ],

    'change_background': [
        '匹配大气透视深度线索（色温、对比度淡化）',
        '使光照方向和色温与新环境对齐',
        '保持主体和背景之间的边缘质量和自然互动',
        '保持前景和背景元素之间一致的比例关系'
    ],
    
    'add_object': [
        '根据场景中的距离和透视计算正确尺寸',
        '复制包括阴影和反射的现有光照条件',
        '确保添加的物体不违反物理空间占用',
        '匹配现有场景元素的视觉风格和质量水平'
    ],
    
    'remove_object': [
        '分析周围图案和纹理以进行连贯重建',
        '保持连续的透视线和消失点',
        '在填充区域保持光照梯度和阴影图案',
        '避免创造不可能的空间配置'
    ],

    'resize_object': [
        '在缩放过程中保持像素质量并避免插值伪影',
        '按比例调整阴影大小和投射角度到新比例',
        '在场景的空间层次中保持相对定位',
        '确保调整大小的物体不会创造不现实的比例关系'
    ],
    
    'adjust_lighting': [
        '尊重物体的表面材质属性（反射率、半透明性）',
        '保持与场景中其他光源一致的色温',
        '基于新的光照方向计算真实的阴影投射',
        '在调整整体光照时保持精细的表面细节'
    ],

    'global_color_grade': [
        '在所有人类主体中保持自然的肤色准确性',
        '在阴影和高光中保持重要细节的可见性',
        '保持色彩关系和谐并避免不现实的色彩偏移',
        '保持足够的对比度以获得视觉清晰度和深度感知'
    ],
    
    'global_style_transfer': [
        '保持基本构图元素和焦点层次结构',
        '为重要视觉信息保持足够的细节',
        '确保风格应用不会损害图像可读性',
        '保持艺术转换适合原始主题'
    ],
    
    'enhance_quality': [
        '避免产生不现实边缘光晕的过度锐化',
        '平衡降噪与精细纹理细节的保持',
        '保持自然的色彩饱和度水平而不过度增强',
        '保持原始摄影特征和真实性'
    ],

    'text_add': [
        '选择与图像美感和历史时期相匹配的排版',
        '通过适当的对比度确保文本在背景上的可读性',
        '定位文本以增强而不是遮挡重要视觉元素',
        '为图像分辨率和观看上下文适当缩放文本'
    ],
    
    'text_remove': [
        '分析底层纹理和图案以进行无缝重建',
        '在移除文本的地方保持一致的光照和阴影图案',
        '保留可能在文本后面的任何重要视觉信息',
        '避免创造明显的矩形补丁或不自然的纹理过渡'
    ],
    
    'text_edit': [
        '匹配原始文本的字体特征（样式、粗细、间距）',
        '保持相同的文本放置和对齐原则',
        '保持原始颜色关系和文本处理效果',
        '确保新文本长度适当适合可用空间'
    ],

    'content_aware_fill': [
        '分析多个周围区域以进行一致的图案采样',
        '保持自然的随机性以避免明显的重复图案',
        '保持光照梯度和方向性纹理流动',
        '确保填充的内容不会创造不可能的视觉矛盾'
    ],
    
    'perspective_transform': [
        '保持在校正视图中应该保持笔直的直线',
        '保持建筑元素之间的比例关系',
        '确保变换不会创造不可能的几何配置',
        '保持遵循光学物理学原理的现实观看角度'
    ],
    
    // 新增局部编辑约束性提示词
    'enhance_skin_texture': [
        '保持自然的皮肤毛孔和微纹理细节',
        '避免塑料或过度光滑的人工外观',
        '保持一致的肤色变化和瑕疵特征',
        '确保现实的次表面散射和半透明效果'
    ],
    
    'blur_background': [
        '在模糊背景时保持对主体的清晰聚焦',
        '基于焦距创建自然的景深渐进',
        '避免清晰和模糊区域之间不自然的生硬过渡',
        '通过模糊保持背景光照和色彩氛围'
    ],
    
    'character_expression': [
        '保持面部双侧对称和自然的肌肉运动模式',
        '保持个人面部特征和骨骼结构特征',
        '确保表情变化遵循真实的人体解剖学约束',
        '避免不自然的表情扭曲和非对称变形'
    ],
    
    'character_hair': [
        '保持头发的自然垂坠和重力物理效应',
        '确保发丝束的自然分离和聚集模式',
        '避免头发与头皮的不自然分离或悬浮',
        '维持头发纹理的连贯性和自然光泽反射'
    ],
    
    'character_accessories': [
        '确保配饰与人物比例和穿戴方式的真实性',
        '保持配饰在三维空间中的自然位置关系',
        '避免配饰与人物其他元素的视觉冲突',
        '确保配饰的材质和光照与环境一致'
    ],
    
    // === 🔍 全局增强约束 ===
    'detail_enhance': [
        '保持原始构图和主要元素不变',
        '在增强细节时避免过度锐化造成的不自然边缘',
        '保持纹理增强的真实性和材质物理属性',
        '确保细节层次分明，避免扁平化处理'
    ],
    
    'global_perspective': [
        '保持建筑结构和空间关系的合理性',
        '确保透视校正不会扭曲重要物体比例',
        '维持水平线和垂直线的自然对齐',
        '避免过度透视调整造成的视觉失真'
    ],
    
    'realism_enhance': [
        '增强细节时保持摄影真实感',
        '避免过度处理导致的人工痕迹',
        '保持光影关系的物理正确性',
        '确保材质纹理的自然表现'
    ],
    
    // === 🔧 专业操作约束 ===
    'geometric_warp': [
        '保持几何变换的视觉合理性',
        '确保变形不破坏空间逻辑关系',
        '维持关键结构元素的完整性',
        '避免产生不可能的空间配置'
    ],
    
    'perspective_transform': [
        '保持透视变换的几何正确性',
        '确保变换后的空间关系合理',
        '维持建筑线条的规律性对齐',
        '避免透视扭曲影响视觉平衡'
    ],
    
    'lens_distortion': [
        '精确校正镜头畸变保持直线性',
        '确保校正过程不损失图像边缘信息',
        '维持校正后的比例关系准确性',
        '避免过度校正导致的反向扭曲'
    ],
    
    'content_aware_fill': [
        '确保填充内容与周围环境无缝融合',
        '保持填充区域的光照一致性',
        '维持原始图像的纹理和质感',
        '避免产生重复图案或不自然拼接'
    ],
    
    'seamless_removal': [
        '确保移除后的区域自然重构',
        '保持移除操作的背景连续性',
        '维持原始透视和空间关系',
        '避免留下可见的编辑痕迹'
    ],
    
    'smart_patch': [
        '智能匹配周围区域的纹理特征',
        '保持修补区域的自然过渡',
        '维持原始图像的色调一致性',
        '确保修补效果无缝融入整体'
    ],
    
    // 通用约束
    'general': ['自然外观', '技术精度', '视觉连贯性', '质量控制']
};

// 修饰性提示词模板
const DECORATIVE_PROMPTS = {
    // 局部编辑修饰 (L01-L18)
    'change_color': [
        '应用色彩和谐原理（互补、类似或三角色彩方案）',
        '在保持自然外观的同时增强色彩活力',
        '创造带有微妙渐变效果的平滑色彩过渡',
        '优化色彩平衡以创造视觉兴趣和焦点强调'
    ],
    'change_style': [
        '运用精湛技巧应用复杂的艺术诠释',
        '创造增强艺术吸引力的视觉冲击风格适应',
        '保持风格化和可识别性之间的优雅平衡',
        '通过风格应用发展丰富的视觉纹理和深度'
    ],
    'replace_object': [
        '确保替换物增强整体构图平衡',
        '创造自然的视觉流动和眼睛在场景中的移动',
        '优化大小和位置以获得黄金比例关系',
        '增强场景的叙事连贯性和情感冲击力'
    ],
    'add_object': [
        '增强构图兴趣和视觉叙事丰富性',
        '创造自然的焦点层次和眼睛移动引导',
        '通过深思熟虑的物体选择发展情境叙事',
        '优化空间关系以获得最大视觉和谐'
    ],
    'remove_object': [
        '创造更清晰、更集中的构图强调',
        '增强视觉简洁性和优雅的极简主义',
        '优化空间流动和负空间关系',
        '发展改进的视觉层次和焦点清晰度'
    ],
    'change_texture': [
        '高分辨率材质细节渲染（织物编织、皮革纹理、木材年轮、金属划痕）',
        '物理基于渲染的材质光学属性（反射、折射、次表面散射）',
        '真实感表面微凹凸和法线映射效果',
        '专业级材质质感和触觉视觉体验'
    ],
    'change_pose': [
        '创造动态能量和优雅的运动流动',
        '增强肢体语言沟通和情感表达',
        '优化比例关系以获得最大视觉吸引力',
        '发展增强叙事冲击力的引人注目的姿态语言'
    ],
    'change_expression': [
        '创造真实的情感共鸣和人类连接',
        '通过细微改进增强自然面部吸引力',
        '发展传达引人注目个性的表现深度',
        '优化面部和谐与对称性以获得最大视觉吸引力'
    ],
    'change_clothing': [
        '应用时尚设计原则以实现风格精致',
        '增强身体轮廓和比例吸引力',
        '创造与肤色和环境相辅相成的色彩协调',
        '发展纹理丰富度和织物真实性以获得视觉奢华感'
    ],
    'change_background': [
        '创造大气深度和环境情绪增强',
        '通过环境设计发展丰富的情境叙事',
        '优化构图框架和负空间利用',
        '通过环境心理学原理增强情感共鸣'
    ],
    'enhance_quality': [
        '达到水晶般清晰的专业摄影标准',
        '增强精细细节定义以获得最大视觉清晰度',
        '发展丰富的纹理深度和触觉视觉质量',
        '优化动态范围以获得惊人的视觉冲击力'
    ],
    'blur_background': [
        '创造具有美学质量的复杂散景效果',
        '通过选择性焦点控制增强主体分离',
        '发展具有平滑衰减的自然深度渐进',
        '通过战略性散焦优化构图强调'
    ],
    'adjust_lighting': [
        '创造戏剧性的明暗对比效果以获得情感深度',
        '增强三维形态建模和雕塑品质',
        '通过精密的光照设计发展大气情绪',
        '优化高光和阴影关系以获得最大视觉冲击力'
    ],
    'resize_object': [
        '优化比例关系以获得黄金比例和谐',
        '增强视觉重量分布和构图平衡',
        '通过战略性尺寸创造改进的焦点强调',
        '发展更好的空间节奏和视觉流动模式'
    ],
    'enhance_skin_texture': [
        '实现具有真实微纹理的自然皮肤外观',
        '在保持个体特征的同时增强皮肤质量',
        '发展现实的次表面散射和半透明效果',
        '优化肤色和谐和自然美'
    ],
    'character_expression': [
        '创造具有人际连接的真实情感共鸣',
        '在保持个体身份的同时增强面部表现力',
        '发展传达叙事深度的微妙情感细节',
        '优化面部和谐以实现最大视觉吸引力'
    ],
    'character_hair': [
        '实现自然流动且符合重力的头发动态',
        '在保持个人风格的同时增强头发质量',
        '发展适合角色身份的头发风格表现',
        '优化头发外观以实现专业造型效果'
    ],
    'character_accessories': [
        '创造与整体风格完美协调的配饰设计',
        '确保配饰的尺寸和佩戴方式完全贴合',
        '实现配饰与人物形象的自然融合',
        '发展具有时尚前瞻性的配饰美学'
    ],
    
    // 全局编辑修饰 (G01-G12)
    'global_color_grade': [
        '创造具有专业电影级品质的电影色彩调色板',
        '发展丰富的色调深度和复杂的色彩关系',
        '通过色彩心理学原理增强情感冲击力',
        '通过战略性色彩强调优化视觉层次'
    ],
    'global_style_transfer': [
        '创造具有复杂美学愿景的艺术杰作品质',
        '通过创意风格诠释发展独特的视觉身份',
        '通过风格应用增强文化和艺术意义',
        '在保持构图卓越的同时优化创意表达'
    ],
    'global_brightness_contrast': [
        '完美的曝光平衡',
        '戏剧性对比',
        '增强的动态范围',
        '专业质量'
    ],
    'global_hue_saturation': [
        '充满活力但仍自然的颜色',
        '和谐的调色板',
        '丰富的饱和度',
        '色彩准确的结果'
    ],
    'global_sharpen_blur': [
        '水晶般清晰的锐度',
        '艺术性模糊效果',
        '增强的清晰度',
        '专业处理'
    ],
    'global_noise_reduction': [
        '干净平滑的结果',
        '无伪影的图像',
        '原始质量',
        '专业清理'
    ],
    'global_enhance': [
        '惊人的视觉冲击力',
        '增强的美感',
        '杰作品质',
        '专业精修'
    ],
    'global_filter': [
        '艺术滤镜效果',
        '风格增强',
        '创意转换',
        '视觉吸引力'
    ],
    'character_age': [
        '年龄适当的外观',
        '自然衰老过程',
        '永恒之美',
        '真实的性格'
    ],
    'detail_enhance': [
        '微观纹理细节增强（皮肤毛孔、织物纹理、木材纹理）',
        '边缘锐度优化保持自然柔和过渡',
        '层次化细节渲染（前景、中景、背景）',
        '专业级细节平衡避免过度处理'
    ],
    'global_perspective': [
        '完美的透视对齐',
        '自然视点校正',
        '专业透视控制',
        '准确的空间关系'
    ],
    'geometric_warp': [
        '精确的几何变换',
        '自然的扭曲流动',
        '专业变形控制',
        '无缝形状操作'
    ],
    'realism_enhance': [
        '照片级真实感渲染',
        '自然光影物理模拟',
        '材质真实性增强',
        '专业摄影品质'
    ],
    'perspective_transform': [
        '精密透视几何校正',
        '建筑线条完美对齐',
        '空间深度层次优化',
        '专业透视重构'
    ],
    'lens_distortion': [
        '精确镜头畸变校正',
        '光学失真完美修复',
        '边缘直线性恢复',
        '专业镜头校准效果'
    ],
    'content_aware_fill': [
        '智能内容无缝生成',
        '周围环境完美匹配',
        '自然纹理延续',
        '专业级内容填充'
    ],
    'seamless_removal': [
        '无痕迹对象移除',
        '背景智能重构',
        '自然空间填补',
        '专业级清理效果'
    ],
    'camera_operation': [
        '专业构图',
        '电影级构图',
        '完美透视',
        '艺术视角'
    ],
    'relight_scene': [
        '自然光照',
        '大气照明',
        '戏剧性光影效果',
        '专业照明'
    ],
    'colorize_image': [
        '充满活力但仍自然的颜色',
        '真实的色彩再现',
        '和谐的色彩调色板',
        '专业着色'
    ],
    'teleport_context': [
        '无缝上下文集成',
        '自然环境融合',
        '完美的场景和谐',
        '专业合成'
    ],
    
    // 文本编辑修饰 (T01-T05)
    'text_add': [
        '应用专业排版设计原则以获得最大可读性',
        '创造优雅的文本集成以增强整体构图',
        '通过字体大小和粗细关系发展适当的视觉层次',
        '优化色彩对比和空间关系以获得视觉和谐'
    ],
    'text_remove': [
        '创造没有文本中断的无缝视觉流动',
        '增强构图纯度和视觉优雅',
        '优化空间关系和负空间利用',
        '在核心视觉元素上发展更清洁的美学焦点'
    ],
    'text_edit': [
        '增强文本沟通清晰度和视觉冲击力',
        '创造改进的排版复杂性和专业外观',
        '在保持美学集成的同时优化文本可读性',
        '发展一致的视觉品牌和风格连贯性'
    ],
    'text_resize': [
        '完美的文本比例',
        '最佳文本大小',
        '平衡的文本布局',
        '专业文本缩放'
    ],
    'object_combine': [
        '无缝物体集成',
        '完美的视觉和谐',
        '自然的物体关系',
        '专业构图'
    ],
    
    // 专业操作修饰 (P01-P14)
    'geometric_warp': [
        '精确的几何变换',
        '自然的扭曲流动',
        '专业变形',
        '无缝形状操作'
    ],
    'perspective_transform': [
        '创造建筑优雅和几何精度',
        '增强空间清晰度和尺寸准确性',
        '发展专业建筑摄影质量',
        '优化观看角度以获得最大视觉冲击力和清晰度'
    ],
    'lens_distortion': [
        '真实镜头模拟',
        '自然光学效果',
        '专业扭曲',
        '真实的镜头特征'
    ],
    'global_perspective': [
        '完美的透视对齐',
        '自然视点校正',
        '专业透视控制',
        '准确的空间关系'
    ],
    'content_aware_fill': [
        '创造无形、无缝的重建和自然的有机流动',
        '增强整体构图完整性和视觉连贯性',
        '发展丰富的纹理真实性和表面质量',
        '优化空间关系以改善视觉和谐'
    ],
    'seamless_removal': [
        '无形物体移除',
        '完美的背景重建',
        '智能区域填充',
        '专业物体移除'
    ],
    'smart_patch': [
        '智能补丁合成',
        '无缝纹理混合',
        '智能图案匹配',
        '专业区域修复'
    ],
    'style_blending': [
        '和谐的风格混合',
        '完美的艺术融合',
        '自然的风格过渡',
        '专业风格集成'
    ],
    'collage_integration': [
        '无缝拼贴组装',
        '完美的艺术构图',
        '自然元素和谐',
        '专业拼贴创作'
    ],
    'texture_mixing': [
        '真实的纹理混合',
        '完美的材料集成',
        '自然的表面互动',
        '专业纹理合成'
    ],
    'precision_cutout': [
        '像素级精确提取',
        '完美的边缘定义',
        '自然的边界创建',
        '专业物体隔离'
    ],
    'alpha_composite': [
        '完美的透明度处理',
        '自然图层混合',
        '专业Alpha合成',
        '无缝透明效果'
    ],
    'mask_feathering': [
        '柔和边缘过渡',
        '自然的边界混合',
        '完美的羽化控制',
        '专业边缘精修'
    ],
    'depth_composite': [
        '准确的深度感知',
        '自然的空间关系',
        '完美的深度集成',
        '专业3D合成'
    ],
    'professional_product': [
        '目录品质展示',
        '完美的产品展示',
        '专业商业质量',
        '零售标准结果'
    ],
    
    // 额外操作类型修饰
    'zoom_focus': [
        '戏剧性焦点增强',
        '电影级深度',
        '专业缩放质量',
        '艺术放大'
    ],
    'stylize_local': [
        '艺术风格增强',
        '创意转换',
        '独特的艺术风格',
        '风格化完美'
    ],
    'custom': [
        '个性化增强',
        '创意自由',
        '独特的艺术视野',
        '定制完美'
    ],
    
    // 新增局部编辑修饰性提示词
    'blur_background': [
        '创造具有美学质量的复杂散景效果',
        '通过选择性焦点控制增强主体分离',
        '发展具有平滑衰减的自然深度渐进',
        '通过战略性散焦优化构图强调'
    ],
    
    'character_expression': [
        '创造具有人际连接的真实情感共鸣',
        '在保持个体身份的同时增强面部表现力',
        '发展传达叙事深度的微妙情感细节',
        '优化面部和谐以实现最大视觉吸引力'
    ],
    
    'character_hair': [
        '实现自然流动且符合重力的头发动态',
        '在保持个人风格的同时增强头发质量',
        '发展适合角色身份的头发风格表现',
        '优化头发外观以实现专业造型效果'
    ],
    
    'character_accessories': [
        '创造与整体风格完美协调的配饰设计',
        '确保配饰的尺寸和佩戴方式完全贴合',
        '实现配饰与人物形象的自然融合',
        '发展具有时尚前瞻性的配饰美学'
    ],
    
    // 通用修饰
    'general': [
        '增强质量',
        '改善视觉冲击力', 
        '专业完成',
        '艺术卓越',
        '杰作级精修',
        '惊人的视觉吸引力',
        '最佳清晰度',
        '完美执行'
    ]
};

// 中英文提示词映射表
const PROMPT_TRANSLATION_MAP = {
    // 约束性提示词映射
    '保持原始材质纹理（织物编织、皮肤毛孔、表面粗糙度）': 'preserve original material textures (fabric weave, skin pores, surface roughness)',
    '保持重新着色表面的一致性光照反射和阴影': 'maintain consistent lighting reflections and shadows on the recolored surface',
    '避免颜色渗入相邻物体或区域': 'avoid color bleeding into adjacent objects or areas',
    '保持相对于场景光照的相同饱和度和亮度水平': 'keep the same level of saturation and brightness relative to scene lighting',
    '匹配原始物体的精确透视角度和观察方向': 'match the exact perspective angle and viewing direction of the original object',
    '复制场景中的光照方向、强度和色温': 'replicate the lighting direction, intensity, and color temperature from the scene',
    '缩放替换物以保持现实的比例关系': 'scale the replacement to maintain realistic proportional relationships',
    '集成与场景光照条件匹配的投射阴影': 'integrate cast shadows that match the scene\'s lighting conditions',
    '保持物体的基本几何结构和比例': 'preserve the object\'s fundamental geometric structure and proportions',
    '在应用风格元素时保持可识别的关键特征': 'maintain recognizable key features while applying stylistic elements',
    '确保风格变化不与周围的真实环境冲突': 'ensure the style change doesn\'t conflict with the surrounding realistic environment',
    '保持边缘过渡平滑以避免刺眼的视觉断裂': 'keep edge transitions smooth to avoid jarring visual breaks',
    '自然外观': 'natural appearance',
    '技术精度': 'technical precision',
    '视觉连贯性': 'visual coherence',
    '质量控制': 'quality control',
    
    // 全局增强约束翻译
    '保持原始构图和主要元素不变': 'preserve original composition and main elements unchanged',
    '在增强细节时避免过度锐化造成的不自然边缘': 'avoid unnatural edges from over-sharpening during detail enhancement',
    '保持纹理增强的真实性和材质物理属性': 'maintain texture enhancement authenticity and material physical properties',
    '确保细节层次分明，避免扁平化处理': 'ensure distinct detail hierarchy, avoid flattening treatment',
    '保持建筑结构和空间关系的合理性': 'maintain architectural structure and spatial relationship rationality',
    '确保透视校正不会扭曲重要物体比例': 'ensure perspective correction doesn\'t distort important object proportions',
    '维持水平线和垂直线的自然对齐': 'maintain natural alignment of horizontal and vertical lines',
    '避免过度透视调整造成的视觉失真': 'avoid visual distortion from excessive perspective adjustments',
    '增强细节时保持摄影真实感': 'maintain photographic authenticity during detail enhancement',
    '避免过度处理导致的人工痕迹': 'avoid artificial traces from over-processing',
    '保持光影关系的物理正确性': 'maintain physical correctness of light-shadow relationships',
    '确保材质纹理的自然表现': 'ensure natural representation of material textures',
    
    // 专业操作约束翻译
    '保持几何变换的视觉合理性': 'maintain visual rationality of geometric transformations',
    '确保变形不破坏空间逻辑关系': 'ensure deformation doesn\'t break spatial logical relationships',
    '维持关键结构元素的完整性': 'maintain integrity of key structural elements',
    '避免产生不可能的空间配置': 'avoid creating impossible spatial configurations',
    '保持透视变换的几何正确性': 'maintain geometric correctness of perspective transformation',
    '确保变换后的空间关系合理': 'ensure reasonable spatial relationships after transformation',
    '维持建筑线条的规律性对齐': 'maintain regular alignment of architectural lines',
    '避免透视扭曲影响视觉平衡': 'avoid perspective distortion affecting visual balance',
    '精确校正镜头畸变保持直线性': 'precisely correct lens distortion maintaining linearity',
    '确保校正过程不损失图像边缘信息': 'ensure correction process doesn\'t lose image edge information',
    '维持校正后的比例关系准确性': 'maintain accuracy of proportional relationships after correction',
    '避免过度校正导致的反向扭曲': 'avoid reverse distortion from over-correction',
    '确保填充内容与周围环境无缝融合': 'ensure filled content seamlessly blends with surrounding environment',
    '保持填充区域的光照一致性': 'maintain lighting consistency in filled areas',
    '维持原始图像的纹理和质感': 'preserve original image texture and tactile quality',
    '避免产生重复图案或不自然拼接': 'avoid creating repetitive patterns or unnatural stitching',
    '确保移除后的区域自然重构': 'ensure removed areas are naturally reconstructed',
    '保持移除操作的背景连续性': 'maintain background continuity during removal operations',
    '维持原始透视和空间关系': 'preserve original perspective and spatial relationships',
    '避免留下可见的编辑痕迹': 'avoid leaving visible editing traces',
    '智能匹配周围区域的纹理特征': 'intelligently match texture characteristics of surrounding areas',
    '保持修补区域的自然过渡': 'maintain natural transitions in patched areas',
    '维持原始图像的色调一致性': 'preserve tonal consistency of original image',
    '确保修补效果无缝融入整体': 'ensure patching effects blend seamlessly into the whole',
    '保持原始表面材质的物理光学属性（反射率、粗糙度、折射率）': 'maintain original surface material physical-optical properties (reflectivity, roughness, refraction)',
    '确保新纹理与原始几何形状和曲面完美贴合': 'ensure new texture perfectly conforms to original geometric shapes and surfaces',
    '维持纹理映射的透视正确性和比例一致性': 'maintain perspective correctness and proportional consistency in texture mapping',
    '避免纹理替换造成的光照不匹配或阴影异常': 'avoid lighting mismatches or shadow anomalies from texture replacement',
    
    // 修饰性提示词映射
    '应用色彩和谐原理（互补、类似或三角色彩方案）': 'apply color harmony principles (complementary, analogous, or triadic schemes)',
    '在保持自然外观的同时增强色彩活力': 'enhance color vibrancy while maintaining natural appearance',
    '创造带有微妙渐变效果的平滑色彩过渡': 'create smooth color transitions with subtle gradient effects',
    '优化色彩平衡以创造视觉兴趣和焦点强调': 'optimize color balance to create visual interest and focal emphasis',
    '增强质量': 'enhanced quality',
    '改善视觉冲击力': 'improved visual impact',
    '专业完成': 'professional finish',
    '艺术卓越': 'artistic excellence',
    '杰作级精修': 'masterpiece-level refinement',
    '惊人的视觉吸引力': 'stunning visual appeal',
    '最佳清晰度': 'optimal clarity',
    '完美执行': 'perfect execution',
    
    // 添加更多映射...
    '保持双侧面部对称和自然的肌肉运动模式': 'maintain bilateral facial symmetry and natural muscle movement patterns',
    '保持个人面部特征和骨骼结构特征': 'preserve individual facial features and bone structure characteristics',
    '确保表情变化遵循现实的面部解剖约束': 'ensure expression changes follow realistic facial anatomy constraints',
    '保持眼神接触方向和注视焦点与原始一致': 'keep eye contact direction and gaze focus consistent with the original',
    '确保织物悬垂遵循现实物理和身体轮廓': 'ensure fabric draping follows realistic physics and body contours',
    '将服装风格与个人的年龄、体型和场合背景相匹配': 'match clothing style to the person\'s age, body type, and occasion context',
    '保持与肤色和周围环境的适当色彩和谐': 'maintain proper color harmony with skin tone and surrounding environment',
    '保持通过服装可见的原始身体比例': 'preserve original body proportions visible through clothing fit',
    '遵循人体解剖关节限制和自然的运动范围': 'follow human anatomical joint limitations and natural range of motion',
    '保持现实的重量分布和平衡点': 'maintain realistic weight distribution and balance points',
    '在姿势变化过程中保持肌肉张力一致性': 'preserve muscle tension consistency throughout the pose change',
    '确保新姿势在环境背景中逻辑合理': 'ensure the new pose fits logically within the environmental context',
    '匹配大气透视深度线索（色温、对比度淡化）': 'match atmospheric perspective depth cues (color temperature, contrast fading)',
    '使光照方向和色温与新环境对齐': 'align lighting direction and color temperature with the new environment',
    '保持主体和背景之间的边缘质量和自然互动': 'preserve edge quality and natural interaction between subject and background',
    '保持前景和背景元素之间一致的比例关系': 'maintain consistent scale relationships between foreground and background elements',
    '根据场景中的距离和透视计算正确尺寸': 'calculate correct size based on distance and perspective in the scene',
    '复制包括阴影和反射的现有光照条件': 'replicate existing lighting conditions including shadows and reflections',
    '确保添加的物体不违反物理空间占用': 'ensure the added object doesn\'t violate physical space occupancy',
    '匹配现有场景元素的视觉风格和质量水平': 'match the visual style and quality level of existing scene elements',
    '分析周围图案和纹理以进行连贯重建': 'analyze surrounding patterns and textures for coherent reconstruction',
    '保持连续的透视线和消失点': 'maintain continuous perspective lines and vanishing points',
    '在填充区域保持光照梯度和阴影图案': 'preserve lighting gradients and shadow patterns in the filled area',
    '避免创造不可能的空间配置': 'avoid creating impossible spatial configurations',
    '在缩放过程中保持像素质量并避免插值伪影': 'maintain pixel quality and avoid interpolation artifacts during scaling',
    '按比例调整阴影大小和投射角度到新比例': 'adjust shadow size and casting angle proportionally to the new scale',
    '在场景的空间层次中保持相对定位': 'preserve relative positioning within the scene\'s spatial hierarchy',
    '确保调整大小的物体不会创造不现实的比例关系': 'ensure the resized object doesn\'t create unrealistic proportional relationships',
    '尊重物体的表面材质属性（反射率、半透明性）': 'respect the object\'s surface material properties (reflectivity, translucency)',
    '保持与场景中其他光源一致的色温': 'maintain consistent color temperature with other light sources in the scene',
    '基于新的光照方向计算真实的阴影投射': 'calculate realistic shadow casting based on the new lighting direction',
    '在调整整体光照时保持精细的表面细节': 'preserve fine surface details while adjusting overall illumination',
    '在所有人类主体中保持自然的肤色准确性': 'maintain natural skin tone accuracy across all human subjects',
    '在阴影和高光中保持重要细节的可见性': 'preserve important detail visibility in shadows and highlights',
    '保持色彩关系和谐并避免不现实的色彩偏移': 'keep color relationships harmonious and avoid unrealistic color casts',
    '保持足够的对比度以获得视觉清晰度和深度感知': 'maintain adequate contrast for visual clarity and depth perception',
    '保持基本构图元素和焦点层次结构': 'preserve essential compositional elements and focal point hierarchy',
    '为重要视觉信息保持足够的细节': 'maintain sufficient detail for important visual information',
    '确保风格应用不会损害图像可读性': 'ensure style application doesn\'t compromise image readability',
    '保持艺术转换适合原始主题': 'keep the artistic transformation appropriate to the original subject matter',
    '避免产生不现实边缘光晕的过度锐化': 'avoid over-sharpening that creates unrealistic edge halos',
    '平衡降噪与精细纹理细节的保持': 'balance noise reduction with preservation of fine texture details',
    '保持自然的色彩饱和度水平而不过度增强': 'maintain natural color saturation levels without over-enhancement',
    '保持原始摄影特征和真实性': 'preserve the original photographic character and authenticity',
    '选择与图像美感和历史时期相匹配的排版': 'choose typography that matches the image\'s aesthetic and historical period',
    '通过适当的对比度确保文本在背景上的可读性': 'ensure text readability against the background through appropriate contrast',
    '定位文本以增强而不是遮挡重要视觉元素': 'position text to enhance rather than obstruct important visual elements',
    '为图像分辨率和观看上下文适当缩放文本': 'scale text appropriately for the image resolution and viewing context',
    '分析底层纹理和图案以进行无缝重建': 'analyze underlying textures and patterns for seamless reconstruction',
    '在移除文本的地方保持一致的光照和阴影图案': 'maintain consistent lighting and shadow patterns where text was removed',
    '保留可能在文本后面的任何重要视觉信息': 'preserve any important visual information that might be behind the text',
    '避免创造明显的矩形补丁或不自然的纹理过渡': 'avoid creating obvious rectangular patches or unnatural texture transitions',
    '匹配原始文本的字体特征（样式、粗细、间距）': 'match the original text\'s font characteristics (style, weight, spacing)',
    '保持相同的文本放置和对齐原则': 'maintain the same text placement and alignment principles',
    '保持原始颜色关系和文本处理效果': 'preserve original color relationships and text treatment effects',
    '确保新文本长度适当适合可用空间': 'ensure new text length fits appropriately within the available space',
    '分析多个周围区域以进行一致的图案采样': 'analyze multiple surrounding areas for consistent pattern sampling',
    '保持自然的随机性以避免明显的重复图案': 'maintain natural randomness to avoid obvious repetitive patterns',
    '保持光照梯度和方向性纹理流动': 'preserve lighting gradients and directional texture flows',
    '确保填充的内容不会创造不可能的视觉矛盾': 'ensure filled content doesn\'t create impossible visual contradictions',
    '保持在校正视图中应该保持笔直的直线': 'maintain straight lines that should remain straight in the corrected view',
    '保持建筑元素之间的比例关系': 'preserve proportional relationships between architectural elements',
    '确保变换不会创造不可能的几何配置': 'ensure the transformation doesn\'t create impossible geometric configurations',
    '保持遵循光学物理学原理的现实观看角度': 'maintain realistic viewing angles that follow optical physics principles',
    
    // 修饰性提示词映射
    '运用精湛技巧应用复杂的艺术诠释': 'apply sophisticated artistic interpretation with masterful technique',
    '创造增强艺术吸引力的视觉冲击风格适应': 'create visually striking style adaptation that enhances artistic appeal',
    '保持风格化和可识别性之间的优雅平衡': 'maintain elegant balance between stylization and recognizability',
    '通过风格应用发展丰富的视觉纹理和深度': 'develop rich visual texture and depth through style application',
    '确保替换物增强整体构图平衡': 'ensure the replacement enhances the overall compositional balance',
    '创造自然的视觉流动和眼睛在场景中的移动': 'create natural visual flow and eye movement through the scene',
    '优化大小和位置以获得黄金比例关系': 'optimize size and placement for golden ratio proportional relationships',
    '增强场景的叙事连贯性和情感冲击力': 'enhance narrative coherence and emotional impact of the scene',
    '增强构图兴趣和视觉叙事丰富性': 'enhance compositional interest and visual narrative richness',
    '创造自然的焦点层次和眼睛移动引导': 'create natural focal point hierarchy and eye movement guidance',
    '通过深思熟虑的物体选择发展情境叙事': 'develop contextual storytelling through thoughtful object selection',
    '优化空间关系以获得最大视觉和谐': 'optimize spatial relationships for maximum visual harmony',
    '创造更清晰、更集中的构图强调': 'create cleaner, more focused compositional emphasis',
    '增强视觉简洁性和优雅的极简主义': 'enhance visual simplicity and elegant minimalism',
    '优化空间流动和负空间关系': 'optimize spatial flow and negative space relationships',
    '发展改进的视觉层次和焦点清晰度': 'develop improved visual hierarchy and focal point clarity',
    '真实的材质属性': 'realistic material properties',
    '精细的表面质量': 'detailed surface quality',
    '触觉真实感': 'tactile authenticity',
    '专业纹理处理': 'professional texturing',
    '创造动态能量和优雅的运动流动': 'create dynamic energy and graceful movement flow',
    '增强肢体语言沟通和情感表达': 'enhance body language communication and emotional expression',
    '优化比例关系以获得最大视觉吸引力': 'optimize proportional relationships for maximum visual appeal',
    '发展增强叙事冲击力的引人注目的姿态语言': 'develop compelling gesture language that enhances narrative impact',
    '创造真实的情感共鸣和人类连接': 'create authentic emotional resonance and human connection',
    '通过细微改进增强自然面部吸引力': 'enhance natural facial attractiveness through subtle refinements',
    '发展传达引人注目个性的表现深度': 'develop expressive depth that conveys compelling personality',
    '优化面部和谐与对称性以获得最大视觉吸引力': 'optimize facial harmony and symmetry for maximum visual appeal',
    '应用时尚设计原则以实现风格精致': 'apply fashion design principles for stylistic sophistication',
    '增强身体轮廓和比例吸引力': 'enhance body silhouette and proportional attractiveness',
    '创造与肤色和环境相辅相成的色彩协调': 'create color coordination that complements skin tone and environment',
    '发展纹理丰富度和织物真实性以获得视觉奢华感': 'develop texture richness and fabric authenticity for visual luxury',
    '创造大气深度和环境情绪增强': 'create atmospheric depth and environmental mood enhancement',
    '通过环境设计发展丰富的情境叙事': 'develop rich contextual storytelling through environmental design',
    '优化构图框架和负空间利用': 'optimize compositional framing and negative space utilization',
    '通过环境心理学原理增强情感共鸣': 'enhance emotional resonance through environmental psychology principles',
    '达到水晶般清晰的专业摄影标准': 'achieve crystal-clear professional photography standards',
    '增强精细细节定义以获得最大视觉清晰度': 'enhance fine detail definition for maximum visual clarity',
    '发展丰富的纹理深度和触觉视觉质量': 'develop rich texture depth and tactile visual quality',
    '优化动态范围以获得惊人的视觉冲击力': 'optimize dynamic range for stunning visual impact',
    '美丽的焦外成像': 'beautiful bokeh',
    '艺术性的景深': 'artistic depth of field',
    '专业肖像外观': 'professional portrait look',
    '优雅的焦点': 'elegant focus',
    '创造戏剧性的明暗对比效果以获得情感深度': 'create dramatic chiaroscuro effects for emotional depth',
    '增强三维形态建模和雕塑品质': 'enhance three-dimensional form modeling and sculptural quality',
    '通过精密的光照设计发展大气情绪': 'develop atmospheric mood through sophisticated lighting design',
    '优化高光和阴影关系以获得最大视觉冲击力': 'optimize highlight and shadow relationships for maximum visual impact',
    '优化比例关系以获得黄金比例和谐': 'optimize proportional relationships for golden ratio harmony',
    '增强视觉重量分布和构图平衡': 'enhance visual weight distribution and compositional balance',
    '通过战略性尺寸创造改进的焦点强调': 'create improved focal point emphasis through strategic sizing',
    '发展更好的空间节奏和视觉流动模式': 'develop better spatial rhythm and visual flow patterns',
    '真实的皮肤细节': 'realistic skin detail',
    '自然的毛孔结构': 'natural pore structure',
    '健康的皮肤外观': 'healthy skin appearance',
    '照片级真实纹理': 'photorealistic texture',
    '情感引人入胜': 'emotionally engaging',
    '自然富有表现力': 'naturally expressive',
    '迷人的面部特征': 'captivating facial features',
    '真实的人类情感': 'authentic human emotion',
    '自然的头发流动': 'natural hair flow',
    '真实的头发纹理': 'realistic hair texture',
    '风格上恰当': 'stylistically appropriate',
    '专业造型': 'professionally styled',
    '风格上匹配': 'stylistically matching',
    '完美合身': 'perfectly fitted',
    '自然融合': 'naturally integrated',
    '前卫设计': 'fashion-forward design',
    
    // 继续添加其他修饰性提示词映射...
    '创造具有专业电影级品质的电影色彩调色板': 'create cinematic color palette with professional film-grade quality',
    '发展丰富的色调深度和复杂的色彩关系': 'develop rich tonal depth and sophisticated color relationships',
    '通过色彩心理学原理增强情感冲击力': 'enhance emotional impact through color psychology principles',
    '通过战略性色彩强调优化视觉层次': 'optimize visual hierarchy through strategic color emphasis',
    '创造具有复杂美学愿景的艺术杰作品质': 'create artistic masterpiece quality with sophisticated aesthetic vision',
    '通过创意风格诠释发展独特的视觉身份': 'develop unique visual identity through creative style interpretation',
    '通过风格应用增强文化和艺术意义': 'enhance cultural and artistic significance through style application',
    '在保持构图卓越的同时优化创意表达': 'optimize creative expression while maintaining compositional excellence',
    '完美的曝光平衡': 'perfect exposure balance',
    '戏剧性对比': 'dramatic contrast',
    '增强的动态范围': 'enhanced dynamic range',
    '专业质量': 'professional quality',
    '充满活力但仍自然的颜色': 'vibrant yet natural colors',
    '和谐的调色板': 'harmonious palette',
    '丰富的饱和度': 'rich saturation',
    '色彩准确的结果': 'color-accurate result',
    '水晶般清晰的锐度': 'crystal clear sharpness',
    '艺术性模糊效果': 'artistic blur effect',
    '增强的清晰度': 'enhanced clarity',
    '专业处理': 'professional processing',
    '干净平滑的结果': 'clean smooth result',
    '无伪影的图像': 'artifact-free image',
    '原始质量': 'pristine quality',
    '专业清理': 'professional cleanup',
    '惊人的视觉冲击力': 'stunning visual impact',
    '增强的美感': 'enhanced beauty',
    '杰作品质': 'masterpiece quality',
    '专业精修': 'professional refinement',
    '艺术滤镜效果': 'artistic filter effect',
    '风格增强': 'stylistic enhancement',
    '创意转换': 'creative transformation',
    '视觉吸引力': 'visually appealing',
    '年龄适当的外观': 'age-appropriate appearance',
    '自然衰老过程': 'natural aging process',
    '永恒之美': 'timeless beauty',
    '真实的性格': 'authentic character',
    '复杂细节保存': 'intricate detail preservation',
    '增强的纹理清晰度': 'enhanced texture clarity',
    '精细的表面质量': 'refined surface quality',
    '专业细节渲染': 'professional detail rendering',
    '微观纹理细节增强（皮肤毛孔、织物纹理、木材纹理）': 'microscopic texture detail enhancement (skin pores, fabric weave, wood grain)',
    '边缘锐度优化保持自然柔和过渡': 'edge sharpness optimization maintaining natural soft transitions',
    '层次化细节渲染（前景、中景、背景）': 'layered detail rendering (foreground, midground, background)',
    '专业级细节平衡避免过度处理': 'professional-grade detail balance avoiding over-processing',
    '完美的透视对齐': 'perfect perspective alignment',
    '自然视点校正': 'natural viewpoint correction',
    '专业透视控制': 'professional perspective control',
    '准确的空间关系': 'accurate spatial relationships',
    '精确的几何变换': 'precise geometric transformations',
    '自然的扭曲流动': 'natural distortion flow',
    '专业变形控制': 'professional deformation control',
    '无缝形状操作': 'seamless shape manipulation',
    '照片级真实感渲染': 'photorealistic rendering',
    '自然光影物理模拟': 'natural light-shadow physics simulation',
    '材质真实性增强': 'material authenticity enhancement',
    '专业摄影品质': 'professional photography quality',
    '精密透视几何校正': 'precision perspective geometry correction',
    '建筑线条完美对齐': 'architectural line perfect alignment',
    '空间深度层次优化': 'spatial depth layer optimization',
    '专业透视重构': 'professional perspective reconstruction',
    '精确镜头畸变校正': 'precise lens distortion correction',
    '光学失真完美修复': 'optical distortion perfect repair',
    '边缘直线性恢复': 'edge linearity restoration',
    '专业镜头校准效果': 'professional lens calibration effects',
    '智能内容无缝生成': 'intelligent content seamless generation',
    '周围环境完美匹配': 'surrounding environment perfect matching',
    '自然纹理延续': 'natural texture continuation',
    '专业级内容填充': 'professional-grade content filling',
    '无痕迹对象移除': 'traceless object removal',
    '背景智能重构': 'background intelligent reconstruction',
    '自然空间填补': 'natural space filling',
    '专业级清理效果': 'professional-grade cleanup effects',
    '高分辨率材质细节渲染（织物编织、皮革纹理、木材年轮、金属划痕）': 'high-resolution material detail rendering (fabric weave, leather texture, wood grain, metal scratches)',
    '物理基于渲染的材质光学属性（反射、折射、次表面散射）': 'physically-based rendering material optical properties (reflection, refraction, subsurface scattering)',
    '真实感表面微凹凸和法线映射效果': 'realistic surface micro-bumps and normal mapping effects',
    '专业级材质质感和触觉视觉体验': 'professional-grade material texture and tactile visual experience',
    '照片级真实准确度': 'photorealistic accuracy',
    '逼真渲染': 'life-like rendering',
    '自然外观': 'natural appearance',
    '专业现实主义': 'professional realism',
    '专业构图': 'professional framing',
    '电影级构图': 'cinematic composition',
    '完美透视': 'perfect perspective',
    '艺术视角': 'artistic viewpoint',
    '自然光照': 'natural lighting',
    '大气照明': 'atmospheric illumination',
    '戏剧性光影效果': 'dramatic light play',
    '专业照明': 'professional lighting',
    '充满活力但仍自然的颜色': 'vibrant yet natural colors',
    '真实的色彩再现': 'authentic color reproduction',
    '和谐的色彩调色板': 'harmonious color palette',
    '专业着色': 'professional colorization',
    '无缝上下文集成': 'seamless context integration',
    '自然环境融合': 'natural environment blending',
    '完美的场景和谐': 'perfect scene harmony',
    '专业合成': 'professional compositing',
    '应用专业排版设计原则以获得最大可读性': 'apply professional typography design principles for maximum readability',
    '创造优雅的文本集成以增强整体构图': 'create elegant text integration that enhances overall composition',
    '通过字体大小和粗细关系发展适当的视觉层次': 'develop appropriate visual hierarchy through font size and weight relationships',
    '优化色彩对比和空间关系以获得视觉和谐': 'optimize color contrast and spatial relationships for visual harmony',
    '创造没有文本中断的无缝视觉流动': 'create seamless visual flow without textual interruption',
    '增强构图纯度和视觉优雅': 'enhance compositional purity and visual elegance',
    '优化空间关系和负空间利用': 'optimize spatial relationships and negative space utilization',
    '在核心视觉元素上发展更清洁的美学焦点': 'develop cleaner aesthetic focus on core visual elements',
    '增强文本沟通清晰度和视觉冲击力': 'enhance textual communication clarity and visual impact',
    '创造改进的排版复杂性和专业外观': 'create improved typographic sophistication and professional appearance',
    '在保持美学集成的同时优化文本可读性': 'optimize text readability while maintaining aesthetic integration',
    '发展一致的视觉品牌和风格连贯性': 'develop consistent visual branding and stylistic coherence',
    '完美的文本比例': 'perfect text proportions',
    '最佳文本大小': 'optimal text sizing',
    '平衡的文本布局': 'balanced text layout',
    '专业文本缩放': 'professional text scaling',
    '无缝物体集成': 'seamless object integration',
    '完美的视觉和谐': 'perfect visual harmony',
    '自然的物体关系': 'natural object relationships',
    '专业构图': 'professional composition',
    '精确的几何变换': 'precise geometric transformation',
    '自然的扭曲流动': 'natural distortion flow',
    '专业变形': 'professional warping',
    '无缝形状操作': 'seamless shape manipulation',
    '创造建筑优雅和几何精度': 'create architectural elegance and geometric precision',
    '增强空间清晰度和尺寸准确性': 'enhance spatial clarity and dimensional accuracy',
    '发展专业建筑摄影质量': 'develop professional architectural photography quality',
    '优化观看角度以获得最大视觉冲击力和清晰度': 'optimize viewing angle for maximum visual impact and clarity',
    
    // 新增局部编辑功能的约束性提示词映射
    '保持自然的皮肤毛孔和微纹理细节': 'preserving natural skin tone',
    '避免塑料或过度光滑的人工外观': 'maintaining pore authenticity',
    '保持一致的肤色变化和瑕疵特征': 'avoiding over-smoothing artifacts',
    '确保现实的次表面散射和半透明效果': 'ensuring realistic subsurface scattering',
    
    '在模糊背景时保持对主体的清晰聚焦': 'preserving subject sharpness',
    '基于焦距创建自然的景深渐进': 'maintaining edge definition',
    '避免清晰和模糊区域之间不自然的生硬过渡': 'avoiding halo effects',
    '通过模糊保持背景光照和色彩氛围': 'natural depth of field gradation',
    
    '保持面部双侧对称和自然的肌肉运动模式': 'maintaining facial symmetry',
    '保持个人面部特征和骨骼结构特征': 'preserving natural emotion',
    '确保表情变化遵循真实的人体解剖学约束': 'avoiding forced expressions',
    '避免不自然的表情扭曲和非对称变形': 'ensuring anatomical accuracy',
    
    '保持头发的自然垂坠和重力物理效应': 'ensuring realistic hair physics',
    '确保发丝束的自然分离和聚集模式': 'maintaining hair texture quality',
    '避免头发与头皮的不自然分离或悬浮': 'avoiding unnatural hair placement',
    '维持头发纹理的连贯性和自然光泽反射': 'preserving natural hair flow',
    
    '确保配饰与人物比例和穿戴方式的真实性': 'ensuring proper fit and scale',
    '保持配饰在三维空间中的自然位置关系': 'maintaining realistic positioning',
    '避免配饰与人物其他元素的视觉冲突': 'avoiding visual conflicts',
    '确保配饰的材质和光照与环境一致': 'ensuring realistic positioning',
    
    // 新增局部编辑功能的修饰性提示词映射
    '实现具有真实微纹理的自然皮肤外观': 'realistic skin detail',
    '在保持个体特征的同时增强皮肤质量': 'natural pore structure', 
    '发展现实的次表面散射和半透明效果': 'healthy skin appearance',
    '优化肤色和谐和自然美': 'photorealistic texture',
    
    '创造具有美学质量的复杂散景效果': 'beautiful bokeh',
    '通过选择性焦点控制增强主体分离': 'artistic depth of field',
    '发展具有平滑衰减的自然深度渐进': 'professional portrait look',
    '通过战略性散焦优化构图强调': 'sophisticated background separation',
    
    '创造具有人际连接的真实情感共鸣': 'emotionally engaging',
    '在保持个体身份的同时增强面部表现力': 'naturally expressive',
    '发展传达叙事深度的微妙情感细节': 'captivating facial features',
    '优化面部和谐以实现最大视觉吸引力': 'authentic human emotion',
    
    '实现自然流动且符合重力的头发动态': 'natural hair flow',
    '在保持个人风格的同时增强头发质量': 'realistic hair texture',
    '发展适合角色身份的头发风格表现': 'stylistically appropriate',
    '优化头发外观以实现专业造型效果': 'professionally styled',
    
    '创造与整体风格完美协调的配饰设计': 'stylistically matching',
    '确保配饰的尺寸和佩戴方式完全贴合': 'perfectly fitted',
    '实现配饰与人物形象的自然融合': 'naturally integrated',
    '发展具有时尚前瞻性的配饰美学': 'fashion-forward design'
};

// 将中文提示词转换为英文
function translatePromptsToEnglish(chinesePrompts) {
    return chinesePrompts.map(prompt => PROMPT_TRANSLATION_MAP[prompt] || prompt);
}

// 定义界面尺寸
const EDITOR_SIZE = {
    WIDTH: 800, // 1000 * 0.8 - 减小20%
    HEIGHT: 700,
    LAYER_PANEL_HEIGHT: 144, // 180 * 0.8 - 减小20%
    TOOLBAR_HEIGHT: 50,
    TAB_HEIGHT: 40
};

class KontextSuperPrompt {
    constructor(node) {
        this.node = node;
        this.layerInfo = null;
        this.selectedLayers = [];
        this.currentEditMode = "局部编辑";
        this.currentCategory = 'local';
        this.currentOperationType = '';
        this.description = '';
        this.selectedConstraints = [];
        this.selectedDecoratives = [];
        this.autoGenerate = true;
        this.generatedPrompt = '';
        
        // 初始化UI
        this.initEditor();
    }

    initEditor() {
        console.log("[Kontext Super Prompt] 初始化超级提示词编辑器");
        
        // 创建主容器
        this.editorContainer = document.createElement('div');
        this.editorContainer.className = 'kontext-super-prompt-container';
        this.editorContainer.style.cssText = `
            width: ${EDITOR_SIZE.WIDTH}px;
            height: ${EDITOR_SIZE.HEIGHT}px;
            background: #1a1a1a;
            border: 1px solid #444;
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        `;

        // 工具栏已移除 - 不再需要标题、图层选择计数和自动生成功能

        // 创建标签栏
        this.tabBar = this.createTabBar();
        this.editorContainer.appendChild(this.tabBar);

        // 创建主内容区域
        this.contentArea = this.createContentArea();
        this.editorContainer.appendChild(this.contentArea);

        // 将容器添加到节点
        this.domWidget = this.node.addDOMWidget("kontext_super_prompt", "div", this.editorContainer, {
            serialize: false,
            hideOnZoom: false,
            getValue: () => this.getEditorData(),
            setValue: (value) => this.setEditorData(value)
        });

        // 设置节点尺寸
        const nodeWidth = 816; // 1020 * 0.8 - 减小20%
        const nodeHeight = 750; // EDITOR_SIZE.HEIGHT + 50
        this.node.size = [nodeWidth, nodeHeight];
        this.node.setSize?.(this.node.size);
        
        // 确保节点重新计算大小
        this.updateNodeSize();

        // 设置事件监听
        this.setupEventListeners();
        
        // 初始化隐藏widget
        this.createHiddenWidgets({
            edit_mode: this.currentEditMode,
            operation_type: this.currentOperationType,
            description: this.description,
            constraint_prompts: '',
            decorative_prompts: '',
            selected_layers: JSON.stringify(this.selectedLayers),
            auto_generate: this.autoGenerate,
            generated_prompt: this.generatedPrompt
        });
        
        // 初始化显示（切换到有提示词的标签页）
        this.switchTab('global');
        
        // 设置默认操作类型（匹配global标签页）
        this.currentOperationType = 'global_color_grade'; // 全局编辑的默认操作类型
        console.log('[Kontext Super Prompt] 开始初始化延时调用，操作类型:', this.currentOperationType);
        
        // 保存初始操作类型，避免被其他操作覆盖
        const initialOperationType = this.currentOperationType;
        
        setTimeout(() => {
            // 确保操作类型没有被覆盖
            if (!this.currentOperationType || this.currentOperationType === '') {
                this.currentOperationType = initialOperationType;
            }
            console.log('[Kontext Super Prompt] 延时调用执行，当前操作类型:', this.currentOperationType);
            
            // 确保下拉框被正确设置并触发变化事件
            const selects = this.editorContainer.querySelectorAll('.operation-select');
            selects.forEach(select => {
                const option = select.querySelector(`option[value="${this.currentOperationType}"]`);
                if (option) {
                    select.value = this.currentOperationType;
                    // 触发change事件来更新提示词
                    const event = new Event('change', { bubbles: true });
                    select.dispatchEvent(event);
                    console.log('[Kontext Super Prompt] 设置下拉框值并触发change事件:', this.currentOperationType, '在选择器:', select.className);
                }
            });
            
            this.updateOperationButtons(); // 更新按钮状态
            
            // 提示词将在标签页切换时按需加载
            console.log('[Kontext Super Prompt] 界面初始化完成');
            
            this.refreshLayerInfo();
            
            // 强制再次尝试显示提示词
            setTimeout(() => {
                console.log('[Kontext Super Prompt] 强制刷新提示词显示');
                console.log('[Kontext Super Prompt] 约束性提示词容器子元素数量:', this.constraintContainer?.children.length);
                console.log('[Kontext Super Prompt] 修饰性提示词容器子元素数量:', this.decorativeContainer?.children.length);
                
                if (this.constraintContainer && this.constraintContainer.children.length === 0) {
                    console.log('[Kontext Super Prompt] 约束提示词容器为空，重新加载');
                    // 使用通用约束提示词强制填充
                    this.updateConstraintContainer(CONSTRAINT_PROMPTS.general || ['natural appearance', 'technical precision', 'visual coherence', 'quality control']);
                }
                if (this.decorativeContainer && this.decorativeContainer.children.length === 0) {
                    console.log('[Kontext Super Prompt] 修饰提示词容器为空，重新加载');
                    // 使用通用修饰提示词强制填充
                    this.updateDecorativeContainer(DECORATIVE_PROMPTS.general || ['enhanced quality', 'improved visual impact', 'professional finish', 'artistic excellence']);
                }
                
                // 再次强制检查
                setTimeout(() => {
                    console.log('[Kontext Super Prompt] 最终检查 - 约束性提示词容器子元素:', this.constraintContainer?.children.length);
                    console.log('[Kontext Super Prompt] 最终检查 - 修饰性提示词容器子元素:', this.decorativeContainer?.children.length);
                }, 500);
            }, 1000);
        }, 500);
    }

    createToolbar() {
        const toolbar = document.createElement('div');
        toolbar.className = 'kontext-toolbar';
        toolbar.style.cssText = `
            height: ${EDITOR_SIZE.TOOLBAR_HEIGHT}px;
            background: #2a2a2a;
            border-bottom: 1px solid #444;
            display: flex;
            align-items: center;
            padding: 0 16px;
            gap: 16px;
        `;

        // 标题
        const title = document.createElement('div');
        title.style.cssText = `
            color: #fff;
            font-size: 14px;
            font-weight: bold;
        `;
        title.textContent = '🎯 Kontext Super Prompt 生成器';

        // 自动生成开关
        const autoGenLabel = document.createElement('label');
        autoGenLabel.style.cssText = `
            display: flex;
            align-items: center;
            color: #ccc;
            font-size: 12px;
            cursor: pointer;
            margin-left: auto;
        `;

        this.autoGenCheckbox = document.createElement('input');
        this.autoGenCheckbox.type = 'checkbox';
        this.autoGenCheckbox.checked = this.autoGenerate;
        this.autoGenCheckbox.style.cssText = `
            margin-right: 6px;
            accent-color: #9C27B0;
        `;

        autoGenLabel.appendChild(this.autoGenCheckbox);
        autoGenLabel.appendChild(document.createTextNode('自动生成约束修饰词'));

        // 选中图层计数
        this.layerCountDisplay = document.createElement('span');
        this.layerCountDisplay.style.cssText = `
            color: #888;
            font-size: 12px;
        `;
        this.updateLayerCountDisplay();

        toolbar.appendChild(title);
        toolbar.appendChild(this.layerCountDisplay);
        toolbar.appendChild(autoGenLabel);

        return toolbar;
    }

    createTabBar() {
        const tabBar = document.createElement('div');
        tabBar.className = 'kontext-tab-bar';
        tabBar.style.cssText = `
            height: ${EDITOR_SIZE.TAB_HEIGHT}px;
            background: #2a2a2a;
            border-bottom: 1px solid #444;
            display: flex;
            align-items: center;
        `;

        const tabs = [
            { id: 'local', name: '🎯 局部编辑' },
            { id: 'global', name: '🌍 全局编辑' },
            { id: 'text', name: '📝 文字编辑' },
            { id: 'professional', name: '🔧 专业操作' }
        ];

        tabs.forEach(tab => {
            const tabButton = document.createElement('button');
            tabButton.className = `tab-button tab-${tab.id}`;
            tabButton.textContent = tab.name;
            tabButton.style.cssText = `
                background: none;
                border: none;
                color: #888;
                padding: 8px 16px;
                font-size: 12px;
                cursor: pointer;
                border-bottom: 2px solid transparent;
                transition: all 0.2s;
            `;

            tabButton.addEventListener('click', () => {
                this.switchTab(tab.id);
            });

            tabBar.appendChild(tabButton);
        });

        return tabBar;
    }

    createContentArea() {
        const contentArea = document.createElement('div');
        contentArea.className = 'kontext-content-area';
        contentArea.style.cssText = `
            flex: 1;
            display: flex;
            overflow: hidden;
        `;

        // 左侧面板 - 图层选择
        this.leftPanel = this.createLeftPanel();
        contentArea.appendChild(this.leftPanel);

        // 右侧面板 - 编辑控制
        this.rightPanel = this.createRightPanel();
        contentArea.appendChild(this.rightPanel);

        return contentArea;
    }

    createLeftPanel() {
        const panel = document.createElement('div');
        panel.className = 'kontext-left-panel';
        panel.style.cssText = `
            width: 216px;
            background: #1a1a1a;
            border-right: 1px solid #444;
            display: flex;
            flex-direction: column;
        `;

        // 图层面板标题
        const header = document.createElement('div');
        header.style.cssText = `
            padding: 12px;
            background: #2a2a2a;
            border-bottom: 1px solid #444;
            color: #fff;
            font-size: 12px;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: space-between;
        `;

        const title = document.createElement('span');
        title.textContent = '📋 图层选择';

        const buttonGroup = document.createElement('div');
        buttonGroup.style.cssText = `
            display: flex;
            gap: 4px;
        `;

        const refreshBtn = document.createElement('button');
        refreshBtn.textContent = '🔄';
        refreshBtn.title = '刷新图层信息';
        refreshBtn.style.cssText = `
            background: #4CAF50;
            color: white;
            border: 1px solid #66bb6a;
            border-radius: 3px;
            padding: 2px 6px;
            font-size: 10px;
            cursor: pointer;
        `;

        const selectAllBtn = document.createElement('button');
        selectAllBtn.textContent = '全选/取消';
        selectAllBtn.style.cssText = `
            background: #444;
            color: white;
            border: 1px solid #666;
            border-radius: 3px;
            padding: 2px 8px;
            font-size: 10px;
            cursor: pointer;
        `;

        buttonGroup.appendChild(refreshBtn);
        buttonGroup.appendChild(selectAllBtn);
        header.appendChild(title);
        header.appendChild(buttonGroup);

        // 图层列表
        this.layerList = document.createElement('div');
        this.layerList.className = 'layer-list';
        this.layerList.style.cssText = `
            flex: 1;
            overflow-y: auto;
            padding: 8px;
        `;

        panel.appendChild(header);
        panel.appendChild(this.layerList);

        // 绑定按钮事件
        refreshBtn.addEventListener('click', () => {
            this.refreshLayerInfo();
        });

        selectAllBtn.addEventListener('click', () => {
            this.toggleSelectAll();
        });

        return panel;
    }

    createRightPanel() {
        const panel = document.createElement('div');
        panel.className = 'kontext-right-panel';
        panel.style.cssText = `
            flex: 1;
            background: #1a1a1a;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        `;

        // 创建各个编辑模式的内容面板
        this.tabContents = {
            local: this.createLocalEditPanel(),
            global: this.createGlobalEditPanel(), 
            text: this.createTextEditPanel(),
            professional: this.createProfessionalEditPanel()
        };

        // 添加所有面板，但只显示当前激活的
        Object.values(this.tabContents).forEach(content => {
            panel.appendChild(content);
        });

        return panel;
    }

    createLocalEditPanel() {
        const panel = document.createElement('div');
        panel.className = 'edit-panel local-edit-panel';
        panel.style.cssText = `
            flex: 1;
            display: none;
            flex-direction: column;
            padding: 16px;
            overflow-y: auto;
        `;

        // 操作类型选择
        const operationSection = this.createOperationTypeSection('local');
        panel.appendChild(operationSection);

        // 描述输入
        const descriptionSection = this.createDescriptionSection();
        panel.appendChild(descriptionSection);

        // 约束性提示词
        const constraintSection = this.createConstraintPromptsSection();
        panel.appendChild(constraintSection);

        // 修饰性提示词
        const decorativeSection = this.createDecorativePromptsSection();
        panel.appendChild(decorativeSection);

        // 生成按钮
        const generateSection = this.createGenerateSection();
        panel.appendChild(generateSection);

        return panel;
    }

    createGlobalEditPanel() {
        const panel = document.createElement('div');
        panel.className = 'edit-panel global-edit-panel';
        panel.style.cssText = `
            flex: 1;
            display: none;
            flex-direction: column;
            padding: 16px;
            overflow-y: auto;
        `;

        // 全局编辑不需要图层选择提示
        const notice = document.createElement('div');
        notice.style.cssText = `
            background: #2a4a2a;
            border: 1px solid #4a8a4a;
            border-radius: 4px;
            padding: 8px 12px;
            margin-bottom: 16px;
            color: #8FBC8F;
            font-size: 12px;
        `;
        notice.textContent = 'ℹ️ 全局编辑将应用于整个图像，无需选择图层';
        panel.appendChild(notice);

        // 操作类型选择
        const operationSection = this.createOperationTypeSection('global');
        panel.appendChild(operationSection);

        // 描述输入
        const descriptionSection = this.createDescriptionSection();
        panel.appendChild(descriptionSection);

        // 约束性提示词
        const constraintSection = this.createConstraintPromptsSection();
        panel.appendChild(constraintSection);

        // 修饰性提示词
        const decorativeSection = this.createDecorativePromptsSection();
        panel.appendChild(decorativeSection);

        // 生成按钮
        const generateSection = this.createGenerateSection();
        panel.appendChild(generateSection);

        return panel;
    }

    createTextEditPanel() {
        const panel = document.createElement('div');
        panel.className = 'edit-panel text-edit-panel';
        panel.style.cssText = `
            flex: 1;
            display: none;
            flex-direction: column;
            padding: 16px;
            overflow-y: auto;
        `;

        // 文字编辑需要图层选择提示
        const notice = document.createElement('div');
        notice.style.cssText = `
            background: #4a3a2a;
            border: 1px solid #8a6a4a;
            border-radius: 4px;
            padding: 8px 12px;
            margin-bottom: 16px;
            color: #DEB887;
            font-size: 12px;
        `;
        notice.textContent = '⚠️ 文字编辑需要选择包含文字的图层';
        panel.appendChild(notice);

        // 操作类型选择
        const operationSection = this.createOperationTypeSection('text');
        panel.appendChild(operationSection);

        // 描述输入
        const descriptionSection = this.createDescriptionSection();
        panel.appendChild(descriptionSection);

        // 约束性提示词
        const constraintSection = this.createConstraintPromptsSection();
        panel.appendChild(constraintSection);

        // 修饰性提示词
        const decorativeSection = this.createDecorativePromptsSection();
        panel.appendChild(decorativeSection);

        // 生成按钮
        const generateSection = this.createGenerateSection();
        panel.appendChild(generateSection);

        return panel;
    }

    createProfessionalEditPanel() {
        const panel = document.createElement('div');
        panel.className = 'edit-panel professional-edit-panel';
        panel.style.cssText = `
            flex: 1;
            display: none;
            flex-direction: column;
            padding: 16px;
            overflow-y: auto;
        `;

        // 专业操作说明
        const notice = document.createElement('div');
        notice.style.cssText = `
            background: #2a2a4a;
            border: 1px solid #4a4a8a;
            border-radius: 4px;
            padding: 8px 12px;
            margin-bottom: 16px;
            color: #9999ff;
            font-size: 12px;
        `;
        notice.textContent = '🔧 专业操作支持全局和局部编辑，可选择性使用图层';
        panel.appendChild(notice);

        // 操作类型选择
        const operationSection = this.createOperationTypeSection('professional');
        panel.appendChild(operationSection);

        // 描述输入
        const descriptionSection = this.createDescriptionSection();
        panel.appendChild(descriptionSection);

        // 约束性提示词
        const constraintSection = this.createConstraintPromptsSection();
        panel.appendChild(constraintSection);

        // 修饰性提示词
        const decorativeSection = this.createDecorativePromptsSection();
        panel.appendChild(decorativeSection);

        // 生成按钮
        const generateSection = this.createGenerateSection();
        panel.appendChild(generateSection);

        return panel;
    }

    createOperationTypeSection(category) {
        const section = document.createElement('div');
        section.className = 'operation-type-section';
        section.style.cssText = `
            margin-bottom: 16px;
        `;

        // 标题
        const title = document.createElement('div');
        title.style.cssText = `
            color: #fff;
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 8px;
        `;
        title.textContent = '🎨 操作类型';

        // 操作类型下拉框
        const operationSelect = document.createElement('select');
        operationSelect.className = `operation-select operation-select-${category}`;
        operationSelect.style.cssText = `
            width: 100%;
            background: #333;
            color: #fff;
            border: 1px solid #555;
            border-radius: 4px;
            padding: 8px 12px;
            font-size: 12px;
            cursor: pointer;
            outline: none;
        `;

        // 添加默认选项
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '请选择操作类型...';
        defaultOption.disabled = true;
        // 不设置 selected = true，让初始化代码来设置正确的选项
        operationSelect.appendChild(defaultOption);

        // 添加操作选项
        const templates = OPERATION_CATEGORIES[category]?.templates || [];
        templates.forEach(templateId => {
            const template = OPERATION_TEMPLATES[templateId];
            if (template) {
                const option = document.createElement('option');
                option.value = templateId;
                option.textContent = template.label;
                operationSelect.appendChild(option);
            }
        });

        // 添加事件监听
        operationSelect.addEventListener('change', (e) => {
            if (e.target.value) {
                this.selectOperationType(e.target.value);
            }
        });

        section.appendChild(title);
        section.appendChild(operationSelect);

        return section;
    }

    createDescriptionSection() {
        const section = document.createElement('div');
        section.className = 'description-section';
        section.style.cssText = `
            margin-bottom: 16px;
        `;

        // 标题
        const title = document.createElement('div');
        title.style.cssText = `
            color: #fff;
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 8px;
        `;
        title.textContent = '✏️ 编辑描述';

        // 输入框
        const descriptionTextarea = document.createElement('textarea');
        descriptionTextarea.placeholder = '输入详细的编辑描述...';
        descriptionTextarea.style.cssText = `
            width: 100%;
            height: 80px;
            background: #2a2a2a;
            color: white;
            border: 1px solid #444;
            border-radius: 4px;
            padding: 8px;
            font-size: 12px;
            font-family: inherit;
            resize: vertical;
            outline: none;
        `;
        
        // 为每个描述输入框添加事件监听
        descriptionTextarea.addEventListener('input', (e) => {
            this.description = e.target.value;
            console.log('[Kontext Super Prompt] 描述更新:', this.description);
            // 同步更新所有面板的描述输入框
            this.updateAllDescriptionTextareas();
            this.notifyNodeUpdate();
        });
        
        // 设置初始值
        if (this.description) {
            descriptionTextarea.value = this.description;
        }

        section.appendChild(title);
        section.appendChild(descriptionTextarea);
        
        // 保存引用以便后续更新
        this.descriptionTextarea = descriptionTextarea;

        return section;
    }

    createConstraintPromptsSection() {
        const section = document.createElement('div');
        section.className = 'constraint-prompts-section';
        section.style.cssText = `
            margin-bottom: 16px;
        `;

        // 标题
        const title = document.createElement('div');
        title.style.cssText = `
            color: #fff;
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        `;

        const titleText = document.createElement('span');
        titleText.textContent = '🛡️ 约束性提示词';

        title.appendChild(titleText);

        // 约束词容器 - 创建独立容器而不是覆盖全局引用
        const constraintContainer = document.createElement('div');
        constraintContainer.className = 'constraint-prompts-container';
        constraintContainer.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 4px;
            max-height: 120px;
            overflow-y: auto;
            padding: 8px;
            background: #2a2a2a;
            border: 1px solid #444;
            border-radius: 4px;
        `;
        
        // 设置全局引用（用于当前活动的容器）
        if (!this.constraintContainer) {
            this.constraintContainer = constraintContainer;
        }

        section.appendChild(title);
        section.appendChild(constraintContainer);

        // 自动添加按钮已移除

        return section;
    }

    createDecorativePromptsSection() {
        const section = document.createElement('div');
        section.className = 'decorative-prompts-section';
        section.style.cssText = `
            margin-bottom: 16px;
        `;

        // 标题
        const title = document.createElement('div');
        title.style.cssText = `
            color: #fff;
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        `;

        const titleText = document.createElement('span');
        titleText.textContent = '✨ 修饰性提示词';

        title.appendChild(titleText);

        // 修饰词容器 - 创建独立容器而不是覆盖全局引用
        const decorativeContainer = document.createElement('div');
        decorativeContainer.className = 'decorative-prompts-container';
        decorativeContainer.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 4px;
            max-height: 120px;
            overflow-y: auto;
            padding: 8px;
            background: #2a2a2a;
            border: 1px solid #444;
            border-radius: 4px;
        `;
        
        // 设置全局引用（用于当前活动的容器）
        if (!this.decorativeContainer) {
            this.decorativeContainer = decorativeContainer;
        }

        section.appendChild(title);
        section.appendChild(decorativeContainer);

        // 自动添加按钮已移除

        return section;
    }

    createGenerateSection() {
        const section = document.createElement('div');
        section.className = 'generate-section';
        section.style.cssText = `
            margin-top: auto;
            padding-top: 16px;
            border-top: 1px solid #444;
        `;

        // 预览文本框标题
        const previewTitle = document.createElement('div');
        previewTitle.style.cssText = `
            color: #fff;
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 8px;
        `;
        previewTitle.textContent = '📝 提示词预览';
        
        // 创建预览文本框（每个panel都创建新的textarea，但共享数据）
        const promptPreviewTextarea = document.createElement('textarea');
        promptPreviewTextarea.placeholder = '生成的超级提示词将在此处显示，可编辑修改...';
        promptPreviewTextarea.style.cssText = `
            width: 100%;
            height: 100px;
            background: #2a2a2a;
            color: #fff;
            border: 1px solid #444;
            border-radius: 4px;
            padding: 8px;
            font-size: 12px;
            resize: vertical;
            font-family: monospace;
            margin-bottom: 12px;
            box-sizing: border-box;
        `;
        
        // 设置初始值（如果已经有生成的提示词）
        if (this.generatedPrompt) {
            promptPreviewTextarea.value = this.generatedPrompt;
        }
        
        // 添加事件监听器
        promptPreviewTextarea.addEventListener('input', (e) => {
            this.generatedPrompt = e.target.value;
            // 更新所有其他textarea
            this.updateAllPreviewTextareas();
            this.updateNodeWidgets({
                edit_mode: this.currentEditMode,
                operation_type: this.currentOperationType,
                description: this.description,
                constraint_prompts: translatePromptsToEnglish(this.selectedConstraints).join('\n'),
                decorative_prompts: translatePromptsToEnglish(this.selectedDecoratives).join('\n'),
                selected_layers: JSON.stringify(this.selectedLayers),
                auto_generate: this.autoGenerate,
                generated_prompt: this.generatedPrompt
            });
        });
        
        // 保存所有textarea的引用
        if (!this.previewTextareas) {
            this.previewTextareas = [];
        }
        this.previewTextareas.push(promptPreviewTextarea);

        const buttonGroup = document.createElement('div');
        buttonGroup.style.cssText = `
            display: flex;
            gap: 8px;
        `;

        const generateBtn = document.createElement('button');
        generateBtn.textContent = '🎯 生成超级提示词';
        generateBtn.style.cssText = `
            flex: 1;
            background: linear-gradient(45deg, #9C27B0, #673AB7);
            color: white;
            border: none;
            border-radius: 6px;
            padding: 12px 16px;
            font-size: 13px;
            cursor: pointer;
            font-weight: 600;
            box-shadow: 0 2px 4px rgba(156, 39, 176, 0.3);
            transition: all 0.2s;
        `;

        const copyBtn = document.createElement('button');
        copyBtn.textContent = '📋 复制';
        copyBtn.style.cssText = `
            background: #2196F3;
            color: white;
            border: none;
            border-radius: 6px;
            padding: 12px 16px;
            font-size: 13px;
            cursor: pointer;
            font-weight: 600;
            min-width: 60px;
        `;

        buttonGroup.appendChild(generateBtn);
        buttonGroup.appendChild(copyBtn);
        
        section.appendChild(previewTitle);
        section.appendChild(promptPreviewTextarea);
        section.appendChild(buttonGroup);

        // 绑定事件
        generateBtn.addEventListener('click', () => {
            this.generateSuperPrompt();
        });

        copyBtn.addEventListener('click', () => {
            this.copyToClipboard();
        });

        return section;
    }

    switchTab(tabId) {
        // 更新标签按钮状态
        const tabButtons = this.tabBar.querySelectorAll('.tab-button');
        tabButtons.forEach(btn => {
            if (btn.classList.contains(`tab-${tabId}`)) {
                btn.style.color = '#9C27B0';
                btn.style.borderBottomColor = '#9C27B0';
                btn.style.background = '#2a1a2a';
            } else {
                btn.style.color = '#888';
                btn.style.borderBottomColor = 'transparent';
                btn.style.background = 'none';
            }
        });

        // 显示对应的内容面板
        console.log('[Kontext Super Prompt] 切换面板显示状态，目标标签页:', tabId);
        Object.entries(this.tabContents).forEach(([key, panel]) => {
            const shouldShow = key === tabId;
            panel.style.display = shouldShow ? 'flex' : 'none';
            console.log(`[Kontext Super Prompt] 面板 ${key}: display = ${shouldShow ? 'flex' : 'none'}`);
            
            if (shouldShow) {
                console.log(`[Kontext Super Prompt] 当前显示面板 ${key} 的实际状态:`, {
                    offsetWidth: panel.offsetWidth,
                    offsetHeight: panel.offsetHeight,
                    computedDisplay: window.getComputedStyle(panel).display
                });
                
                // 深度检查约束和修饰容器在每个标签页的状态
                setTimeout(() => {
                    console.log(`[Kontext Super Prompt] === 标签页 ${key} 详细DOM分析 ===`);
                    
                    // 查找约束容器
                    const constraintSection = panel.querySelector('.constraint-prompts-section');
                    const constraintContainer = panel.querySelector('.constraint-prompts-container');
                    console.log(`[Kontext Super Prompt] 约束区域 ${key}:`, {
                        sectionExists: !!constraintSection,
                        containerExists: !!constraintContainer,
                        sectionDisplay: constraintSection ? window.getComputedStyle(constraintSection).display : 'N/A',
                        containerDisplay: constraintContainer ? window.getComputedStyle(constraintContainer).display : 'N/A',
                        containerChildren: constraintContainer ? constraintContainer.children.length : 0,
                        sectionOffsetHeight: constraintSection ? constraintSection.offsetHeight : 0,
                        containerOffsetHeight: constraintContainer ? constraintContainer.offsetHeight : 0
                    });
                    
                    // 查找修饰容器
                    const decorativeSection = panel.querySelector('.decorative-prompts-section');
                    const decorativeContainer = panel.querySelector('.decorative-prompts-container');
                    console.log(`[Kontext Super Prompt] 修饰区域 ${key}:`, {
                        sectionExists: !!decorativeSection,
                        containerExists: !!decorativeContainer,
                        sectionDisplay: decorativeSection ? window.getComputedStyle(decorativeSection).display : 'N/A',
                        containerDisplay: decorativeContainer ? window.getComputedStyle(decorativeContainer).display : 'N/A',
                        containerChildren: decorativeContainer ? decorativeContainer.children.length : 0,
                        sectionOffsetHeight: decorativeSection ? decorativeSection.offsetHeight : 0,
                        containerOffsetHeight: decorativeContainer ? decorativeContainer.offsetHeight : 0
                    });
                    
                    // 检查是否是引用问题（不同标签页是否引用了不同的容器）
                    console.log(`[Kontext Super Prompt] 容器引用检查 ${key}:`, {
                        globalConstraintSame: this.constraintContainer === constraintContainer,
                        globalDecorativeSame: this.decorativeContainer === decorativeContainer,
                        globalConstraintInThisTab: panel.contains(this.constraintContainer),
                        globalDecorativeInThisTab: panel.contains(this.decorativeContainer)
                    });
                }, 100);
            }
        });

        // 更新当前状态
        this.currentCategory = tabId;
        this.currentEditMode = OPERATION_CATEGORIES[tabId].name.replace(/^\W+\s/, '');
        
        // 更新全局容器引用到当前活动标签页的容器
        const currentPanel = this.tabContents[tabId];
        if (currentPanel) {
            const newConstraintContainer = currentPanel.querySelector('.constraint-prompts-container');
            const newDecorativeContainer = currentPanel.querySelector('.decorative-prompts-container');
            
            if (newConstraintContainer) {
                this.constraintContainer = newConstraintContainer;
                console.log('[Kontext Super Prompt] 更新约束容器引用到标签页:', tabId);
            }
            
            if (newDecorativeContainer) {
                this.decorativeContainer = newDecorativeContainer;
                console.log('[Kontext Super Prompt] 更新修饰容器引用到标签页:', tabId);
            }
            
            // 标签页切换后，根据新的操作类型重新加载提示词选项
            setTimeout(() => {
                if (this.constraintContainer && this.decorativeContainer && this.currentOperationType) {
                    console.log('[Kontext Super Prompt] 标签页切换完成，根据操作类型重新加载提示词选项');
                    this.loadDefaultPrompts();
                }
            }, 150); // 延迟更长一些，确保操作类型已经设置
        }
        
        // 设置每个标签页的默认操作类型
        const defaultOperations = {
            'local': 'change_color',
            'global': 'global_color_grade', 
            'text': 'text_add',
            'professional': 'geometric_warp'
        };
        
        this.currentOperationType = defaultOperations[tabId] || '';
        console.log('[Kontext Super Prompt] 切换到标签页:', tabId, '默认操作类型:', this.currentOperationType);
        
        // 延迟执行确保DOM完全更新
        setTimeout(() => {
            this.updateOperationButtons();
            
            // 自动生成已移除
            if (this.currentOperationType) {
                console.log('[Kontext Super Prompt] 标签页切换完成，等待用户手动选择');
            }
        }, 100);
        
        this.updatePromptContainers();
    }

    selectOperationType(operationType) {
        console.log('[Kontext Super Prompt] 操作类型改变:', this.currentOperationType, '→', operationType);
        this.currentOperationType = operationType;
        this.updateOperationButtons();
        
        // 重新加载对应操作类型的提示词选项（不自动选中）
        if (this.constraintContainer && this.decorativeContainer) {
            console.log('[Kontext Super Prompt] 根据操作类型更新提示词选项');
            this.loadDefaultPrompts();
        }
        
        this.notifyNodeUpdate();
    }

    updateOperationButtons() {
        // 更新下拉框选择状态
        const selects = this.editorContainer.querySelectorAll('.operation-select');
        selects.forEach(select => {
            // 查找当前操作类型是否在这个下拉框中
            const option = select.querySelector(`option[value="${this.currentOperationType}"]`);
            if (option) {
                select.value = this.currentOperationType;
                select.style.borderColor = '#9C27B0';
                select.style.background = '#444';
            } else {
                select.value = '';
                select.style.borderColor = '#555';
                select.style.background = '#333';
            }
        });
    }

    autoAddConstraints() {
        console.log('[Kontext Super Prompt] autoAddConstraints 调用，当前操作类型:', this.currentOperationType);
        console.log('[Kontext Super Prompt] autoGenerate 状态:', this.autoGenerate);
        console.log('[Kontext Super Prompt] 当前标签页:', this.currentCategory);
        
        let constraints;
        if (!this.currentOperationType || this.currentOperationType === '') {
            // 如果没有选择操作类型，使用通用约束提示词
            constraints = CONSTRAINT_PROMPTS.general || ['natural appearance', 'technical precision', 'visual coherence', 'quality control'];
            console.log('[Kontext Super Prompt] 使用通用约束提示词:', constraints);
        } else {
            constraints = CONSTRAINT_PROMPTS[this.currentOperationType] || CONSTRAINT_PROMPTS.general || ['natural appearance', 'technical precision', 'visual coherence', 'quality control'];
            console.log('[Kontext Super Prompt] 使用操作类型约束提示词:', constraints);
        }
        
        this.updateConstraintContainer(constraints);
    }

    autoAddDecoratives() {
        console.log('[Kontext Super Prompt] autoAddDecoratives 调用，当前操作类型:', this.currentOperationType);
        console.log('[Kontext Super Prompt] autoGenerate 状态:', this.autoGenerate);
        console.log('[Kontext Super Prompt] 当前标签页:', this.currentCategory);
        
        let decoratives;
        if (!this.currentOperationType || this.currentOperationType === '') {
            // 如果没有选择操作类型，使用通用修饰提示词
            decoratives = DECORATIVE_PROMPTS.general || ['enhanced quality', 'improved visual impact', 'professional finish', 'artistic excellence'];
            console.log('[Kontext Super Prompt] 使用通用修饰提示词:', decoratives);
        } else {
            decoratives = DECORATIVE_PROMPTS[this.currentOperationType] || DECORATIVE_PROMPTS.general || ['enhanced quality', 'improved visual impact', 'professional finish', 'artistic excellence'];
            console.log('[Kontext Super Prompt] 使用操作类型修饰提示词:', decoratives);
        }
        
        this.updateDecorativeContainer(decoratives);
    }

    loadDefaultPrompts() {
        // 如果正在生成提示词，跳过重新加载以避免清空选择状态
        if (this.isGeneratingPrompt) {
            console.log('[Kontext Super Prompt] 正在生成提示词，跳过重新加载避免清空选择状态');
            return;
        }
        
        console.log('[Kontext Super Prompt] 加载提示词，当前操作类型:', this.currentOperationType);
        
        // 根据当前操作类型加载相应的约束性提示词（不自动选中）
        let constraints;
        if (!this.currentOperationType) {
            constraints = CONSTRAINT_PROMPTS.general || ['natural appearance', 'technical precision', 'visual coherence', 'quality control'];
            console.log('[Kontext Super Prompt] 使用通用约束提示词:', constraints);
        } else {
            constraints = CONSTRAINT_PROMPTS[this.currentOperationType] || CONSTRAINT_PROMPTS.general || ['natural appearance', 'technical precision', 'visual coherence', 'quality control'];
            console.log('[Kontext Super Prompt] 使用操作类型约束提示词:', this.currentOperationType, constraints);
        }
        this.updateConstraintContainer(constraints, false); // false表示不自动选中
        
        // 根据当前操作类型加载相应的修饰性提示词（不自动选中）
        let decoratives;
        if (!this.currentOperationType) {
            decoratives = DECORATIVE_PROMPTS.general || ['enhanced quality', 'improved visual impact', 'professional finish', 'artistic excellence'];
            console.log('[Kontext Super Prompt] 使用通用修饰提示词:', decoratives);
        } else {
            decoratives = DECORATIVE_PROMPTS[this.currentOperationType] || DECORATIVE_PROMPTS.general || ['enhanced quality', 'improved visual impact', 'professional finish', 'artistic excellence'];
            console.log('[Kontext Super Prompt] 使用操作类型修饰提示词:', this.currentOperationType, decoratives);
        }
        this.updateDecorativeContainer(decoratives, false); // false表示不自动选中
        
        console.log('[Kontext Super Prompt] 操作类型相关提示词加载完成，用户可手动选择');
    }

    updateConstraintContainer(constraints, autoSelect = true) {
        console.log('[Kontext Super Prompt] updateConstraintContainer 调用，约束提示词:', constraints);
        console.log('[Kontext Super Prompt] constraintContainer:', this.constraintContainer);
        
        // 保存现有的选择状态
        const previousSelections = new Set(this.selectedConstraints || []);
        console.log('[Kontext Super Prompt] 保存现有约束提示词选择状态:', Array.from(previousSelections));
        
        this.constraintContainer.innerHTML = '';
        
        // 检查容器的实际状态
        const containerStyle = window.getComputedStyle(this.constraintContainer);
        console.log('[Kontext Super Prompt] 约束容器DOM状态:');
        console.log('  - isConnected:', this.constraintContainer.isConnected);
        console.log('  - parentElement:', this.constraintContainer.parentElement);
        console.log('  - offsetWidth:', this.constraintContainer.offsetWidth);
        console.log('  - offsetHeight:', this.constraintContainer.offsetHeight);
        console.log('  - display:', containerStyle.display);
        console.log('  - visibility:', containerStyle.visibility);
        console.log('  - opacity:', containerStyle.opacity);
        console.log('  - parentPanel display:', this.constraintContainer.parentElement ? window.getComputedStyle(this.constraintContainer.parentElement).display : 'no parent');
        
        if (!constraints || !Array.isArray(constraints)) {
            console.error('[Kontext Super Prompt] 约束提示词数据无效:', constraints);
            return;
        }
        
        console.log('[Kontext Super Prompt] 开始创建约束提示词元素，数量:', constraints.length);
        
        constraints.forEach(constraint => {
            const label = document.createElement('label');
            label.style.cssText = `
                display: flex;
                align-items: center;
                cursor: pointer;
                font-size: 11px;
                color: #ccc;
                padding: 2px 0;
            `;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.style.cssText = `
                margin-right: 6px;
                accent-color: #4CAF50;
            `;

            // 恢复之前的选择状态，如果存在的话
            if (previousSelections.has(constraint)) {
                checkbox.checked = true;
                console.log('[Kontext Super Prompt] 恢复约束提示词选择状态:', constraint);
            } else if (autoSelect && this.autoGenerate) {
                checkbox.checked = true;
            }

            checkbox.addEventListener('change', () => {
                this.updateSelectedConstraints();
            });

            const text = document.createElement('span');
            text.textContent = constraint;
            text.style.cssText = `
                line-height: 1.2;
            `;

            label.appendChild(checkbox);
            label.appendChild(text);
            this.constraintContainer.appendChild(label);
            console.log('[Kontext Super Prompt] 添加约束提示词到容器:', constraint);
            
            // 检查创建的元素状态
            console.log('[Kontext Super Prompt] 创建的label元素状态:', {
                offsetWidth: label.offsetWidth,
                offsetHeight: label.offsetHeight,
                isConnected: label.isConnected,
                display: window.getComputedStyle(label).display,
                visibility: window.getComputedStyle(label).visibility
            });
        });
        
        console.log('[Kontext Super Prompt] 约束容器最终状态:', {
            childElementCount: this.constraintContainer.childElementCount,
            scrollHeight: this.constraintContainer.scrollHeight,
            offsetHeight: this.constraintContainer.offsetHeight
        });

        this.updateSelectedConstraints();
    }

    updateDecorativeContainer(decoratives, autoSelect = true) {
        console.log('[Kontext Super Prompt] updateDecorativeContainer 调用，修饰提示词:', decoratives);
        console.log('[Kontext Super Prompt] decorativeContainer:', this.decorativeContainer);
        
        // 保存现有的选择状态
        const previousSelections = new Set(this.selectedDecoratives || []);
        console.log('[Kontext Super Prompt] 保存现有修饰提示词选择状态:', Array.from(previousSelections));
        
        this.decorativeContainer.innerHTML = '';
        
        // 检查容器的实际状态
        console.log('[Kontext Super Prompt] 修饰容器DOM状态:', {
            isConnected: this.decorativeContainer.isConnected,
            parentElement: this.decorativeContainer.parentElement,
            offsetWidth: this.decorativeContainer.offsetWidth,
            offsetHeight: this.decorativeContainer.offsetHeight,
            computedStyle: window.getComputedStyle(this.decorativeContainer).display,
            visibility: window.getComputedStyle(this.decorativeContainer).visibility
        });
        
        if (!decoratives || !Array.isArray(decoratives)) {
            console.error('[Kontext Super Prompt] 修饰提示词数据无效:', decoratives);
            return;
        }
        
        console.log('[Kontext Super Prompt] 开始创建修饰提示词元素，数量:', decoratives.length);
        
        decoratives.forEach(decorative => {
            const label = document.createElement('label');
            label.style.cssText = `
                display: flex;
                align-items: center;
                cursor: pointer;
                font-size: 11px;
                color: #ccc;
                padding: 2px 0;
            `;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.style.cssText = `
                margin-right: 6px;
                accent-color: #9C27B0;
            `;

            // 恢复之前的选择状态，如果存在的话
            if (previousSelections.has(decorative)) {
                checkbox.checked = true;
                console.log('[Kontext Super Prompt] 恢复修饰提示词选择状态:', decorative);
            } else if (autoSelect && this.autoGenerate) {
                checkbox.checked = true;
            }

            checkbox.addEventListener('change', () => {
                this.updateSelectedDecoratives();
            });

            const text = document.createElement('span');
            text.textContent = decorative;
            text.style.cssText = `
                line-height: 1.2;
            `;

            label.appendChild(checkbox);
            label.appendChild(text);
            this.decorativeContainer.appendChild(label);
            console.log('[Kontext Super Prompt] 添加修饰提示词到容器:', decorative);
            
            // 检查创建的元素状态
            console.log('[Kontext Super Prompt] 创建的label元素状态:', {
                offsetWidth: label.offsetWidth,
                offsetHeight: label.offsetHeight,
                isConnected: label.isConnected,
                display: window.getComputedStyle(label).display,
                visibility: window.getComputedStyle(label).visibility
            });
        });
        
        console.log('[Kontext Super Prompt] 修饰容器最终状态:', {
            childElementCount: this.decorativeContainer.childElementCount,
            scrollHeight: this.decorativeContainer.scrollHeight,
            offsetHeight: this.decorativeContainer.offsetHeight
        });

        this.updateSelectedDecoratives();
    }

    updateSelectedConstraints() {
        const checkboxes = this.constraintContainer.querySelectorAll('input[type="checkbox"]:checked');
        this.selectedConstraints = Array.from(checkboxes).map(cb => 
            cb.nextElementSibling.textContent
        );
        this.notifyNodeUpdate();
    }

    updateSelectedDecoratives() {
        const checkboxes = this.decorativeContainer.querySelectorAll('input[type="checkbox"]:checked');
        this.selectedDecoratives = Array.from(checkboxes).map(cb => 
            cb.nextElementSibling.textContent
        );
        this.notifyNodeUpdate();
    }
    
    forceUpdateSelections() {
        console.log("[Kontext Super Prompt] 强制更新选择状态，确保与UI一致");
        
        // 强制更新描述字段 - 从当前活动面板读取
        const panelClassMap = {
            '局部编辑': 'local-edit-panel',
            '全局编辑': 'global-edit-panel', 
            '文字编辑': 'text-edit-panel',
            '专业操作': 'professional-edit-panel'
        };
        const panelClass = panelClassMap[this.currentEditMode];
        const currentPanel = document.querySelector(`.${panelClass}`);
        
        if (currentPanel) {
            const descriptionTextarea = currentPanel.querySelector('textarea[placeholder*="描述"]');
            if (descriptionTextarea) {
                const currentDescription = descriptionTextarea.value;
                console.log(`[Kontext Super Prompt] 从UI读取描述: "${currentDescription}" (之前: "${this.description}")`);
                this.description = currentDescription;
            } else {
                console.warn("[Kontext Super Prompt] 未找到描述输入框");
            }
            
            // 强制更新操作类型 - 从当前活动面板读取下拉框选中的操作类型
            const operationSelect = currentPanel.querySelector('.operation-select');
            if (operationSelect && operationSelect.value) {
                const currentOperationType = operationSelect.value;
                console.log(`[Kontext Super Prompt] 从UI读取操作类型: "${currentOperationType}" (之前: "${this.currentOperationType}")`);
                this.currentOperationType = currentOperationType;
            } else {
                console.log(`[Kontext Super Prompt] 未找到操作类型下拉框或无选中值，保持当前值: "${this.currentOperationType}"`);
            }
        } else {
            console.warn(`[Kontext Super Prompt] 未找到当前面板: ${panelClass}`);
        }
        
        // 强制更新约束提示词选择
        if (this.constraintContainer) {
            const constraintCheckboxes = this.constraintContainer.querySelectorAll('input[type="checkbox"]:checked');
            const newConstraints = Array.from(constraintCheckboxes).map(cb => cb.nextElementSibling.textContent);
            console.log("[Kontext Super Prompt] 从UI扫描到的约束提示词:", newConstraints);
            this.selectedConstraints = newConstraints;
        } else {
            console.warn("[Kontext Super Prompt] 约束容器不存在");
        }
        
        // 强制更新修饰提示词选择  
        if (this.decorativeContainer) {
            const decorativeCheckboxes = this.decorativeContainer.querySelectorAll('input[type="checkbox"]:checked');
            const newDecoratives = Array.from(decorativeCheckboxes).map(cb => cb.nextElementSibling.textContent);
            console.log("[Kontext Super Prompt] 从UI扫描到的修饰提示词:", newDecoratives);
            this.selectedDecoratives = newDecoratives;
        } else {
            console.warn("[Kontext Super Prompt] 修饰容器不存在");
        }
    }

    updatePromptContainers() {
        // 清空约束和修饰词容器
        if (this.constraintContainer) {
            this.constraintContainer.innerHTML = '';
        }
        if (this.decorativeContainer) {
            this.decorativeContainer.innerHTML = '';
        }
    }

    setupEventListeners() {
        // 自动生成开关（已移除，保留代码以防错误）
        if (this.autoGenCheckbox) {
            this.autoGenCheckbox.addEventListener('change', (e) => {
                this.autoGenerate = e.target.checked;
                this.notifyNodeUpdate();
            });
        }

        // 描述输入事件监听已移到createDescriptionSection中，确保每个面板的输入框都有监听
    }

    updateLayerInfo(layerInfo) {
        console.log("[Kontext Super Prompt] 更新图层信息", layerInfo);
        
        if (!layerInfo) {
            console.warn("[Kontext Super Prompt] layerInfo为空，尝试主动获取");
            this.tryGetLayerInfoFromConnectedNode();
            return;
        }
        
        this.layerInfo = layerInfo;
        console.log("[Kontext Super Prompt] 图层信息解析结果:", {
            layers: layerInfo.layers?.length || 0,
            canvasSize: layerInfo.canvas_size,
            transformData: layerInfo.transform_data ? Object.keys(layerInfo.transform_data).length : 0
        });
        
        this.renderLayerList();
        this.updateLayerCountDisplay();
    }

    tryGetLayerInfoFromConnectedNode() {
        console.log("[Kontext Super Prompt] 主动尝试获取图层信息...");
        
        // 检查是否连接到源节点
        if (!this.node.inputs || !this.node.inputs[0] || !this.node.inputs[0].link) {
            console.log("[Kontext Super Prompt] 未连接到源节点");
            return;
        }

        const link = app.graph.links[this.node.inputs[0].link];
        if (!link) return;

        const sourceNode = app.graph.getNodeById(link.origin_id);
        if (!sourceNode) return;

        console.log("[Kontext Super Prompt] 源节点类型:", sourceNode.type);
        console.log("[Kontext Super Prompt] 源节点完整信息:", sourceNode);

        // 直接从LRPG Canvas节点获取实时图层数据
        if (sourceNode.type === "LRPGCanvas") {
            console.log("[Kontext Super Prompt] 检测到LRPG Canvas节点");
            
            let layerInfo = null;
            
            // 方式1: 从LRPG Canvas节点的canvasInstance属性获取
            if (sourceNode.canvasInstance && sourceNode.canvasInstance.canvas) {
                const fabricCanvas = sourceNode.canvasInstance.canvas;
                console.log("[Kontext Super Prompt] 找到LRPG Canvas实例:", sourceNode.canvasInstance);
                console.log("[Kontext Super Prompt] 找到Fabric.js画布实例:", fabricCanvas);
                
                // 直接从Fabric.js画布提取图层数据
                layerInfo = this.extractLayerInfoFromFabricCanvas(fabricCanvas);
                if (layerInfo && layerInfo.layers && layerInfo.layers.length > 0) {
                    console.log("[Kontext Super Prompt] 从Fabric.js画布成功获取到图层数据:", layerInfo);
                }
            }
            
            // 方式1备用: 从DOM元素获取LRPG Canvas实例
            if (!layerInfo && sourceNode.canvasElement) {
                const canvasElement = sourceNode.canvasElement.querySelector('canvas');
                if (canvasElement && canvasElement.__fabric) {
                    const fabricCanvas = canvasElement.__fabric;
                    console.log("[Kontext Super Prompt] 从DOM找到Fabric.js画布实例:", fabricCanvas);
                    
                    // 直接从Fabric.js画布提取图层数据
                    layerInfo = this.extractLayerInfoFromFabricCanvas(fabricCanvas);
                }
            }
            
            // 方式2: 尝试从节点的自定义属性获取
            if (!layerInfo && sourceNode.lrpgCanvas) {
                if (sourceNode.lrpgCanvas.extractTransformData) {
                    const transformData = sourceNode.lrpgCanvas.extractTransformData();
                    console.log("[Kontext Super Prompt] 从LRPG Canvas提取的变换数据:", transformData);
                    layerInfo = this.buildLayerInfoFromTransformData(transformData, sourceNode);
                }
            }
            
            // 方式3: 从nodeData存储获取
            if (!layerInfo && window.PromptServer) {
                // 尝试获取已存储的画布数据
                fetch('/lrpg_canvas_get_data', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ node_id: sourceNode.id.toString() })
                }).then(response => response.json())
                .then(data => {
                    if (data && data.transform_data) {
                        const realLayerInfo = this.buildLayerInfoFromTransformData(data.transform_data, sourceNode);
                        if (realLayerInfo && realLayerInfo.layers && realLayerInfo.layers.length > 0) {
                            console.log("[Kontext Super Prompt] 从后端获取到真实图层数据:", realLayerInfo);
                            this.updateLayerInfo(realLayerInfo);
                        }
                    }
                }).catch(err => {
                    console.log("[Kontext Super Prompt] 从后端获取数据失败:", err);
                });
            }
            
            // 如果还没有获取到，使用测试数据
            if (!layerInfo || !layerInfo.layers || layerInfo.layers.length === 0) {
                console.log("[Kontext Super Prompt] 使用测试数据，但继续尝试获取真实数据");
                layerInfo = {
                    layers: [
                        {
                            id: "test_layer_1",
                            name: "测试图层 1 (等待真实数据)",
                            visible: true,
                            locked: false,
                            z_index: 0,
                            transform: {
                                name: "测试图层 1",
                                visible: true,
                                locked: false
                            }
                        }
                    ],
                    canvas_size: { width: 500, height: 500 },
                    transform_data: {
                        background: { width: 500, height: 500 }
                    }
                };
            }
            
            if (layerInfo) {
                console.log("[Kontext Super Prompt] 更新图层信息:", layerInfo);
                this.updateLayerInfo(layerInfo);
            }
            
            // 启动实时监听LRPG Canvas的变化
            this.setupLRPGCanvasListener(sourceNode);
        }
    }

    extractLayerInfoFromFabricCanvas(fabricCanvas) {
        if (!fabricCanvas || !fabricCanvas.getObjects) return null;
        
        const objects = fabricCanvas.getObjects();
        const layers = [];
        
        objects.forEach((obj, index) => {
            const centerPoint = obj.getCenterPoint ? obj.getCenterPoint() : { x: obj.left, y: obj.top };
            
            // 生成图层类型的中文名称
            const getLayerTypeName = (type) => {
                const typeMap = {
                    'rect': '矩形',
                    'circle': '圆形',
                    'ellipse': '椭圆',
                    'triangle': '三角形',
                    'polygon': '多边形',
                    'line': '直线',
                    'path': '路径',
                    'image': '图片',
                    'i-text': '文字',
                    'text': '文本',
                    'textbox': '文本框',
                    'group': '组合'
                };
                return typeMap[type] || '图层';
            };
            
            // 生成缩略图
            const generateThumbnail = (obj) => {
                try {
                    // 创建临时画布用于生成缩略图
                    const tempCanvas = document.createElement('canvas');
                    tempCanvas.width = 64;
                    tempCanvas.height = 64;
                    const tempCtx = tempCanvas.getContext('2d');
                    
                    // 设置背景
                    tempCtx.fillStyle = '#f3f4f6';
                    tempCtx.fillRect(0, 0, 64, 64);
                    
                    // 保存当前状态
                    tempCtx.save();
                    
                    // 计算缩放比例
                    const objWidth = (obj.width * (obj.scaleX || 1)) || 100;
                    const objHeight = (obj.height * (obj.scaleY || 1)) || 100;
                    const scale = Math.min(48 / objWidth, 48 / objHeight, 1);
                    
                    // 移动到中心并缩放
                    tempCtx.translate(32, 32);
                    tempCtx.scale(scale, scale);
                    tempCtx.translate(-objWidth/2, -objHeight/2);
                    
                    if (obj.type === 'image' && obj._element) {
                        // 绘制图片缩略图
                        tempCtx.drawImage(obj._element, 0, 0, objWidth, objHeight);
                    } else if (obj.type === 'rect') {
                        // 绘制矩形缩略图
                        tempCtx.fillStyle = obj.fill || '#3b82f6';
                        tempCtx.strokeStyle = obj.stroke || '#1e40af';
                        tempCtx.lineWidth = (obj.strokeWidth || 1) * scale;
                        tempCtx.fillRect(0, 0, objWidth, objHeight);
                        if (obj.stroke) tempCtx.strokeRect(0, 0, objWidth, objHeight);
                    } else if (obj.type === 'circle') {
                        // 绘制圆形缩略图
                        const radius = objWidth / 2;
                        tempCtx.beginPath();
                        tempCtx.arc(radius, radius, radius, 0, 2 * Math.PI);
                        tempCtx.fillStyle = obj.fill || '#10b981';
                        tempCtx.fill();
                        if (obj.stroke) {
                            tempCtx.strokeStyle = obj.stroke || '#047857';
                            tempCtx.lineWidth = (obj.strokeWidth || 1) * scale;
                            tempCtx.stroke();
                        }
                    } else if (obj.type === 'i-text' || obj.type === 'text') {
                        // 绘制文字缩略图
                        tempCtx.fillStyle = obj.fill || '#374151';
                        tempCtx.font = `${Math.min(objHeight * 0.8, 20)}px Arial`;
                        tempCtx.textAlign = 'center';
                        tempCtx.textBaseline = 'middle';
                        const text = obj.text || 'Text';
                        tempCtx.fillText(text.length > 8 ? text.substring(0, 8) + '...' : text, objWidth/2, objHeight/2);
                    } else {
                        // 默认图层样式
                        tempCtx.fillStyle = '#e5e7eb';
                        tempCtx.strokeStyle = '#9ca3af';
                        tempCtx.lineWidth = 2;
                        tempCtx.fillRect(0, 0, objWidth, objHeight);
                        tempCtx.strokeRect(0, 0, objWidth, objHeight);
                        
                        // 添加图层图标
                        tempCtx.fillStyle = '#6b7280';
                        tempCtx.font = '16px Arial';
                        tempCtx.textAlign = 'center';
                        tempCtx.textBaseline = 'middle';
                        tempCtx.fillText('📄', objWidth/2, objHeight/2);
                    }
                    
                    tempCtx.restore();
                    return tempCanvas.toDataURL('image/png');
                } catch (error) {
                    console.warn('[Kontext Super Prompt] 生成缩略图失败:', error);
                    // 返回默认缩略图
                    const canvas = document.createElement('canvas');
                    canvas.width = 64;
                    canvas.height = 64;
                    const ctx = canvas.getContext('2d');
                    ctx.fillStyle = '#f3f4f6';
                    ctx.fillRect(0, 0, 64, 64);
                    ctx.fillStyle = '#9ca3af';
                    ctx.font = '32px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('?', 32, 32);
                    return canvas.toDataURL('image/png');
                }
            };
            
            const layerTypeName = getLayerTypeName(obj.type);
            const layerName = obj.name || `${layerTypeName} ${index + 1}`;
            const thumbnail = generateThumbnail(obj);
            
            layers.push({
                id: `fabric_obj_${index}`,
                name: layerName,
                type: layerTypeName,
                visible: obj.visible !== false,
                locked: obj.selectable === false,
                z_index: index,
                thumbnail: thumbnail,
                transform: {
                    type: obj.type || 'object',
                    centerX: centerPoint.x,
                    centerY: centerPoint.y,
                    scaleX: obj.scaleX || 1,
                    scaleY: obj.scaleY || 1,
                    angle: obj.angle || 0,
                    width: obj.width || 100,
                    height: obj.height || 100,
                    flipX: obj.flipX || false,
                    flipY: obj.flipY || false,
                    visible: obj.visible !== false,
                    locked: obj.selectable === false,
                    name: layerName,
                    // 额外的样式信息
                    fill: obj.fill,
                    stroke: obj.stroke,
                    strokeWidth: obj.strokeWidth,
                    opacity: obj.opacity || 1
                }
            });
        });
        
        return {
            layers: layers,
            canvas_size: {
                width: fabricCanvas.width || 500,
                height: fabricCanvas.height || 500
            },
            transform_data: {
                background: {
                    width: fabricCanvas.width || 500,
                    height: fabricCanvas.height || 500
                }
            }
        };
    }

    setupLRPGCanvasListener(sourceNode) {
        // 清除旧的监听器
        if (this.layerCheckInterval) {
            clearInterval(this.layerCheckInterval);
        }
        
        // 监听画布变化事件
        const checkForUpdates = () => {
            this.checkForLayerUpdates(sourceNode);
        };
        
        // 定时检查数据更新 - 更频繁的检查
        this.layerCheckInterval = setInterval(checkForUpdates, 1000); // 1秒检查一次
        
        // 监听ComfyUI的执行完成事件
        if (api && api.addEventListener) {
            api.addEventListener('executed', (event) => {
                if (event.detail && event.detail.node === sourceNode.id.toString()) {
                    console.log('[Kontext Super Prompt] 检测到LRPG Canvas执行完成，刷新图层信息');
                    setTimeout(() => {
                        this.tryGetLayerInfoFromConnectedNode();
                    }, 500);
                }
            });
        }
    }

    buildLayerInfoFromTransformData(transformData, sourceNode) {
        if (!transformData) return null;

        const layers = [];
        let canvasSize = { width: 512, height: 512 };

        // 提取背景信息
        if (transformData.background) {
            canvasSize = {
                width: transformData.background.width || 512,
                height: transformData.background.height || 512
            };
        }

        // 提取图层信息
        Object.entries(transformData).forEach(([key, data], index) => {
            if (key !== 'background' && data && typeof data === 'object') {
                layers.push({
                    id: key,
                    transform: data,
                    visible: data.visible !== false,
                    locked: data.locked === true,
                    z_index: data.z_index || index,
                    name: data.name || `图层 ${index + 1}`
                });
            }
        });

        const layerInfo = {
            layers: layers,
            canvas_size: canvasSize,
            transform_data: transformData
        };

        console.log("[Kontext Super Prompt] 构建的图层信息:", layerInfo);
        return layerInfo;
    }

    checkForLayerUpdates(sourceNode) {
        if (!sourceNode || sourceNode.type !== "LRPGCanvas") return;

        try {
            let currentTransformData = null;
            let layerInfo = null;

            // 方式1: 直接从LRPG Canvas节点的canvasInstance获取最新数据
            if (sourceNode.canvasInstance && sourceNode.canvasInstance.canvas) {
                const fabricCanvas = sourceNode.canvasInstance.canvas;
                layerInfo = this.extractLayerInfoFromFabricCanvas(fabricCanvas);
                
                if (layerInfo && layerInfo.layers && layerInfo.layers.length > 0) {
                    const currentHash = JSON.stringify(layerInfo.layers);
                    
                    if (this.lastTransformHash !== currentHash) {
                        console.log("[Kontext Super Prompt] 检测到LRPG Canvas实例数据更新，图层数量:", layerInfo.layers.length);
                        this.lastTransformHash = currentHash;
                        this.updateLayerInfo(layerInfo);
                        return;
                    }
                }
            }
            
            // 方式1备用: 从DOM元素获取Fabric.js画布
            if (!layerInfo && sourceNode.canvasElement) {
                const canvasElement = sourceNode.canvasElement.querySelector('canvas');
                if (canvasElement && canvasElement.__fabric) {
                    const fabricCanvas = canvasElement.__fabric;
                    layerInfo = this.extractLayerInfoFromFabricCanvas(fabricCanvas);
                    
                    if (layerInfo && layerInfo.layers && layerInfo.layers.length > 0) {
                        const currentHash = JSON.stringify(layerInfo.layers);
                        
                        if (this.lastTransformHash !== currentHash) {
                            console.log("[Kontext Super Prompt] 检测到DOM Fabric.js画布数据更新，图层数量:", layerInfo.layers.length);
                            this.lastTransformHash = currentHash;
                            this.updateLayerInfo(layerInfo);
                            return;
                        }
                    }
                }
            }

            // 方式2: 从节点属性获取
            if (sourceNode.lrpgCanvas && sourceNode.lrpgCanvas.extractTransformData) {
                currentTransformData = sourceNode.lrpgCanvas.extractTransformData();
                const currentHash = JSON.stringify(currentTransformData);
                
                if (this.lastTransformHash !== currentHash) {
                    console.log("[Kontext Super Prompt] 检测到节点属性图层数据更新");
                    this.lastTransformHash = currentHash;
                    
                    layerInfo = this.buildLayerInfoFromTransformData(currentTransformData, sourceNode);
                    if (layerInfo) {
                        this.updateLayerInfo(layerInfo);
                    }
                }
            }
        } catch (e) {
            console.warn("[Kontext Super Prompt] 检查图层更新时出错:", e);
        }
    }

    renderLayerList() {
        if (!this.layerInfo || !this.layerInfo.layers) {
            this.layerList.innerHTML = `
                <div style="color: #666; text-align: center; padding: 20px; font-size: 12px;">
                    暂无图层信息<br>请连接 🎨 LRPG Canvas 节点
                </div>
            `;
            return;
        }

        this.layerList.innerHTML = '';

        this.layerInfo.layers.forEach((layer, index) => {
            const layerItem = this.createLayerItem(layer, index);
            this.layerList.appendChild(layerItem);
        });
    }

    createLayerItem(layer, index) {
        const item = document.createElement('div');
        item.className = 'layer-item';
        item.style.cssText = `
            display: flex;
            align-items: center;
            padding: 8px;
            background: #2a2a2a;
            border: 1px solid #444;
            border-radius: 4px;
            margin-bottom: 4px;
            cursor: pointer;
            transition: all 0.2s;
        `;

        // 选择框
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.style.cssText = `
            margin-right: 8px;
            accent-color: #9C27B0;
        `;

        // 缩略图
        const thumbnail = document.createElement('div');
        thumbnail.style.cssText = `
            width: 32px;
            height: 32px;
            background: #333;
            border: 1px solid #555;
            border-radius: 3px;
            margin-right: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #888;
            font-size: 10px;
        `;

        if (layer.thumbnail) {
            const img = document.createElement('img');
            img.src = layer.thumbnail;
            img.style.cssText = `
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 2px;
            `;
            thumbnail.appendChild(img);
        } else {
            // 根据图层类型显示不同的图标
            const typeIcons = {
                '矩形': '⬜',
                '圆形': '⭕',
                '椭圆': '🟢', 
                '三角形': '🔺',
                '直线': '📏',
                '图片': '🖼️',
                '文字': '📝',
                '文本': '📝',
                '文本框': '📄',
                '组合': '📂'
            };
            thumbnail.textContent = typeIcons[layer.type] || '📄';
        }

        // 图层信息
        const info = document.createElement('div');
        info.style.cssText = `
            flex: 1;
            min-width: 0;
        `;

        const name = document.createElement('div');
        name.style.cssText = `
            color: #fff;
            font-size: 11px;
            font-weight: bold;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        `;
        name.textContent = layer.name || `图层 ${index + 1}`;

        const details = document.createElement('div');
        details.style.cssText = `
            color: #888;
            font-size: 9px;
        `;
        const typeText = layer.type ? `${layer.type} | ` : '';
        details.textContent = `${typeText}Z:${layer.z_index || index} | ${layer.visible ? '👁️' : '👁️‍🗨️'} | ${layer.locked ? '🔒' : '🔓'}`;

        info.appendChild(name);
        info.appendChild(details);

        item.appendChild(checkbox);
        item.appendChild(thumbnail);
        item.appendChild(info);

        // 点击事件
        item.addEventListener('click', (e) => {
            if (e.target !== checkbox) {
                checkbox.checked = !checkbox.checked;
            }
            this.updateSelectedLayers();
            this.updateItemAppearance(item, checkbox.checked);
        });

        checkbox.addEventListener('change', () => {
            this.updateSelectedLayers();
            this.updateItemAppearance(item, checkbox.checked);
        });

        return item;
    }

    updateItemAppearance(item, selected) {
        if (selected) {
            item.style.background = '#3a2a4a';
            item.style.borderColor = '#9C27B0';
        } else {
            item.style.background = '#2a2a2a';
            item.style.borderColor = '#444';
        }
    }

    updateSelectedLayers() {
        const checkboxes = this.layerList.querySelectorAll('input[type="checkbox"]');
        this.selectedLayers = [];
        
        checkboxes.forEach((checkbox, index) => {
            if (checkbox.checked && this.layerInfo?.layers[index]) {
                this.selectedLayers.push({
                    index: index,
                    layer: this.layerInfo.layers[index]
                });
            }
        });

        this.updateLayerCountDisplay();
        this.notifyNodeUpdate();
    }

    updateLayerCountDisplay() {
        // 图层计数显示已移除，此函数保留为空以防止错误
        if (this.layerCountDisplay) {
            const total = this.layerInfo?.layers?.length || 0;
            const selected = this.selectedLayers.length;
            this.layerCountDisplay.textContent = `已选择 ${selected}/${total} 图层`;
        }
    }

    toggleSelectAll() {
        const checkboxes = this.layerList.querySelectorAll('input[type="checkbox"]');
        const allSelected = Array.from(checkboxes).every(cb => cb.checked);
        
        checkboxes.forEach((checkbox, index) => {
            checkbox.checked = !allSelected;
            const item = checkbox.closest('.layer-item');
            this.updateItemAppearance(item, checkbox.checked);
        });
        
        this.updateSelectedLayers();
    }

    refreshLayerInfo() {
        console.log("[Kontext Super Prompt] 手动刷新图层信息");
        
        // 显示加载状态
        this.layerList.innerHTML = `
            <div style="color: #888; text-align: center; padding: 20px; font-size: 11px; line-height: 1.4;">
                <div style="margin-bottom: 8px;">🔄 正在刷新图层信息...</div>
            </div>
        `;
        
        // 清除现有的定时器
        if (this.layerCheckInterval) {
            clearInterval(this.layerCheckInterval);
            this.layerCheckInterval = null;
        }
        
        // 重新获取数据
        this.tryGetLayerInfoFromConnectedNode();
        
        // 如果还是没有数据，显示详细提示信息
        setTimeout(() => {
            if (!this.layerInfo || !this.layerInfo.layers || this.layerInfo.layers.length === 0) {
                this.layerList.innerHTML = `
                    <div style="color: #888; text-align: center; padding: 20px; font-size: 11px; line-height: 1.4;">
                        <div style="margin-bottom: 8px;">⚠️ 未检测到图层信息</div>
                        <div style="font-size: 10px; color: #666; margin-bottom: 12px;">
                            请检查以下几点：<br>
                            • 是否已连接 🎨 LRPG Canvas 节点<br>
                            • 画布中是否有图层对象<br>
                            • 尝试点击刷新按钮重新获取
                        </div>
                        <button onclick="this.closest('.kontext-super-prompt-container').querySelector('.kontext-super-prompt').refreshLayerInfo()" 
                                style="padding: 6px 12px; background: #4CAF50; color: white; border: none; border-radius: 4px; font-size: 11px; cursor: pointer;">
                            🔄 重新获取
                        </button>
                        <div style="margin-top: 8px; font-size: 9px; color: #555;">
                            调试信息请查看浏览器控制台
                        </div>
                    </div>
                `;
            }
        }, 2000);
    }

    generateSuperPrompt() {
        console.log("[Kontext Super Prompt] ==================== 开始生成超级提示词 ====================");
        
        // 首先强制更新选择状态，确保与UI一致
        this.forceUpdateSelections();
        
        console.log("[Kontext Super Prompt] 当前状态详情:");
        console.log("  - 编辑模式:", this.currentEditMode);
        console.log("  - 操作类型:", this.currentOperationType);
        console.log("  - 描述:", `"${this.description}"`);
        console.log("  - 约束提示词数量:", this.selectedConstraints?.length || 0);
        console.log("  - 约束提示词内容:", this.selectedConstraints);
        console.log("  - 修饰提示词数量:", this.selectedDecoratives?.length || 0);
        console.log("  - 修饰提示词内容:", this.selectedDecoratives);
        
        // 设置标志位，防止在生成期间重新加载提示词
        this.isGeneratingPrompt = true;
        console.log("[Kontext Super Prompt] 设置生成保护标志位 - 开始生成");
        
        // 收集所有数据，将中文提示词转换为英文
        const constraintPromptsEnglish = translatePromptsToEnglish(this.selectedConstraints || []);
        const decorativePromptsEnglish = translatePromptsToEnglish(this.selectedDecoratives || []);
        console.log("[Kontext Super Prompt] 翻译结果:");
        console.log("  - 英文约束提示词:", constraintPromptsEnglish);
        console.log("  - 英文修饰提示词:", decorativePromptsEnglish);
        
        // 生成综合提示词
        let generatedPromptParts = [];
        
        console.log("[Kontext Super Prompt] 开始组装提示词部分:");
        
        // 添加操作类型模板（如果有模板，则使用模板并集成描述；否则只使用描述）
        if (this.currentOperationType && OPERATION_TEMPLATES[this.currentOperationType]) {
            const template = OPERATION_TEMPLATES[this.currentOperationType];
            console.log(`  - 找到操作类型模板: ${this.currentOperationType}`, template);
            
            if (template.template) {
                // 如果有描述，将其整合到模板中
                if (this.description && this.description.trim()) {
                    // 替换模板中的占位符
                    let processedTemplate = template.template
                        .replace('{object}', 'selected area')
                        .replace('{target}', this.description.trim());
                    console.log(`  - 使用模板+描述: "${processedTemplate}"`);
                    generatedPromptParts.push(processedTemplate);
                } else {
                    // 如果没有描述，使用默认值
                    let defaultTemplate = template.template
                        .replace('{object}', 'selected area')
                        .replace('{target}', 'desired effect');
                    console.log(`  - 使用默认模板: "${defaultTemplate}"`);
                    generatedPromptParts.push(defaultTemplate);
                }
            }
        } else if (this.description && this.description.trim()) {
            // 如果没有模板但有描述，直接添加描述
            console.log(`  - 没有模板，直接使用描述: "${this.description.trim()}"`);
            generatedPromptParts.push(this.description.trim());
        } else {
            console.log("  - 没有模板且没有描述，跳过主要部分");
        }
        
        // 添加修饰性提示词
        if (decorativePromptsEnglish.length > 0) {
            console.log(`  - 添加 ${decorativePromptsEnglish.length} 个修饰提示词:`, decorativePromptsEnglish);
            generatedPromptParts.push(...decorativePromptsEnglish);
        } else {
            console.log("  - 没有修饰提示词");
        }
        
        // 添加约束性提示词
        if (constraintPromptsEnglish.length > 0) {
            console.log(`  - 添加 ${constraintPromptsEnglish.length} 个约束提示词:`, constraintPromptsEnglish);
            generatedPromptParts.push(...constraintPromptsEnglish);
        } else {
            console.log("  - 没有约束提示词");
        }
        
        // 生成最终提示词
        this.generatedPrompt = generatedPromptParts.join(', ');
        console.log("[Kontext Super Prompt] 生成的提示词部分:", generatedPromptParts);
        console.log("[Kontext Super Prompt] 最终生成的提示词:", this.generatedPrompt);
        
        // 验证生成后状态完整性
        console.log("[Kontext Super Prompt] ==================== 状态完整性检查 ====================");
        console.log("  - 生成后约束提示词状态:", this.selectedConstraints);
        console.log("  - 生成后修饰提示词状态:", this.selectedDecoratives);
        console.log("  - 生成后描述状态:", `"${this.description}"`);
        console.log("  - 生成后操作类型状态:", this.currentOperationType);
        
        // 如果没有生成任何内容，提供一个默认提示
        if (!this.generatedPrompt || this.generatedPrompt.trim() === '') {
            this.generatedPrompt = 'Please describe the changes you want to make or select some options above';
            console.log("[Kontext Super Prompt] 没有生成内容，使用默认提示");
        }
        
        // 更新所有预览文本框
        this.updateAllPreviewTextareas();
        console.log("[Kontext Super Prompt] 已更新所有预览文本框");
        
        const promptData = {
            edit_mode: this.currentEditMode,
            operation_type: this.currentOperationType,
            description: this.description,
            constraint_prompts: constraintPromptsEnglish.join('\n'),
            decorative_prompts: decorativePromptsEnglish.join('\n'),
            selected_layers: JSON.stringify(this.selectedLayers),
            auto_generate: this.autoGenerate,
            generated_prompt: this.generatedPrompt
        };

        // 更新节点widget值
        this.updateNodeWidgets(promptData);
        
        // 强制触发节点序列化，确保数据传递到后端
        if (this.node.serialize) {
            const serializedData = this.node.serialize();
            console.log('[Kontext Super Prompt] 强制序列化结果:', serializedData);
        }
        
        // 通知节点图更新
        if (this.node.graph) {
            this.node.graph.change();
        }
        
        // 清除标志位
        this.isGeneratingPrompt = false;
        console.log("[Kontext Super Prompt] 清除生成保护标志位 - 生成完成");
        
        // 通知生成完成
        this.showNotification("超级提示词已生成！", "success");
    }

    updateNodeWidgets(data) {
        // 创建或更新隐藏的widget来传递数据给后端
        this.createHiddenWidgets(data);
        
        // 将数据存储到节点属性中，供serialize方法使用
        this.node._kontextData = data;
        
        this.notifyNodeUpdate();
    }
    
    createHiddenWidgets(data) {
        // 确保节点有widgets数组
        if (!this.node.widgets) {
            this.node.widgets = [];
        }
        
        // 定义要传递的数据字段
        const widgetFields = [
            { name: 'edit_mode', value: data.edit_mode || '局部编辑' },
            { name: 'operation_type', value: data.operation_type || '' },
            { name: 'description', value: data.description || '' },
            { name: 'constraint_prompts', value: data.constraint_prompts || '' },
            { name: 'decorative_prompts', value: data.decorative_prompts || '' },
            { name: 'selected_layers', value: data.selected_layers || '' },
            { name: 'auto_generate', value: data.auto_generate !== false },
            { name: 'generated_prompt', value: data.generated_prompt || '' }
        ];
        
        // 创建或更新widget
        widgetFields.forEach((field, index) => {
            if (!this.node.widgets[index]) {
                // 创建新的widget
                this.node.widgets[index] = {
                    name: field.name,
                    value: field.value,
                    type: typeof field.value === 'boolean' ? 'toggle' : 'text',
                    options: {},
                    callback: () => {}
                };
            } else {
                // 更新现有widget的值
                this.node.widgets[index].value = field.value;
            }
        });
        
        console.log('[Kontext Super Prompt] 隐藏widget已更新:', this.node.widgets.map(w => ({ name: w.name, value: w.value })));
    }

    copyToClipboard() {
        // 复制预览文本框中的内容，如果为空则复制详细信息
        const copyText = this.generatedPrompt && this.generatedPrompt.trim() 
            ? this.generatedPrompt 
            : [
                `编辑模式: ${this.currentEditMode}`,
                `操作类型: ${this.currentOperationType}`,
                `描述: ${this.description}`,
                `约束性提示词: ${this.selectedConstraints.join(', ')}`,
                `修饰性提示词: ${this.selectedDecoratives.join(', ')}`,
                `选中图层: ${this.selectedLayers.length}个`
            ].join('\n');

        navigator.clipboard.writeText(copyText).then(() => {
            this.showNotification("已复制到剪贴板", "success");
        }).catch(() => {
            this.showNotification("复制失败", "error");
        });
    }

    notifyNodeUpdate() {
        // 通知ComfyUI节点需要更新
        if (this.node.onResize) {
            this.node.onResize();
        }
        
        app.graph.change();
    }

    updateNodeSize() {
        const nodeWidth = 816; // 1020 * 0.8 - 减小20%
        const nodeHeight = 750; // EDITOR_SIZE.HEIGHT + 50
        
        // 强制更新节点大小
        this.node.size = [nodeWidth, nodeHeight];
        
        if (this.node.setSize) {
            this.node.setSize([nodeWidth, nodeHeight]);
        }
        
        // 触发重绘
        if (this.node.setDirtyCanvas) {
            this.node.setDirtyCanvas(true, true);
        }
        
        // 通知ComfyUI节点大小已更改
        if (this.node.onResize) {
            this.node.onResize([nodeWidth, nodeHeight]);
        }
        
        // 如果有画布，通知画布更新
        if (this.node.graph && this.node.graph.canvas) {
            this.node.graph.canvas.setDirty(true, true);
        }
    }

    getEditorData() {
        return {
            currentEditMode: this.currentEditMode,
            currentCategory: this.currentCategory,
            currentOperationType: this.currentOperationType,
            description: this.description,
            selectedConstraints: this.selectedConstraints,
            selectedDecoratives: this.selectedDecoratives,
            selectedLayers: this.selectedLayers,
            autoGenerate: this.autoGenerate,
            generatedPrompt: this.generatedPrompt  // 添加生成的提示词
        };
    }

    setEditorData(data) {
        if (!data) return;
        
        this.currentEditMode = data.currentEditMode || "局部编辑";
        this.currentCategory = data.currentCategory || 'local';
        this.currentOperationType = data.currentOperationType || '';
        this.description = data.description || '';
        this.selectedConstraints = data.selectedConstraints || [];
        this.selectedDecoratives = data.selectedDecoratives || [];
        this.selectedLayers = data.selectedLayers || [];
        this.autoGenerate = data.autoGenerate !== false;
        this.generatedPrompt = data.generatedPrompt || '';  // 添加生成的提示词
        
        // 更新界面显示
        this.updateUI();
    }

    updateUI() {
        // 如果正在生成提示词，跳过UI更新以避免清空选择状态
        if (this.isGeneratingPrompt) {
            console.log('[Kontext Super Prompt] 正在生成提示词，跳过UI更新避免清空选择状态');
            return;
        }
        
        // 更新描述文本区域
        if (this.descriptionTextarea) {
            this.descriptionTextarea.value = this.description;
        }
        
        // 更新自动生成开关
        if (this.autoGenCheckbox) {
            this.autoGenCheckbox.checked = this.autoGenerate;
        }
        
        // 更新标签选择
        if (this.currentCategory) {
            this.switchTab(this.currentCategory);
        }
        
        // 更新操作类型选择
        this.updateOperationButtons();
        
        // 更新图层计数显示
        this.updateLayerCountDisplay();
    }

    updateAllPreviewTextareas() {
        // 更新所有预览文本框的值
        if (this.previewTextareas && this.previewTextareas.length > 0) {
            this.previewTextareas.forEach(textarea => {
                if (textarea && textarea.value !== this.generatedPrompt) {
                    textarea.value = this.generatedPrompt || '';
                }
            });
        }
    }
    
    updateAllDescriptionTextareas() {
        // 更新所有面板的描述输入框
        const allDescriptionTextareas = this.editorContainer.querySelectorAll('.description-section textarea');
        allDescriptionTextareas.forEach(textarea => {
            if (textarea && textarea.value !== this.description) {
                textarea.value = this.description || '';
            }
        });
    }

    showNotification(message, type = "info") {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'warning' ? '#FF9800' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 12px 16px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 10000;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            animation: slideInRight 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// 注册节点到ComfyUI
app.registerExtension({
    name: "KontextSuperPrompt",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "KontextSuperPrompt") {
            const onNodeCreated = nodeType.prototype.onNodeCreated;
            
            nodeType.prototype.onNodeCreated = function () {
                if (onNodeCreated) {
                    onNodeCreated.apply(this, arguments);
                }
                
                // 移除所有默认的widget控件
                this.widgets = [];
                
                // 设置节点初始大小
                const nodeWidth = 816; // 1020 * 0.8 - 减小20%
                const nodeHeight = 750; // EDITOR_SIZE.HEIGHT + 50
                this.size = [nodeWidth, nodeHeight];
                
                // 创建超级提示词编辑器实例
                this.kontextSuperPrompt = new KontextSuperPrompt(this);
                
                // 重写computeSize方法确保正确的节点大小
                this.computeSize = function() {
                    return [nodeWidth, nodeHeight];
                };
                
                // 重写onResize方法
                const originalOnResize = this.onResize;
                this.onResize = function(size) {
                    if (originalOnResize) {
                        originalOnResize.apply(this, arguments);
                    }
                    
                    // 确保最小尺寸
                    if (size) {
                        size[0] = Math.max(size[0], nodeWidth);
                        size[1] = Math.max(size[1], nodeHeight);
                    }
                    
                    return size;
                };
                
                // 强制设置节点为不可调整大小（可选）
                this.resizable = false;
                
                // 确保节点立即应用大小
                if (this.setSize) {
                    this.setSize([nodeWidth, nodeHeight]);
                }
                
                // 监听输入变化
                const onConnectionsChange = this.onConnectionsChange;
                this.onConnectionsChange = function(type, index, connected, link_info) {
                    if (onConnectionsChange) {
                        onConnectionsChange.apply(this, arguments);
                    }
                    
                    console.log("[Kontext Super Prompt] 连接变化:", { type, index, connected, link_info });
                    
                    // 当layer_info输入连接时，更新图层信息
                    if (type === 1 && index === 0 && connected) { // input, layer_info, connected
                        console.log("[Kontext Super Prompt] Layer info输入已连接");
                        setTimeout(() => {
                            this.updateLayerInfo();
                        }, 100);
                        
                        // 同时尝试获取实时数据
                        setTimeout(() => {
                            this.kontextSuperPrompt.tryGetLayerInfoFromConnectedNode();
                        }, 500);
                    }
                };
                
                // 监听节点执行完成事件
                const originalOnExecuted = this.onExecuted;
                this.onExecuted = function(message) {
                    if (originalOnExecuted) {
                        originalOnExecuted.apply(this, arguments);
                    }
                    
                    console.log("[Kontext Super Prompt] 节点执行完成:", message);
                    
                    // 从执行结果中提取图层信息
                    if (message && message.text) {
                        try {
                            let layerData = null;
                            
                            // message.text可能是字符串数组
                            if (Array.isArray(message.text)) {
                                for (let textItem of message.text) {
                                    if (typeof textItem === 'string' && textItem.includes('layers')) {
                                        layerData = JSON.parse(textItem);
                                        break;
                                    }
                                }
                            } else if (typeof message.text === 'string' && message.text.includes('layers')) {
                                layerData = JSON.parse(message.text);
                            }
                            
                            if (layerData) {
                                console.log("[Kontext Super Prompt] 从执行结果解析图层数据:", layerData);
                                this.kontextSuperPrompt.updateLayerInfo(layerData);
                            }
                        } catch (e) {
                            console.warn("[Kontext Super Prompt] 解析图层数据失败:", e);
                        }
                    }
                };
                
                // 更新图层信息的方法
                this.updateLayerInfo = function() {
                    console.log("[Kontext Super Prompt] 尝试更新图层信息...");
                    
                    if (this.inputs[0] && this.inputs[0].link) {
                        const link = app.graph.links[this.inputs[0].link];
                        console.log("[Kontext Super Prompt] 找到连接链接:", link);
                        
                        if (link) {
                            const sourceNode = app.graph.getNodeById(link.origin_id);
                            console.log("[Kontext Super Prompt] 源节点:", sourceNode);
                            console.log("[Kontext Super Prompt] 源节点类型:", sourceNode?.type);
                            
                            if (sourceNode) {
                                console.log("[Kontext Super Prompt] 源节点属性:", sourceNode.properties);
                                console.log("[Kontext Super Prompt] 源节点输出:", sourceNode.outputs);
                                
                                // 尝试多种方式获取图层信息
                                let layerInfo = null;
                                
                                // 方式1: 从最近的执行输出获取
                                if (sourceNode.last_output) {
                                    console.log("[Kontext Super Prompt] 检查最近输出:", sourceNode.last_output);
                                    if (sourceNode.last_output.length > 1) {
                                        try {
                                            const layerInfoOutput = sourceNode.last_output[1]; // 第二个输出是layer_info
                                            if (typeof layerInfoOutput === 'string') {
                                                layerInfo = JSON.parse(layerInfoOutput);
                                            } else {
                                                layerInfo = layerInfoOutput;
                                            }
                                            console.log("[Kontext Super Prompt] 从last_output获取到图层信息:", layerInfo);
                                        } catch (e) {
                                            console.warn("[Kontext Super Prompt] 解析last_output失败:", e);
                                        }
                                    }
                                }
                                
                                // 方式2: 从properties获取
                                if (!layerInfo && sourceNode.properties && sourceNode.properties.layer_info) {
                                    layerInfo = sourceNode.properties.layer_info;
                                    console.log("[Kontext Super Prompt] 从properties获取到图层信息:", layerInfo);
                                }
                                
                                // 方式3: 从widget值获取（新增）
                                if (!layerInfo && sourceNode.widgets) {
                                    for (let widget of sourceNode.widgets) {
                                        if (widget.name === 'layer_info' && widget.value) {
                                            try {
                                                layerInfo = typeof widget.value === 'string' ? JSON.parse(widget.value) : widget.value;
                                                console.log("[Kontext Super Prompt] 从widget获取到图层信息:", layerInfo);
                                                break;
                                            } catch (e) {
                                                console.warn("[Kontext Super Prompt] 解析widget值失败:", e);
                                            }
                                        }
                                    }
                                }
                                
                                // 方式4: 监听WebSocket消息（新增）
                                this.listenToWebSocketMessages(sourceNode);
                                
                                // 方式5: 从节点的内部数据获取
                                if (!layerInfo && sourceNode.lrpgCanvas) {
                                    this.kontextSuperPrompt.tryGetLayerInfoFromConnectedNode();
                                    return; // 让tryGetLayerInfoFromConnectedNode处理
                                }
                                
                                if (layerInfo) {
                                    console.log("[Kontext Super Prompt] 成功获取图层信息，更新界面:", layerInfo);
                                    this.kontextSuperPrompt.updateLayerInfo(layerInfo);
                                } else {
                                    console.warn("[Kontext Super Prompt] 未找到图层信息，尝试其他方法");
                                    this.kontextSuperPrompt.tryGetLayerInfoFromConnectedNode();
                                }
                            }
                        }
                    } else {
                        console.log("[Kontext Super Prompt] 没有layer_info输入连接");
                    }
                };
                
                // 监听WebSocket消息以获取实时数据
                this.listenToWebSocketMessages = function(sourceNode) {
                    if (this._wsListenerAdded) return;
                    this._wsListenerAdded = true;
                    
                    // 监听WebSocket消息
                    if (api.addEventListener) {
                        api.addEventListener("executed", (event) => {
                            console.log("[Kontext Super Prompt] 监听到executed事件:", event);
                            
                            if (event.detail && event.detail.node === sourceNode.id.toString()) {
                                console.log("[Kontext Super Prompt] 匹配的节点执行:", event.detail);
                                
                                if (event.detail.output) {
                                    // 查找layer_info输出
                                    if (event.detail.output.layer_info) {
                                        let layerInfo = event.detail.output.layer_info;
                                        if (typeof layerInfo === 'string') {
                                            try {
                                                layerInfo = JSON.parse(layerInfo);
                                            } catch (e) {
                                                console.warn("[Kontext Super Prompt] 解析WebSocket数据失败:", e);
                                                return;
                                            }
                                        }
                                        
                                        console.log("[Kontext Super Prompt] 从WebSocket获取图层信息:", layerInfo);
                                        this.kontextSuperPrompt.updateLayerInfo(layerInfo);
                                    }
                                }
                            }
                        });
                    }
                };
                
                // 重写getExtraMenuOptions以防止显示widget选项
                this.getExtraMenuOptions = function(_, options) {
                    return options;
                };
                
                // 隐藏widget数据传递方式，不再需要复杂的serialize重写
                console.log('[Kontext Super Prompt] 使用隐藏widget数据传递机制');
            };
        }
    }
});

console.log("[Kontext Super Prompt] 🎯 Kontext超级提示词编辑器前端已加载");