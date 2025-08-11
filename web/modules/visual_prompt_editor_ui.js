/**
 * Visual Prompt Editor - UI组件模块
 * 负责创建和管理UI界面组件
 */

import { t, getCurrentLanguage, toggleLanguage, updateAllUITexts, loadLanguageFromStorage } from './visual_prompt_editor_i18n.js';
import { updateOperationTypeSelect, Z_INDEX, MODAL_STYLES, applyStyles } from './visual_prompt_editor_utils.js';

/**
 * DOM查询缓存管理器
 * 🔧 减少重复DOM查询以提高性能
 */
class DOMCache {
    constructor(modal) {
        this.modal = modal;
        this.cache = new Map();
        this.batchOperations = [];
    }
    
    /**
     * 获取缓存的DOM元素
     */
    get(selector) {
        if (!this.cache.has(selector)) {
            this.cache.set(selector, this.modal.querySelector(selector));
        }
        return this.cache.get(selector);
    }
    
    /**
     * 批量获取多个DOM元素
     */
    getMultiple(selectors) {
        const result = {};
        selectors.forEach(selector => {
            const key = selector.replace(/[^a-zA-Z0-9]/g, '_');
            result[key] = this.get(selector);
        });
        return result;
    }
    
    /**
     * 清除缓存
     */
    clear() {
        this.cache.clear();
    }
    
    /**
     * 添加批量操作
     */
    addBatchOperation(operation) {
        this.batchOperations.push(operation);
    }
    
    /**
     * 执行批量操作
     */
    executeBatch() {
        if (this.batchOperations.length === 0) return;
        
        // 使用requestAnimationFrame批量执行
        requestAnimationFrame(() => {
            this.batchOperations.forEach(op => op());
            this.batchOperations = [];
        });
    }
}

/**
 * 创建优化的DOM缓存实例
 */
export function createDOMCache(modal) {
    return new DOMCache(modal);
}

/**
 * 创建主模态弹窗
 */
export function createMainModal() {
    const modal = document.createElement('div');
    modal.id = 'unified-editor-modal'; // 使用与原始版本相同的ID
    
    // 应用统一的Modal overlay样式
    applyStyles(modal, MODAL_STYLES.overlay);
    modal.style.zIndex = Z_INDEX.MODAL;
    
    const globalStyle = document.createElement('style');
    globalStyle.textContent = `
        #unified-editor-modal * {
            box-sizing: border-box !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        }
        #unified-editor-modal button {
            border: none !important;
            outline: none !important;
            cursor: pointer !important;
        }
        #unified-editor-modal button:focus {
            outline: none !important;
        }
    `;
    document.head.appendChild(globalStyle);
    
    const content = document.createElement('div');
    content.style.cssText = `
        width: 98%; height: 95%; background: #1a1a1a;
        border-radius: 12px; display: flex; flex-direction: column;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.1);
        overflow: hidden;
    `;
    
    modal.appendChild(content);
    return { modal, content };
}

/**
 * 创建顶部标题栏
 */
export function createTitleBar() {
    const titleBar = document.createElement('div');
    titleBar.style.cssText = `
        background: linear-gradient(135deg, #673AB7, #9C27B0);
        color: white; padding: 16px 24px; display: flex;
        justify-content: space-between; align-items: center;
        border-top-left-radius: 12px; border-top-right-radius: 12px;
    `;
    
    titleBar.innerHTML = `
        <div style="display: flex; align-items: center; gap: 16px;">
            <span style="font-size: 24px;">🎨</span>
            <span style="font-weight: 700; font-size: 20px;" data-i18n="title">Visual Prompt Editor</span>
            <span style="background: rgba(255, 255, 255, 0.15); padding: 4px 12px; border-radius: 20px; font-size: 11px; opacity: 0.9;" data-i18n="subtitle">
                Unified Annotation & Prompt Generation
            </span>
        </div>
        <div style="display: flex; gap: 12px;">
            <button id="vpe-language-toggle" style="background: #2196F3; border: none; color: white; padding: 10px 16px; border-radius: 6px; cursor: pointer; font-weight: 600; transition: all 0.2s;" data-i18n="language_switch">
                🌐 中文
            </button>
            <button id="vpe-save" style="background: #4CAF50; border: none; color: white; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 600; transition: all 0.2s;" data-i18n="save_apply">
                💾 Save & Apply
            </button>
            <button id="vpe-close" style="background: #f44336; border: none; color: white; padding: 10px 16px; border-radius: 6px; cursor: pointer; font-weight: 600; transition: all 0.2s;" data-i18n="close">
                ✕ Close
            </button>
        </div>
    `;
    
    return titleBar;
}

/**
 * 创建工具栏
 */
export function createToolbar() {
    const toolbar = document.createElement('div');
    toolbar.style.cssText = `
        background: #333; border-bottom: 1px solid #404040; padding: 12px 16px;
        display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
    `;
    
    toolbar.innerHTML = `
        <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap; min-height: 32px; width: 100%;">
            <!-- 绘制工具组 -->
            <div style="display: flex; gap: 4px; align-items: center; border-right: 1px solid #555; padding-right: 8px;">
                <span style="color: #ccc; font-size: 11px;" data-i18n="tools">Tools:</span>
                <button class="vpe-tool active" data-tool="select" title="Select and Transform (Hold Ctrl to multi-select)" data-i18n-title="tooltip_select" style="background: #4CAF50; color: white;">👆</button>
                <button class="vpe-tool" data-tool="rectangle" title="Rectangle" data-i18n-title="tooltip_rectangle">📐</button>
                <button class="vpe-tool" data-tool="circle" title="Circle" data-i18n-title="tooltip_circle">⭕</button>
                <button class="vpe-tool" data-tool="polygon" title="Polygon (Left click to add points, Right click to finish)" data-i18n-title="tooltip_polygon">🔷</button>
                <button class="vpe-tool" data-tool="text" title="Text Tool (Click to add text)" data-i18n-title="tooltip_text">📝</button>
                <button class="vpe-tool" data-tool="freehand" title="Freehand Drawing" data-i18n-title="tooltip_freehand">✏️</button>
                <button class="vpe-tool" data-tool="crop" title="Custom Crop (Left click to add points, Right click to close, Enter to apply)" data-i18n-title="tooltip_crop">✂️</button>
            </div>
            
            <!-- 操作工具组 -->
            <div style="display: flex; gap: 4px; align-items: center; border-right: 1px solid #555; padding-right: 8px;">
                <span style="color: #ccc; font-size: 11px;" data-i18n="actions">Actions:</span>
                <button id="vpe-lock-toggle" title="Lock/Unlock Selected Objects" data-i18n-title="tooltip_lock" style="background: #555; color: white; border: none; border-radius: 3px; cursor: pointer; padding: 4px 8px; font-size: 11px; height: 24px;">🔓</button>
            </div>
            
            <!-- 颜色选择组 -->
            <div style="display: flex; gap: 6px; align-items: center; border-right: 1px solid #555; padding-right: 8px;">
                <span style="color: #ccc; font-size: 11px;" data-i18n="color">Color:</span>
                <input type="color" id="vpe-color-picker" value="#ff0000" 
                       style="width: 32px; height: 24px; border: 2px solid #fff; border-radius: 4px; cursor: pointer; background: none;" 
                       title="Choose annotation color" data-i18n-title="tooltip_color_picker">
            </div>
            
            <!-- 编辑操作组 -->
            <div style="display: flex; gap: 4px; align-items: center; border-right: 1px solid #555; padding-right: 8px;">
                <span style="color: #ccc; font-size: 11px;" data-i18n="edit">Edit:</span>
                <button id="vpe-undo" title="Undo" data-i18n-title="tooltip_undo" style="background: #555; color: white; border: none; border-radius: 3px; cursor: pointer; padding: 4px 8px; font-size: 11px; height: 24px; opacity: 0.5;" disabled>↶</button>
                <button id="vpe-redo" title="Redo" data-i18n-title="tooltip_redo" style="background: #555; color: white; border: none; border-radius: 3px; cursor: pointer; padding: 4px 8px; font-size: 11px; height: 24px; opacity: 0.5;" disabled>↷</button>
                <button id="vpe-clear" style="font-size: 11px; padding: 4px 8px;" title="Clear All" data-i18n="btn_clear" data-i18n-title="tooltip_clear">🗂️ Clear</button>
            </div>
            
            <!-- 填充样式组 -->
            <div style="display: flex; gap: 4px; align-items: center; border-right: 1px solid #555; padding-right: 8px;">
                <span style="color: #ccc; font-size: 11px;" data-i18n="fill">Fill:</span>
                <button id="vpe-fill-toggle" style="font-size: 11px; padding: 4px 8px;" title="Toggle between filled and outline annotations" data-i18n="btn_filled" data-i18n-title="tooltip_fill_toggle">🔴 Filled</button>
            </div>
            
            <!-- 不透明度控制组 -->
            <div style="display: flex; gap: 6px; align-items: center; border-right: 1px solid #555; padding-right: 8px;">
                <span style="color: #ccc; font-size: 11px;" data-i18n="opacity">Opacity:</span>
                <input type="range" id="vpe-opacity-slider" min="10" max="100" value="50" 
                       style="width: 80px; height: 20px; background: #333; outline: none; cursor: pointer;" 
                       title="Adjust annotation opacity (10-100%)" data-i18n-title="tooltip_opacity">
                <span id="vpe-opacity-value" style="color: #aaa; font-size: 10px; min-width: 30px; text-align: center;">50%</span>
            </div>
            
            <!-- 画布视图缩放控制组 -->
            <div style="display: flex; gap: 4px; align-items: center; border-right: 1px solid #555; padding-right: 8px;">
                <span style="color: #ccc; font-size: 11px;" data-i18n="canvas_view">View:</span>
                <button id="vpe-zoom-out" style="font-size: 11px; padding: 4px 8px; background: #555; color: white; border: none; border-radius: 3px; cursor: pointer;" title="Zoom Out Canvas View" data-i18n-title="tooltip_zoom_out">🔍-</button>
                <span id="zoom-display" style="color: #aaa; font-size: 10px; min-width: 40px; text-align: center;">100%</span>
                <button id="vpe-zoom-in" style="font-size: 11px; padding: 4px 8px; background: #555; color: white; border: none; border-radius: 3px; cursor: pointer;" title="Zoom In Canvas View" data-i18n-title="tooltip_zoom_in">🔍+</button>
                <button id="vpe-zoom-reset" style="font-size: 11px; padding: 4px 8px; background: #555; color: white; border: none; border-radius: 3px; cursor: pointer;" title="Reset Canvas View to 100%" data-i18n-title="tooltip_zoom_reset">1:1</button>
                <button id="vpe-zoom-fit" style="font-size: 11px; padding: 4px 8px; background: #555; color: white; border: none; border-radius: 3px; cursor: pointer;" title="Fit Canvas View to Window" data-i18n-title="tooltip_zoom_fit">📐</button>
            </div>
            
            <!-- 画笔控制组 -->
            <div id="vpe-brush-controls" style="display: none; gap: 6px; align-items: center; border-right: 1px solid #555; padding-right: 8px;">
                <span style="color: #ccc; font-size: 11px;" data-i18n="brush">Brush:</span>
                <span style="color: #aaa; font-size: 10px;" data-i18n="size">Size:</span>
                <input type="range" id="vpe-brush-size" min="5" max="50" value="20" 
                       style="width: 60px; height: 20px; background: #333; outline: none; cursor: pointer;" 
                       title="Adjust brush size (5-50px)" data-i18n-title="tooltip_brush_size">
                <span id="vpe-brush-size-value" style="color: #aaa; font-size: 10px; min-width: 25px; text-align: center;">20px</span>
                <span style="color: #aaa; font-size: 10px;" data-i18n="feather">Feather:</span>
                <input type="range" id="vpe-brush-feather" min="0" max="20" value="5" 
                       style="width: 60px; height: 20px; background: #333; outline: none; cursor: pointer;" 
                       title="Adjust brush feather/softness (0-20px)" data-i18n-title="tooltip_brush_feather">
                <span id="vpe-brush-feather-value" style="color: #aaa; font-size: 10px; min-width: 25px; text-align: center;">5px</span>
            </div>
            
            <!-- 画布背景设置组 -->
            <div style="display: flex; gap: 6px; align-items: center; border-right: 1px solid #555; padding-right: 8px;">
                <span style="color: #ccc; font-size: 11px;" data-i18n="canvas">Canvas:</span>
                <input type="color" id="vpe-bg-color" value="#ffffff" 
                       style="width: 32px; height: 24px; border: 2px solid #fff; border-radius: 4px; cursor: pointer; background: none;" 
                       title="Choose canvas background color" data-i18n-title="tooltip_bg_color">
            </div>
            
            <!-- 自定义画布尺寸控制组 -->
            <div id="vpe-custom-size-controls" style="display: flex; gap: 4px; align-items: center; border-right: 1px solid #555; padding-right: 8px;">
                <span style="color: #ccc; font-size: 11px;" data-i18n="size">Size:</span>
                <span style="color: #aaa; font-size: 10px;">W:</span>
                <input type="number" id="vpe-canvas-width" min="200" max="2048" value="800" step="10" 
                       style="width: 60px; font-size: 11px; padding: 2px 4px; background: #444; color: white; border: 1px solid #666; border-radius: 3px;" 
                       title="Canvas Width (200-2048px)" data-i18n-title="tooltip_canvas_width">
                <span style="color: #aaa; font-size: 10px;">H:</span>
                <input type="number" id="vpe-canvas-height" min="200" max="2048" value="600" step="10" 
                       style="width: 60px; font-size: 11px; padding: 2px 4px; background: #444; color: white; border: 1px solid #666; border-radius: 3px;" 
                       title="Canvas Height (200-2048px)" data-i18n-title="tooltip_canvas_height">
                <button id="vpe-apply-size" style="font-size: 10px; padding: 3px 6px; background: #4CAF50; color: white; border: none; border-radius: 3px; cursor: pointer;" 
                        title="Apply canvas size" data-i18n="btn_apply" data-i18n-title="tooltip_apply_size">Apply</button>
            </div>
            
            <!-- 文件上传控制组 -->
            <div style="display: flex; gap: 4px; align-items: center; border-right: 1px solid #555; padding-right: 8px;">
                <span style="color: #ccc; font-size: 11px;" data-i18n="upload">Upload:</span>
                <label for="vpe-image-upload" style="display: inline-block; cursor: pointer;">
                    <button type="button" id="vpe-upload-btn" style="font-size: 11px; padding: 4px 8px; background: #FF9800; color: white; border: none; border-radius: 3px; cursor: pointer;" 
                            title="Upload Image to Canvas" data-i18n="btn_upload" data-i18n-title="tooltip_upload_image">📁 Upload</button>
                </label>
                <input type="file" id="vpe-image-upload" accept="image/*" style="display: none;" title="Select image file to upload">
            </div>
            
            <!-- 内存监控组 -->
            <div style="display: flex; gap: 4px; align-items: center;">
                <button id="vpe-memory-monitor" style="font-size: 11px; padding: 4px 8px; background: #9C27B0; color: white; border: none; border-radius: 3px; cursor: pointer;" 
                        title="Show Memory Usage Report" data-i18n-title="tooltip_memory_monitor">🧹 Memory</button>
            </div>
        </div>
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        /* 基础按钮样式 */
        .vpe-tool, #vpe-undo, #vpe-clear, #vpe-fill-toggle, #vpe-zoom-fit, #vpe-zoom-100, #vpe-zoom-in, #vpe-zoom-out, #vpe-upload-btn, #vpe-lock-toggle {
            background: #555 !important;
            border: none !important;
            color: white !important;
            border-radius: 3px !important;
            cursor: pointer !important;
            transition: all 0.2s !important;
            white-space: nowrap !important;
        }
        
        /* 工具按钮 */
        .vpe-tool {
            padding: 4px 8px !important;
            font-size: 11px !important;
            height: 24px !important;
        }
        
        /* 工具按钮激活状态 */
        .vpe-tool.active {
            background: #4CAF50 !important;
            color: white !important;
            box-shadow: 0 0 8px rgba(76, 175, 80, 0.3) !important;
        }
        
        /* 编辑操作按钮 */
        #vpe-undo, #vpe-clear, #vpe-fill-toggle {
            padding: 4px 8px !important;
            font-size: 11px !important;
            height: 26px !important;
        }
        
        /* 视图控制按钮 */
        #vpe-zoom-fit, #vpe-zoom-100 {
            padding: 4px 8px !important;
            font-size: 11px !important;
            height: 26px !important;
        }
        
        #vpe-zoom-in, #vpe-zoom-out {
            padding: 4px 6px !important;
            font-size: 11px !important;
            height: 26px !important;
            min-width: 26px !important;
        }
        
        
        /* 颜色按钮 */
        .vpe-color {
            width: 22px !important;
            height: 22px !important;
            border-radius: 50% !important;
            cursor: pointer !important;
            transition: all 0.2s !important;
            position: relative !important;
            overflow: hidden !important;
            padding: 0 !important;
            border: 2px solid #666 !important;
        }
        
        /* 悬停效果 */
        .vpe-tool:hover, #vpe-undo:hover, #vpe-clear:hover, #vpe-fill-toggle:hover, #vpe-zoom-fit:hover, #vpe-zoom-100:hover, #vpe-zoom-in:hover, #vpe-zoom-out:hover, #vpe-lock-toggle:hover {
            background: #666 !important;
            transform: translateY(-1px) !important;
        }
        
        .vpe-color:hover {
            transform: scale(1.1) !important;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3) !important;
        }
        
        /* 激活状态 */
        .vpe-tool.active {
            background: #673AB7 !important;
            box-shadow: 0 0 4px rgba(103, 58, 183, 0.5) !important;
        }
        
        /* 填充切换按钮激活状态 */
        #vpe-fill-toggle.outline {
            background: #FF9800 !important;
            box-shadow: 0 0 4px rgba(255, 152, 0, 0.5) !important;
        }
        
        /* 不透明度滑块样式 */
        #vpe-opacity-slider {
            -webkit-appearance: none !important;
            appearance: none !important;
            background: #444 !important;
            border-radius: 10px !important;
            height: 4px !important;
            width: 80px !important;
            outline: none !important;
            cursor: pointer !important;
        }
        
        #vpe-opacity-slider::-webkit-slider-thumb {
            -webkit-appearance: none !important;
            appearance: none !important;
            width: 14px !important;
            height: 14px !important;
            border-radius: 50% !important;
            background: #4CAF50 !important;
            cursor: pointer !important;
            box-shadow: 0 0 4px rgba(76, 175, 80, 0.5) !important;
        }
        
        #vpe-opacity-slider::-moz-range-thumb {
            width: 14px !important;
            height: 14px !important;
            border-radius: 50% !important;
            background: #4CAF50 !important;
            cursor: pointer !important;
            border: none !important;
            box-shadow: 0 0 4px rgba(76, 175, 80, 0.5) !important;
        }
        
        #vpe-opacity-value {
            color: #aaa !important;
            font-size: 10px !important;
            min-width: 30px !important;
            text-align: center !important;
            font-weight: 500 !important;
        }
        
        .vpe-color.active {
            border-color: #fff !important;
            box-shadow: 0 0 6px rgba(255, 255, 255, 0.5) !important;
            transform: scale(1.1) !important;
        }
        
        
        /* 缩放级别显示 */
        #vpe-zoom-level {
            color: #aaa !important;
            background: transparent !important;
            min-width: 40px !important;
            text-align: center !important;
            padding: 2px 4px !important;
            font-weight: 500 !important;
        }
        
        /* 工具栏分组边框 */
        .toolbar-group {
            border-right: 1px solid #555 !important;
            padding-right: 8px !important;
        }
    `;
    document.head.appendChild(style);
    
    return toolbar;
}

/**
 * 创建主体区域
 */
export function createMainArea() {
    const mainArea = document.createElement('div');
    mainArea.style.cssText = `
        flex: 1; display: flex; background: #1e1e1e;
        overflow: hidden; min-height: 0;
    `;
    
    return mainArea;
}

/**
 * 创建左侧统一画布区域（新架构）
 * 替换旧的多容器系统，使用统一坐标系统
 */
export function createUnifiedCanvasArea(modal = null) {
    const canvasArea = document.createElement('div');
    canvasArea.style.cssText = `
        flex: 1; background: #2a2a2a; display: flex; flex-direction: column;
        border-right: 1px solid #404040;
        min-width: 0;
    `;
    
    const canvasContainer = document.createElement('div');
    canvasContainer.id = 'canvas-container';
    canvasContainer.style.cssText = `
        flex: 1; position: relative; overflow: hidden; background: #1a1a1a;
        display: flex; align-items: center; justify-content: center;
    `;
    
    const zoomContainer = document.createElement('div');
    zoomContainer.id = 'zoom-container';
    zoomContainer.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        transform-origin: center center;
        transform: translate(0px, 0px) scale(1);
        transition: transform 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    const fabricCanvasContainer = document.createElement('div');
    fabricCanvasContainer.id = 'fabric-canvas-container';
    fabricCanvasContainer.style.cssText = `
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: auto;
        height: auto;
    `;
    
    // 组装结构
    zoomContainer.appendChild(fabricCanvasContainer);
    canvasContainer.appendChild(zoomContainer);
    canvasArea.appendChild(canvasContainer);
    
    return { canvasArea, canvasContainer, zoomContainer, fabricCanvasContainer };
}

// 🗑️ 废弃的旧函数（保留以防兼容性问题，后续版本将完全移除）
export function createCanvasArea() {
    // 重定向到统一画布区域创建函数
    return createUnifiedCanvasArea();
}


/**
 * 创建右侧提示词编辑区域
 */
export function createPromptArea() {
    const promptArea = document.createElement('div');
    promptArea.style.cssText = `
        width: 380px; background: #2b2b2b; display: flex; flex-direction: column;
        border-left: 1px solid #404040;
        flex-shrink: 0; /* 防止右侧面板被压缩 */
    `;
    
    const tabHeader = document.createElement('div');
    tabHeader.style.cssText = `
        display: flex; background: #333; border-bottom: 1px solid #404040;
    `;
    
    // 标签页按钮
    const tabs = [
        { id: 'layers-tab', text: '🔴 图层', key: 'tab_layers' },
        { id: 'controls-tab', text: '🎛️ 控制', key: 'tab_controls' },
        { id: 'ai-enhancer-tab', text: '🤖 AI增强', key: 'tab_ai_enhancer' }
    ];
    
    tabs.forEach((tab, index) => {
        const tabButton = document.createElement('button');
        tabButton.id = tab.id;
        tabButton.className = 'vpe-tab-button';
        tabButton.style.cssText = `
            flex: 1; padding: 12px 8px; background: #444; color: #ccc; border: none;
            cursor: pointer; font-size: 11px; transition: all 0.3s ease;
            border-right: ${index < tabs.length - 1 ? '1px solid #555' : 'none'};
        `;
        tabButton.innerHTML = tab.text;
        tabButton.setAttribute('data-i18n', tab.key);
        
        // 默认激活第一个标签
        if (index === 0) {
            tabButton.style.background = '#10b981';
            tabButton.style.color = 'white';
            tabButton.classList.add('active');
        }
        
        tabHeader.appendChild(tabButton);
    });
    
    // 标签页内容容器
    const tabContent = document.createElement('div');
    tabContent.id = 'tab-content-container';
    tabContent.className = 'tab-content';
    tabContent.style.cssText = `
        flex: 1; overflow-y: auto; min-height: 0; padding: 8px;
    `;
    
    // 默认显示图层标签页内容
    tabContent.appendChild(createLayersTabContent());
    
    promptArea.appendChild(tabHeader);
    promptArea.appendChild(tabContent);
    
    return promptArea;
}

/**
 * 创建图层标签页内容
 */
export function createLayersTabContent() {
    const layersContent = document.createElement('div');
    layersContent.id = 'layers-tab-content';
    layersContent.style.cssText = `
        padding: 16px; display: block;
    `;
    
    layersContent.innerHTML = `
        <!-- 图层选择和管理 -->
        <!-- 统一的图层选择与操作 - 集成标注图层和连接图层 -->
        <div style="background: #333; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
            <div style="color: #4CAF50; font-weight: 600; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between;">
                <span data-i18n="layer_selection_operations">🎯 Layer Selection & Operations</span>
                <div style="display: flex; align-items: center; gap: 16px;">
                    <span id="selection-count" style="color: #888; font-size: 11px;">0 selected</span>
                </div>
            </div>
            
            <!-- 图层直接选择列表 -->
            <div style="margin-bottom: 16px;">
                <label id="layer-selection-label" style="display: block; color: #aaa; font-size: 12px; margin-bottom: 8px; font-weight: 500;" data-i18n="select_layers">📋 Available Layers</label>
                <div id="layers-list-container" style="background: #2b2b2b; border: 1px solid #555; border-radius: 6px; max-height: 300px; overflow-y: auto; position: relative; z-index: 100;">
                    <div id="layers-list" style="padding: 8px; position: relative; z-index: 101;">
                        <!-- 图层列表将在这里动态生成 -->
                    </div>
                </div>
                <div style="margin-top: 8px; display: flex; gap: 8px; align-items: center;">
                    <button id="select-all-layers" style="padding: 6px 12px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: 600;" data-i18n="btn_select_all">
                        📋 Select All
                    </button>
                    <button id="clear-selection" style="padding: 6px 12px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: 600;" data-i18n="btn_clear_selection">
                        🗑️ Clear
                    </button>
                    <span id="selection-count-info" style="color: #888; font-size: 11px; margin-left: auto;">0 selected</span>
                </div>
            </div>
            
            <!-- 当前编辑图层信息 -->
            <div id="current-layer-info" style="display: none; margin-bottom: 16px; padding: 12px; background: #2a2a2a; border-radius: 6px; border-left: 4px solid #4CAF50;">
                <div id="layer-title" style="color: white; font-weight: 600; margin-bottom: 4px;"></div>
                <div id="layer-subtitle" style="color: #aaa; font-size: 11px;"></div>
            </div>
            
            <!-- 批量操作或单个图层编辑 -->
            <div id="layer-operations" style="display: none;">
                <div style="margin-bottom: 16px;">
                    <label style="display: block; color: #aaa; font-size: 12px; margin-bottom: 6px; font-weight: 500;" data-i18n="operation_type">⚙️ Operation Type</label>
                    <select id="current-layer-operation" style="width: 100%; padding: 10px; background: #2b2b2b; color: white; border: 1px solid #555; border-radius: 6px; font-size: 13px;">
                        <option value="add_object" data-i18n="op_add_object">Add Object</option>
                        <option value="change_color" data-i18n="op_change_color">Change Color</option>
                        <option value="change_style" data-i18n="op_change_style">Change Style</option>
                        <option value="replace_object" data-i18n="op_replace_object">Replace Object</option>
                        <option value="remove_object" data-i18n="op_remove_object">Remove Object</option>
                        <option value="change_texture" data-i18n="op_change_texture">Change Texture</option>
                        <option value="change_pose" data-i18n="op_change_pose">Change Pose</option>
                        <option value="change_expression" data-i18n="op_change_expression">Change Expression</option>
                        <option value="change_clothing" data-i18n="op_change_clothing">Change Clothing</option>
                        <option value="change_background" data-i18n="op_change_background">Change Background</option>
                        <!-- 核心局部操作 (L11-L18) -->
                        <option value="enhance_quality" data-i18n="op_enhance_quality">Enhance Quality</option>
                        <option value="blur_background" data-i18n="op_blur_background">Blur Background</option>
                        <option value="adjust_lighting" data-i18n="op_adjust_lighting">Adjust Lighting</option>
                        <option value="resize_object" data-i18n="op_resize_object">Resize Object</option>
                        <option value="enhance_skin_texture" data-i18n="op_enhance_skin_texture">Enhance Skin Texture</option>
                        <option value="character_expression" data-i18n="op_character_expression">Character Expression</option>
                        <option value="character_hair" data-i18n="op_character_hair">Character Hair</option>
                        <option value="character_accessories" data-i18n="op_character_accessories">Character Accessories</option>
                        <!-- 新增：来自kontext-presets的局部操作 -->
                        <option value="zoom_focus" data-i18n="op_zoom_focus">Zoom Focus</option>
                        <option value="stylize_local" data-i18n="op_stylize_local">Stylize Local</option>
                        <!-- 自定义操作 -->
                        <option value="custom" data-i18n="op_custom">Custom Operation</option>
                    </select>
                </div>
                
                <div id="layer-constraint-prompts-container" style="margin-bottom: 16px;">
                    <label style="display: block; color: #aaa; font-size: 12px; margin-bottom: 6px; font-weight: 500;" data-i18n="constraint_prompts">🔒 Constraint Prompts (Select multiple)</label>
                    <div style="padding: 8px; background: #2b2b2b; border: 1px solid #555; border-radius: 4px; color: #888; text-align: center;" data-i18n="select_operation_constraint">
                        Please select an operation type to load constraint prompts...
                    </div>
                    <div style="font-size: 11px; color: #777; margin-top: 2px;" data-i18n="constraint_prompts_help">
                        Quality control and technical constraints for better results
                    </div>
                </div>
                
                <div id="layer-decorative-prompts-container" style="margin-bottom: 16px;">
                    <label style="display: block; color: #aaa; font-size: 12px; margin-bottom: 6px; font-weight: 500;" data-i18n="decorative_prompts">🎨 Decorative Prompts (Select multiple)</label>
                    <div style="padding: 8px; background: #2b2b2b; border: 1px solid #555; border-radius: 4px; color: #888; text-align: center;" data-i18n="select_operation_decorative">
                        Please select an operation type to load decorative prompts...
                    </div>
                    <div style="font-size: 11px; color: #777; margin-top: 2px;" data-i18n="decorative_prompts_help">
                        Aesthetic enhancements and visual quality improvements
                    </div>
                </div>
                
                <div style="margin-bottom: 16px;">
                    <label style="display: block; color: #aaa; font-size: 12px; margin-bottom: 6px; font-weight: 500;" data-i18n="description">📝 Description</label>
                    <textarea id="current-layer-description" 
                              style="width: 100%; height: 80px; padding: 10px; background: #2b2b2b; color: white; border: 1px solid #555; border-radius: 6px; font-size: 13px; resize: vertical; font-family: inherit; line-height: 1.4;"
                              placeholder="Enter description for selected layer(s)..." data-i18n-placeholder="placeholder_layer_description"></textarea>
                </div>
                
                <!-- Apply to Selected 提示说明 -->
                <div style="margin-bottom: 8px;">
                    <div style="color: #888; font-size: 11px; text-align: center; padding: 4px 8px; background: rgba(255, 255, 255, 0.05); border-radius: 4px; border-left: 3px solid #4CAF50;" data-i18n="apply_to_selected_hint">
                        💡 将当前提示和描述应用到所有选中的图层
                    </div>
                </div>
                
                <div style="display: flex; gap: 8px;">
                    <button id="apply-to-selected" style="flex: 1; padding: 10px; background: #4CAF50; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 12px;" data-i18n="btn_apply_to_selected" title="Apply the current prompt and description to all selected layers" data-i18n-title="tooltip_apply_to_selected">
                        ✅ Apply to Selected
                    </button>
                </div>
                
                <!-- 生成局部编辑提示词功能区域 -->
                <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #555;">
                    <div style="display: flex; gap: 8px; margin-bottom: 12px;">
                        <button id="generate-local-prompt" style="flex: 1; padding: 12px; background: #9C27B0; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 12px; transition: all 0.2s ease;" data-i18n="btn_generate_local_prompt">
                            🎯 Generate Local Edit Prompt
                        </button>
                    </div>
                    
                    <!-- 生成的局部编辑描述区域 -->
                    <div id="local-generated-description-container" style="display: none;">
                        <label style="display: block; color: #aaa; font-size: 12px; margin-bottom: 6px; font-weight: 500;" data-i18n="generated_description">🤖 Generated Description</label>
                        <textarea id="local-generated-description" 
                                  style="width: 100%; height: 100px; padding: 10px; background: #2b2b2b; color: white; border: 1px solid #555; border-radius: 6px; font-size: 12px; resize: vertical; font-family: inherit; line-height: 1.4;"
                                  placeholder="Generated local editing description will appear here..." data-i18n-placeholder="placeholder_generated_description" readonly></textarea>
                        <div style="display: flex; gap: 8px; margin-top: 8px;">
                            <button id="copy-local-description" style="padding: 6px 12px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: 600;" data-i18n="btn_copy">
                                📋 Copy
                            </button>
                            <button id="apply-local-description" style="padding: 6px 12px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: 600;" data-i18n="btn_apply">
                                ✅ Apply
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
    `;
    
    // 更新国际化文本，包括tooltip
    updateAllUITexts(layersContent);
    
    // 绑定"Apply to Selected"按钮事件
    const applyButton = layersContent.querySelector('#apply-to-selected');
    if (applyButton) {
        applyButton.addEventListener('click', () => {
            applySettingsToSelectedLayers(layersContent, applyButton);
        });
    }
    
    return layersContent;
}

/**
 * 创建控制标签页内容
 */
export function createControlsTabContent() {
    const controlsContent = document.createElement('div');
    controlsContent.id = 'controls-tab-content';
    controlsContent.style.cssText = `
        padding: 16px; display: block;
    `;
    
    controlsContent.innerHTML = `
        <!-- 编辑控制 -->
        <div style="background: #333; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
            <div style="color: #4CAF50; font-weight: 600; margin-bottom: 12px;" data-i18n="edit_control">🎯 Edit Control</div>
            
            <div style="margin-bottom: 12px;">
                <label style="display: block; color: #aaa; font-size: 12px; margin-bottom: 4px;" data-i18n="template_category">Template Category</label>
                <select id="template-category" style="width: 100%; padding: 8px; background: #2b2b2b; color: white; border: 1px solid #555; border-radius: 4px; margin-bottom: 8px;">
                    <option value="global" data-i18n="template_global">🌍 Global Adjustments (15 templates)</option>
                    <option value="text" data-i18n="template_text">📝 Text Editing (5 templates)</option>
                    <option value="professional" data-i18n="template_professional">🔧 Professional Operations (15 templates)</option>
                </select>
            </div>
            
            <div style="margin-bottom: 12px;">
                <label style="display: block; color: #aaa; font-size: 12px; margin-bottom: 4px;" data-i18n="edit_operation_type">Edit Operation Type</label>
                <select id="operation-type" style="width: 100%; padding: 8px; background: #2b2b2b; color: white; border: 1px solid #555; border-radius: 4px;">
                    <!-- 动态填充选项 -->
                </select>
            </div>
            
            <div style="margin-bottom: 12px;">
                <label style="display: block; color: #aaa; font-size: 12px; margin-bottom: 4px;" data-i18n="description_text">📝 Description Text</label>
                <textarea id="target-input" 
                          style="width: 100%; height: 80px; padding: 8px; background: #2b2b2b; color: white; border: 1px solid #555; border-radius: 4px; resize: vertical; font-family: inherit; font-size: 14px; line-height: 1.4;" 
                          placeholder="Enter editing instructions for selected objects..." data-i18n-placeholder="placeholder_target_input"></textarea>
            </div>
            
            <div style="margin-bottom: 12px;">
                <label style="display: flex; align-items: center; gap: 8px; color: #aaa; font-size: 12px; cursor: pointer;">
                    <input type="checkbox" id="include-annotation-numbers" 
                           style="width: 14px; height: 14px; accent-color: #4CAF50; cursor: pointer;">
                    <span data-i18n="include_annotation_numbers">Include annotation numbers in description</span>
                </label>
                <div style="font-size: 11px; color: #777; margin-top: 2px; margin-left: 22px;" data-i18n="annotation_numbers_help">
                    🏷️ Show annotation numbers (e.g., "annotation 1") in generated prompts
                </div>
            </div>
            
            <!-- 应用成功提示区域 -->
            <div id="apply-success-notification" style="width: 100%; padding: 8px; margin-bottom: 8px; background: #1B5E20; color: #C8E6C9; border: 1px solid #4CAF50; border-radius: 4px; text-align: center; font-size: 12px; font-weight: 600; display: none; opacity: 0; transition: all 0.3s ease;">
                ✅ 约束和修饰提示词已成功应用
            </div>
            
            <button id="generate-prompt" style="width: 100%; padding: 10px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;" data-i18n="btn_generate_description">
                ✨ Generate Description
            </button>
        </div>
        
        <!-- 生成的描述 -->
        <div style="background: #333; padding: 16px; border-radius: 8px;">
            <div style="color: #FF9800; font-weight: 600; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                <span data-i18n="generated_description">📝 Generated Description</span>
                <span id="description-status" style="font-size: 12px; padding: 2px 6px; border-radius: 3px; background: #555; color: #ccc; display: none;" data-i18n="edited_status">
                    ✏️ Edited
                </span>
            </div>
            <textarea id="generated-description" 
                      style="width: 100%; height: 120px; padding: 12px; background: #2b2b2b; color: white; border: 1px solid #555; border-radius: 4px; resize: vertical; font-family: inherit; font-size: 14px; line-height: 1.4; transition: border-color 0.3s ease;" 
                      placeholder="Generated description text will appear here..." data-i18n-placeholder="placeholder_generated_description"></textarea>
            
            <div style="display: flex; gap: 8px; margin-top: 8px;">
                <button id="copy-description" style="flex: 1; padding: 8px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;" data-i18n="btn_copy">
                    📋 Copy
                </button>
                <button id="clear-description" style="flex: 1; padding: 8px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;" data-i18n="btn_clear_description">
                    🧹 Clear
                </button>
            </div>
        </div>
    `;
    
    return controlsContent;
}

/**
 * 创建AI增强器标签页内容
 */
export function createAIEnhancerTabContent() {
    const aiContent = document.createElement('div');
    aiContent.id = 'ai-enhancer-tab-content';
    aiContent.style.cssText = `
        padding: 8px; display: block;
    `;
    
    // AI增强器内容 - 调整宽度使其填满容器
    aiContent.innerHTML = `
        <!-- AI增强器选择 -->
        <div style="background: #333; border-radius: 6px; padding: 18px; margin-bottom: 16px; width: 100%; box-sizing: border-box;">
            <div style="color: #10b981; font-weight: bold; margin-bottom: 14px; font-size: 15px; text-align: left;" data-i18n="ai_select_enhancer">🚀 选择增强器</div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
                <div class="enhancer-card" data-enhancer="api" style="background: #10b981; color: white; border-radius: 4px; padding: 12px; cursor: pointer; text-align: center; font-size: 12px; transition: all 0.3s ease;" data-i18n="ai_enhancer_api">
                    API云端
                </div>
                <div class="enhancer-card" data-enhancer="ollama" style="background: #555; color: #ccc; border-radius: 4px; padding: 12px; cursor: pointer; text-align: center; font-size: 12px; transition: all 0.3s ease;" data-i18n="ai_enhancer_ollama">
                    Ollama本地
                </div>
                <div class="enhancer-card" data-enhancer="textgen" style="background: #555; color: #ccc; border-radius: 4px; padding: 12px; cursor: pointer; text-align: center; font-size: 12px; transition: all 0.3s ease;" data-i18n="ai_enhancer_textgen">
                    TextGen
                </div>
            </div>
        </div>
        
        <!-- API配置面板 -->
        <div id="enhancer-config-container" style="background: #333; border-radius: 6px; padding: 18px; margin-bottom: 16px; width: 100%; box-sizing: border-box;">
            <div id="enhancer-config-toggle" style="display: flex; justify-content: space-between; align-items: center; cursor: pointer; margin-bottom: 14px;">
                <div style="color: #10b981; font-weight: bold; font-size: 15px;" data-i18n="ai_api_settings">⚙️ API设置</div>
                <div id="config-arrow" style="color: #10b981; font-size: 14px; transition: transform 0.3s ease; transform: rotate(-90deg);">▼</div>
            </div>
            
            <div id="enhancer-config" style="max-height: 0px; overflow: hidden; transition: max-height 0.3s ease-out;">
                <!-- API云端配置 -->
                <div id="api-config" style="display: block;">
                    <div style="margin-bottom: 12px;">
                        <label style="color: #ccc; font-size: 12px; margin-bottom: 6px; display: block; font-weight: 500;" data-i18n="api_key_label">API Key:</label>
                        <input type="password" id="api-key-input" style="width: 100%; background: #222; border: 1px solid #555; color: white; padding: 10px; border-radius: 4px; font-size: 12px; box-sizing: border-box;" placeholder="输入您的API Key" data-i18n-placeholder="api_key_placeholder">
                    </div>
                    <div style="margin-bottom: 12px;">
                        <label style="color: #ccc; font-size: 12px; margin-bottom: 6px; display: block; font-weight: 500;" data-i18n="api_model_label">模型选择:</label>
                        <select id="api-model-select" style="width: 100%; background: #222; border: 1px solid #555; color: white; padding: 10px; border-radius: 4px; font-size: 12px; box-sizing: border-box;">
                            <option value="gpt-4">GPT-4</option>
                            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                            <option value="claude-3">Claude 3</option>
                        </select>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <button onclick="testAPIConnection()" style="background: #2196F3; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: bold;" data-i18n="test_connection">测试连接</button>
                        <div id="api-status" style="color: #666; font-size: 11px;">● 未测试</div>
                    </div>
                </div>
                
                <!-- Ollama本地配置 -->
                <div id="ollama-config" style="display: none;">
                    <div style="margin-bottom: 12px;">
                        <label style="color: #ccc; font-size: 12px; margin-bottom: 6px; display: block; font-weight: 500;" data-i18n="ollama_url_label">服务地址:</label>
                        <input type="text" id="ollama-url-input" style="width: 100%; background: #222; border: 1px solid #555; color: white; padding: 10px; border-radius: 4px; font-size: 12px; box-sizing: border-box;" placeholder="http://localhost:11434" value="http://localhost:11434" data-i18n-placeholder="ollama_url_placeholder">
                    </div>
                    <div style="margin-bottom: 12px;">
                        <label style="color: #ccc; font-size: 12px; margin-bottom: 6px; display: block; font-weight: 500;" data-i18n="ollama_model_label">模型选择:</label>
                        <select id="ollama-model-select" style="width: 100%; background: #222; border: 1px solid #555; color: white; padding: 10px; border-radius: 4px; font-size: 12px; box-sizing: border-box;">
                            <option value="llama3.1:8b">Llama 3.1 8B</option>
                            <option value="llama3.1:70b">Llama 3.1 70B</option>
                            <option value="mistral:7b">Mistral 7B</option>
                            <option value="codellama:7b">CodeLlama 7B</option>
                        </select>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <button onclick="testOllamaConnection()" style="background: #2196F3; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: bold;" data-i18n="test_connection">测试连接</button>
                        <div id="ollama-status" style="color: #666; font-size: 11px;">● 未测试</div>
                    </div>
                </div>
                
                <!-- TextGen配置 -->
                <div id="textgen-config" style="display: none;">
                    <div style="margin-bottom: 12px;">
                        <label style="color: #ccc; font-size: 12px; margin-bottom: 6px; display: block; font-weight: 500;" data-i18n="textgen_url_label">服务地址:</label>
                        <input type="text" id="textgen-url-input" style="width: 100%; background: #222; border: 1px solid #555; color: white; padding: 10px; border-radius: 4px; font-size: 12px; box-sizing: border-box;" placeholder="http://localhost:5000" value="http://localhost:5000" data-i18n-placeholder="textgen_url_placeholder">
                    </div>
                    <div style="margin-bottom: 12px;">
                        <label style="color: #ccc; font-size: 12px; margin-bottom: 6px; display: block; font-weight: 500;" data-i18n="textgen_model_label">模型选择:</label>
                        <select id="textgen-model-select" style="width: 100%; background: #222; border: 1px solid #555; color: white; padding: 10px; border-radius: 4px; font-size: 12px; box-sizing: border-box;">
                            <option value="llama-3.1-8b-instruct">Llama 3.1 8B Instruct</option>
                            <option value="llama-3.1-70b-instruct">Llama 3.1 70B Instruct</option>
                            <option value="mistral-7b-instruct">Mistral 7B Instruct</option>
                            <option value="codellama-7b-instruct">CodeLlama 7B Instruct</option>
                        </select>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <button onclick="testTextGenConnection()" style="background: #2196F3; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: bold;" data-i18n="test_connection">测试连接</button>
                        <div id="textgen-status" style="color: #666; font-size: 11px;">● 未测试</div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 编辑输入 -->
        <div style="background: #333; border-radius: 6px; padding: 18px; margin-bottom: 16px; width: 100%; box-sizing: border-box;">
            <div style="color: #10b981; font-weight: bold; margin-bottom: 14px; font-size: 15px;" data-i18n="ai_edit_description">✏️ 编辑描述</div>
            <textarea id="edit-description" style="width: 100%; height: 80px; background: #222; border: 1px solid #555; color: white; padding: 12px; border-radius: 4px; font-size: 13px; resize: vertical; box-sizing: border-box; font-family: inherit;" data-i18n-placeholder="ai_placeholder_description">将红色标记区域的天空颜色改成深蓝色的晚霞效果</textarea>
        </div>
        
        <!-- 参数控制 -->
        <div style="background: #333; border-radius: 6px; padding: 18px; margin-bottom: 16px; width: 100%; box-sizing: border-box;">
            <div style="color: #10b981; font-weight: bold; margin-bottom: 14px; font-size: 15px;" data-i18n="ai_parameter_settings">🎛️ 参数设置</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                <div>
                    <label style="color: #ccc; font-size: 12px; margin-bottom: 6px; display: block; font-weight: 500;" data-i18n="ai_edit_intent">编辑意图</label>
                    <select id="edit-intent" style="width: 100%; background: #222; border: 1px solid #555; color: white; padding: 10px; border-radius: 4px; font-size: 12px; box-sizing: border-box;">
                        <option value="general_editing" selected data-i18n="ai_intent_general_editing">通用编辑</option>
                        <option value="product_showcase" data-i18n="ai_intent_product_showcase">产品展示优化</option>
                        <option value="portrait_enhancement" data-i18n="ai_intent_portrait_enhancement">人像美化</option>
                        <option value="creative_design" data-i18n="ai_intent_creative_design">创意设计</option>
                        <option value="architectural_photo" data-i18n="ai_intent_architectural_photo">建筑摄影</option>
                        <option value="food_styling" data-i18n="ai_intent_food_styling">美食摄影</option>
                        <option value="fashion_retail" data-i18n="ai_intent_fashion_retail">时尚零售</option>
                        <option value="landscape_nature" data-i18n="ai_intent_landscape_nature">风景自然</option>
                        <option value="professional_editing" data-i18n="ai_intent_professional_editing">专业图像编辑</option>
                        <option value="custom" data-i18n="ai_intent_custom">自定义</option>
                    </select>
                </div>
                <div>
                    <label style="color: #ccc; font-size: 12px; margin-bottom: 6px; display: block; font-weight: 500;" data-i18n="ai_processing_style">处理风格</label>
                    <select id="processing-style" style="width: 100%; background: #222; border: 1px solid #555; color: white; padding: 10px; border-radius: 4px; font-size: 12px; box-sizing: border-box;">
                        <option value="auto_smart" selected data-i18n="ai_style_auto_smart">智能自动</option>
                        <option value="efficient_fast" data-i18n="ai_style_efficient_fast">高效快速</option>
                        <option value="creative_artistic" data-i18n="ai_style_creative_artistic">创意艺术</option>
                        <option value="precise_technical" data-i18n="ai_style_precise_technical">精确技术</option>
                        <option value="custom_guidance" data-i18n="ai_style_custom_guidance">自定义指引</option>
                    </select>
                </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div>
                    <label style="color: #ccc; font-size: 12px; margin-bottom: 6px; display: block; font-weight: 500;" data-i18n="ai_temperature">Temperature</label>
                    <select id="temperature" style="width: 100%; background: #222; border: 1px solid #555; color: white; padding: 10px; border-radius: 4px; font-size: 12px; box-sizing: border-box;">
                        <option value="0.3" data-i18n="ai_temp_conservative">0.3 (保守)</option>
                        <option value="0.7" selected data-i18n="ai_temp_creative">0.7 (创意)</option>
                        <option value="0.9" data-i18n="ai_temp_random">0.9 (随机)</option>
                        <option value="1.0" data-i18n="ai_temp_maximum">1.0 (最大)</option>
                    </select>
                </div>
                <div>
                    <label style="color: #ccc; font-size: 12px; margin-bottom: 6px; display: block; font-weight: 500;" data-i18n="ai_random_seed">随机种子</label>
                    <select id="seed" style="width: 100%; background: #222; border: 1px solid #555; color: white; padding: 10px; border-radius: 4px; font-size: 12px; box-sizing: border-box;">
                        <option value="42" selected data-i18n="ai_seed_default">42 (默认)</option>
                        <option value="-1" data-i18n="ai_seed_random">随机 (-1)</option>
                        <option value="123">123</option>
                        <option value="999">999</option>
                        <option value="2024">2024</option>
                    </select>
                </div>
            </div>
        </div>
        
        <!-- 生成按钮 -->
        <button id="generate-ai-prompt" style="width: 100%; background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; padding: 16px; border-radius: 6px; cursor: pointer; font-weight: bold; margin-bottom: 16px; font-size: 14px; box-sizing: border-box; transition: all 0.3s ease;" data-i18n="ai_generate_prompt">
            🚀 生成提示词
        </button>
        
        <!-- 预览区域 -->
        <div style="background: #222; border: 2px solid #10b981; border-radius: 6px; padding: 18px; min-height: 120px; width: 100%; box-sizing: border-box; margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <div style="color: #10b981; font-weight: bold; font-size: 13px;" data-i18n="ai_prompt_preview">📝 提示词预览</div>
                <div id="preview-status" style="color: #666; font-size: 11px; padding: 4px 8px; background: rgba(255,255,255,0.1); border-radius: 12px;" data-i18n="ai_status_pending">待生成</div>
            </div>
            <div id="preview-content" style="color: #ccc; font-size: 12px; line-height: 1.5; min-height: 60px; border-top: 1px dashed #555; padding-top: 12px;" data-i18n="ai_prompt_placeholder">
                点击"🚀 生成提示词"按钮开始生成专业提示词...
            </div>
        </div>
        
        <!-- 操作按钮 -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; width: 100%; box-sizing: border-box;">
            <button id="regenerate-ai-prompt" style="background: #f59e0b; color: white; border: none; padding: 10px; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: bold; transition: all 0.3s ease;" disabled data-i18n="ai_regenerate">
                🔄 重新生成
            </button>
            <button id="confirm-ai-prompt" style="background: #10b981; color: white; border: none; padding: 10px; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: bold; transition: all 0.3s ease;" disabled data-i18n="ai_confirm_apply">
                ✅ 确认应用
            </button>
        </div>
    `;
    
    return aiContent;
}

/**
 * 显示控制信息
 */
export function showControlInfo(modal) {
    // 显示画布控制信息
    const controlInfo = document.createElement('div');
    controlInfo.style.cssText = `
        position: absolute; bottom: 16px; left: 16px; 
        background: rgba(0,0,0,0.8); color: #4CAF50; 
        padding: 12px; border-radius: 8px; font-family: monospace; 
        font-size: 11px; line-height: 1.4; z-index: 1000;
        border: 1px solid #4CAF50;
    `;
    
    controlInfo.innerHTML = `
        <div style="color: white; font-weight: bold; margin-bottom: 4px;" data-i18n="canvas_controls_title">VPE Canvas Controls:</div>
        <span data-i18n="control_left_click">• Left-click: Draw freehand</span><br>
        <span data-i18n="control_middle_click">• Middle-click: Drag to pan</span><br>
        <span data-i18n="control_ctrl_scroll">• Ctrl+Scroll: Zoom</span><br>
        <span data-i18n="control_shift_circle">• Shift+Circle: Perfect Circle</span>
    `;
    
    const canvasContainer = modal.querySelector('#canvas-container');
    if (canvasContainer) {
        canvasContainer.appendChild(controlInfo);
    }
}

/**
 * 初始化标签页功能
 */
export function initializeTabSwitching() {
    console.log('🔄 初始化标签页切换功能...');
    
    // 查找所有标签页按钮
    const tabs = document.querySelectorAll('.vpe-tab-button');
    console.log(`📝 标签页按钮数量: ${tabs.length}`);
    
    if (tabs.length === 0) {
        console.warn('❌ 没有找到标签页按钮');
        return;
    }
    
    // 预创建所有标签页内容
    const tabContents = {
        'tab_layers': createLayersTabContent(),
        'tab_controls': createControlsTabContent(),
        'tab_ai_enhancer': createAIEnhancerTabContent()
    };
    
    // 标签页内容已预创建
    
    tabs.forEach((tab, index) => {
        const tabKey = tab.getAttribute('data-i18n');
        console.log(`🏷️ 为标签页添加点击事件: ${tabKey}`);
        
        tab.addEventListener('click', function() {
            console.log(`📱 点击标签页: ${tabKey}`);
            switchToTab(tabKey, tabContents);
            
            tabs.forEach(t => {
                t.style.background = '#444';
                t.style.color = '#ccc';
                t.classList.remove('active');
            });
            this.style.background = '#10b981';
            this.style.color = 'white';
            this.classList.add('active');
            
            // 标签页切换完成
        });
    });
    
    // 🔧 默认激活layers标签页，提供更直观的用户体验
    const defaultTab = tabs[0]; // layers标签页 (index 0: layers=0, controls=1, ai=2)
    if (defaultTab) {
        const tabKey = defaultTab.getAttribute('data-i18n');
        
        // 激活默认标签页
        switchToTab(tabKey, tabContents);
        
        tabs.forEach(t => {
            t.style.background = '#444';
            t.style.color = '#ccc';
            t.classList.remove('active');
        });
        defaultTab.style.background = '#10b981';
        defaultTab.style.color = 'white';
        defaultTab.classList.add('active');
        
    }
    
    // 标签页切换功能初始化完成
}

/**
 * 切换到指定标签页
 */
function switchToTab(tabKey, tabContents) {
    // 切换到标签页
    
    const tabContentContainer = document.getElementById('tab-content-container');
    if (!tabContentContainer) {
        console.error('❌ Tab content container not found: #tab-content-container');
        return;
    }
    
    if (!tabContents[tabKey]) {
        console.error(`❌ Tab content not found: ${tabKey}`);
        return;
    }
    
    
    // 清空当前内容
    tabContentContainer.innerHTML = '';
    
    tabContentContainer.appendChild(tabContents[tabKey]);
    
    // 标签页内容已更新
    
    const modal = tabContentContainer.closest('#unified-editor-modal');
    
    // 🔴 立即应用翻译到新添加的内容
    if (modal && typeof window.updateAllUITexts === 'function') {
        window.updateAllUITexts(modal);
    }
    
    // 根据不同标签页执行特定的初始化
    if (tabKey === 'tab_layers') {
        setTimeout(() => {
            // 重新绑定图层下拉选择器事件
            if (modal && typeof window.bindCanvasInteractionEvents === 'function') {
                window.bindCanvasInteractionEvents(modal);
            }
            
            // 🔧 重要：重新加载图层数据并恢复图层顺序
            if (modal && window.currentVPEInstance) {
                const nodeInstance = window.currentVPEInstance;
                
                // 🔧 重要：优先尝试恢复保存的图层顺序
                if (nodeInstance.layerOrderController && typeof nodeInstance.layerOrderController.restoreSavedLayerOrder === 'function') {
                    const restored = nodeInstance.layerOrderController.restoreSavedLayerOrder(modal);
                    if (restored) {
                    } else {
                        // 如果没有保存的顺序，则使用默认刷新
                        if (typeof nodeInstance.refreshLayersList === 'function') {
                            nodeInstance.refreshLayersList(modal);
                        }
                    }
                } else if (typeof nodeInstance.refreshLayersList === 'function') {
                    // 回退到原有的刷新方法
                    nodeInstance.refreshLayersList(modal);
                } else {
                }
                
                // 重新绑定图层事件
                if (typeof nodeInstance.bindLayerEvents === 'function') {
                    nodeInstance.bindLayerEvents(modal);
                }
                
                // 🔴 重要：重新更新图层选择器和操作面板
                if (typeof window.updateObjectSelector === 'function') {
                    window.updateObjectSelector(modal);
                }
            } else {
            }
        }, 100);
    } else if (tabKey === 'tab_controls') {
        setTimeout(() => {
            
            // 重新绑定控制面板事件 - 使用动态导入避免循环依赖
            if (modal) {
                
                // 首先尝试使用window对象上的函数（如果已暴露）
                if (typeof window.bindPromptEvents === 'function') {
                    const node = window.currentVPENode;
                    const getObjectInfoFunction = node ? node.getObjectInfo : null;
                    window.bindPromptEvents(modal, getObjectInfoFunction);
                } else {
                    // 备用方案：动态导入
                    import('./visual_prompt_editor_prompts.js').then(module => {
                        const node = window.currentVPENode;
                        const getObjectInfoFunction = node ? node.getObjectInfo : null;
                        module.bindPromptEvents(modal, getObjectInfoFunction);
                    }).catch(err => {
                        console.error('❌ 动态导入失败:', err);
                    });
                }
            }
            
            // 🔧 修复：确保下拉框选项正确填充
            const templateCategory = modal.querySelector('#template-category') || document.querySelector('#template-category');
            const operationType = modal.querySelector('#operation-type') || document.querySelector('#operation-type'); 
            
            
            if (templateCategory && operationType) {
                try {
                    updateOperationTypeSelect(operationType, 'global');
                } catch (err) {
                    console.error('❌ 更新操作类型选择器失败:', err);
                    // 备用方案：手动填充下拉框
                    operationType.innerHTML = `
                            <option value="global_color_grade">Color Grading</option>
                            <option value="global_style_transfer">Style Transfer</option>
                            <option value="global_brightness_contrast">Brightness & Contrast</option>
                            <option value="global_enhance">Global Enhance</option>
                        `;
                }
                
                // 手动触发change事件来填充operation-type下拉框
                const changeEvent = new Event('change', { bubbles: true });
                templateCategory.dispatchEvent(changeEvent);
            } else {
                // 尝试延迟查找
                setTimeout(() => {
                    const delayedCategory = document.querySelector('#template-category');
                    const delayedOperation = document.querySelector('#operation-type');
                    if (delayedCategory && delayedOperation) {
                        if (typeof window.updateOperationTypeSelect === 'function') {
                            window.updateOperationTypeSelect(delayedOperation, 'global');
                        }
                    }
                }, 300);
            }
        }, 150); // 🔧 增加延迟时间确保DOM完全渲染
    } else if (tabKey === 'tab_ai_enhancer') {
        setTimeout(() => {
            initializeAIEnhancerFeatures();
            
            // 强制更新AI增强器的翻译
            if (modal && typeof window.updateSelectOptions === 'function') {
                window.updateSelectOptions(modal);
            }
            
        }, 100);
    }
}

/**
 * 初始化AI增强器功能
 */
function initializeAIEnhancerFeatures() {
    // 防止重复初始化
    if (window._aiEnhancerInitialized) {
        return;
    }
    
    let currentEnhancer = 'api';
    let isGenerating = false;
    
    // 增强器选择功能
    const enhancerCards = document.querySelectorAll('.enhancer-card');
    
    enhancerCards.forEach(card => {
        card.addEventListener('click', function() {
            const enhancerType = this.getAttribute('data-enhancer');
            if (enhancerType) {
                selectEnhancer(enhancerType);
                currentEnhancer = enhancerType;
            }
        });
    });
    
    // 默认选择API增强器
    selectEnhancer('api');
    
    // 配置面板折叠功能
    const configToggle = document.getElementById('enhancer-config-toggle');
    if (configToggle) {
        configToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleEnhancerConfig();
        });
    } else {
    }
    
    // 生成按钮功能
    const generateBtn = document.getElementById('generate-ai-prompt');
    if (generateBtn) {
        generateBtn.addEventListener('click', () => generatePrompt(currentEnhancer));
    }
    
    // 重新生成按钮
    const regenerateBtn = document.getElementById('regenerate-ai-prompt');
    if (regenerateBtn) {
        regenerateBtn.addEventListener('click', () => generatePrompt(currentEnhancer));
    }
    
    // 确认应用按钮
    const confirmBtn = document.getElementById('confirm-ai-prompt');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', confirmPrompt);
    }
    
    // 参数实时更新功能（防抖处理）
    setupRealtimePreview(currentEnhancer);
    
    // 标记为已初始化
    window._aiEnhancerInitialized = true;
}

/**
 * 选择增强器
 */
function selectEnhancer(enhancerType) {
    const enhancerCards = document.querySelectorAll('.enhancer-card');
    enhancerCards.forEach(card => {
        const cardType = card.getAttribute('data-enhancer');
        if (cardType === enhancerType) {
            card.style.borderColor = '#10b981';
            card.style.background = 'rgba(16, 185, 129, 0.1)';
        } else {
            card.style.borderColor = '#444';
            card.style.background = '#1a1a1a';
        }
    });
    
    // 显示对应的配置面板
    const configPanels = ['api-config', 'ollama-config', 'textgen-config'];
    configPanels.forEach(panelId => {
        const panel = document.getElementById(panelId);
        if (panel) {
            panel.style.display = panelId === `${enhancerType}-config` ? 'block' : 'none';
        }
    });
    
}

/**
 * 切换增强器配置面板
 */
function toggleEnhancerConfig() {
    const configContent = document.getElementById('enhancer-config');
    const arrow = document.getElementById('config-arrow');
    
    if (configContent && arrow) {
        const isHidden = configContent.style.maxHeight === '0px' || !configContent.style.maxHeight;
        
        if (isHidden) {
            configContent.style.maxHeight = configContent.scrollHeight + 'px';
            arrow.style.transform = 'rotate(0deg)';
        } else {
            configContent.style.maxHeight = '0px';
            arrow.style.transform = 'rotate(-90deg)';
        }
    } else {
    }
}

/**
 * 生成提示词
 */
async function generatePrompt(enhancerType) {
    const generateBtn = document.getElementById('generate-ai-prompt');
    const regenerateBtn = document.getElementById('regenerate-ai-prompt');
    const confirmBtn = document.getElementById('confirm-ai-prompt');
    const previewStatus = document.getElementById('preview-status');
    const previewContent = document.getElementById('preview-content');
    
    if (!generateBtn || !previewStatus || !previewContent) return;
    
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<span style="animation: spin 1s linear infinite; display: inline-block;">⚙️</span> 正在生成...';
    if (regenerateBtn) regenerateBtn.disabled = true;
    if (confirmBtn) confirmBtn.disabled = true;
    
    previewStatus.textContent = '生成中...';
    previewStatus.style.background = 'rgba(245, 158, 11, 0.2)';
    previewStatus.style.color = '#f59e0b';
    
    // 收集参数
    const params = {
        enhancer: enhancerType,
        description: document.getElementById('edit-description')?.value || '',
        intent: document.getElementById('edit-intent')?.value || 'general_editing',
        style: document.getElementById('processing-style')?.value || 'auto_smart',
        temperature: document.getElementById('temperature')?.value || '0.7',
        seed: document.getElementById('seed')?.value || '42'
    };
    
    
    try {
        // 尝试调用实际的增强器API
        const result = await callEnhancerAPI(enhancerType, params);
        
        if (result.success) {
            displayEnhancedPrompt(result.prompt, previewContent);
            
            previewStatus.textContent = '生成完成';
            previewStatus.style.background = 'rgba(16, 185, 129, 0.2)';
            previewStatus.style.color = '#10b981';
            
            analyzePromptQuality(result.prompt);
        } else {
            throw new Error(result.error || '生成失败');
        }
        
    } catch (error) {
        
        // 回退到示例提示词
        const samplePrompts = [
            "Transform the red rectangular marked area into a beautiful deep blue evening sky with stunning sunset colors, maintaining natural lighting transitions and ensuring seamless blending with the surrounding environment while preserving the overall atmospheric quality of the image.",
            "Change the red annotated region to display a magnificent twilight sky in deep blue tones, creating a dramatic evening atmosphere with natural color gradients and smooth transitions that integrate harmoniously with the existing lighting conditions.",
            "Convert the marked red area to showcase a breathtaking deep blue evening sky with warm sunset undertones, ensuring professional quality color blending and maintaining realistic lighting consistency throughout the scene."
        ];
        
        const randomPrompt = samplePrompts[Math.floor(Math.random() * samplePrompts.length)];
        
        displayEnhancedPrompt(randomPrompt, previewContent);
        
        previewStatus.textContent = '生成完成（示例）';
        previewStatus.style.background = 'rgba(16, 185, 129, 0.2)';
        previewStatus.style.color = '#10b981';
        
        analyzePromptQuality(randomPrompt, true);
    } finally {
        // 恢复按钮状态
        generateBtn.disabled = false;
        generateBtn.innerHTML = '🚀 生成提示词';
        if (regenerateBtn) regenerateBtn.disabled = false;
        if (confirmBtn) confirmBtn.disabled = false;
    }
}

/**
 * 调用增强器API
 */
async function callEnhancerAPI(enhancerType, params) {
    try {
        // Transform-First架构：移除废弃的annotation数据构建
        const modal = document.getElementById('unified-editor-modal');
        
        // 构建Transform-First请求数据
        const requestData = {
            annotation_data: JSON.stringify({
                transform_version: "1.0",
                layer_transforms: {},
                include_annotation_numbers: false
            }),
            edit_description: params.description,
            editing_intent: params.intent,
            processing_style: params.style,
            seed: parseInt(params.seed) || 42,
            temperature: parseFloat(params.temperature) || 0.7
        };
        
        // 根据增强器类型调用不同的API端点
        let endpoint = '';
        switch (enhancerType) {
            case 'api':
                endpoint = '/kontext/api_enhance';
                requestData.api_provider = getAPIConfig().provider || 'siliconflow';
                requestData.api_key = getAPIConfig().apiKey || '';
                requestData.model_preset = getAPIConfig().model || 'deepseek-ai/DeepSeek-V3';
                break;
            case 'ollama':
                endpoint = '/kontext/ollama_enhance';
                requestData.ollama_base_url = getOllamaConfig().baseUrl || 'http://localhost:11434';
                requestData.model_name = getOllamaConfig().model || 'llama3.1:8b';
                break;
            case 'textgen':
                endpoint = '/kontext/textgen_enhance';
                requestData.base_url = getTextGenConfig().baseUrl || 'http://localhost:5000';
                requestData.model_name = getTextGenConfig().model || 'llama-3.1-8b-instruct';
                break;
            default:
                throw new Error('不支持的增强器类型');
        }
        
        // 发送请求
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            return {
                success: true,
                prompt: result.enhanced_prompt || result.result || result.prompt
            };
        } else {
            throw new Error(result.error || result.message || '未知错误');
        }
        
    } catch (error) {
        console.error('增强器API调用失败:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * 映射意图值到增强器参数
 */
function mapIntentValue(intent) {
    const mapping = {
        'change_color': 'general_editing',
        'replace_object': 'creative_design',
        'remove_object': 'professional_editing',
        'add_object': 'creative_design',
        'change_style': 'creative_design',
        'enhance_quality': 'professional_editing',
        'adjust_lighting': 'professional_editing'
    };
    return mapping[intent] || 'general_editing';
}

/**
 * 映射风格值到增强器参数
 */
function mapStyleValue(style) {
    const mapping = {
        'natural_realistic': 'auto_smart',
        'artistic_creative': 'creative_artistic',
        'technical_precise': 'precise_technical'
    };
    return mapping[style] || 'auto_smart';
}

/**
 * 获取API配置
 */
function getAPIConfig() {
    return {
        provider: document.querySelector('#api-config select')?.value || 'siliconflow',
        apiKey: document.querySelector('#api-config input[type="password"]')?.value || '',
        model: document.querySelector('#api-config select')?.value || 'deepseek-ai/DeepSeek-V3',
        baseUrl: document.querySelector('#api-config input[placeholder*="https://api"]')?.value || 'https://api.openai.com/v1'
    };
}

/**
 * 获取Ollama配置
 */
function getOllamaConfig() {
    return {
        baseUrl: document.querySelector('#ollama-url-input')?.value || 'http://localhost:11434',
        model: document.querySelector('#ollama-model-select')?.value || 'llama3.1:8b'
    };
}

/**
 * 获取TextGen配置
 */
function getTextGenConfig() {
    return {
        baseUrl: document.querySelector('#textgen-url-input')?.value || 'http://localhost:5000',
        model: document.querySelector('#textgen-model-select')?.value || 'llama-3.1-8b-instruct'
    };
}

/**
 * 确认应用提示词
 */
function confirmPrompt() {
    const previewContent = document.getElementById('preview-content');
    if (previewContent) {
        const promptText = previewContent.textContent;
        
        if (!promptText || promptText.includes('点击上方')) {
            alert('⚠️ 请先生成提示词后再确认应用！');
            return;
        }
        
        // 将提示词应用到工作流
        applyPromptToWorkflow(promptText);
    }
}

/**
 * 将提示词应用到工作流
 */
function applyPromptToWorkflow(promptText) {
    try {
        const currentNode = window.currentVPENode;
        if (!currentNode) {
            console.error('无法获取当前节点实例');
            alert('❌ 应用失败：无法获取当前节点实例');
            return;
        }

        const promptWidget = currentNode.widgets?.find(w => w.name === "enhanced_prompt");
        if (promptWidget) {
            promptWidget.value = promptText;
        }

        const modal = document.getElementById('unified-editor-modal');
        if (modal?.annotations && modal.annotations.length > 0) {
            const annotationWidget = currentNode.widgets?.find(w => w.name === "annotation_data");
            if (annotationWidget) {
                const annotationData = {
                    annotations: modal.annotations,
                    include_annotation_numbers: false,
                    enhanced_prompt: promptText,
                    timestamp: new Date().toISOString()
                };
                annotationWidget.value = JSON.stringify(annotationData);
            }
        }

        // 触发节点更新
        if (currentNode.onPropertyChanged) {
            currentNode.onPropertyChanged("enhanced_prompt", promptText);
        }

        // 标记节点为已修改
        if (currentNode.setDirtyCanvas) {
            currentNode.setDirtyCanvas(true);
        }

        // 显示成功消息
        const successMsg = `✅ 提示词已确认并应用到工作流！

📝 生成的提示词：
${promptText.substring(0, 100)}${promptText.length > 100 ? '...' : ''}

🔄 请继续您的ComfyUI工作流程。`;

        alert(successMsg);
        
        // 关闭弹窗
        const closeBtn = document.getElementById('vpe-close');
        if (closeBtn) {
            setTimeout(() => {
                closeBtn.click();
            }, 1000);
        }


    } catch (error) {
        console.error('应用提示词到工作流时出错:', error);
        alert('❌ 应用失败：' + error.message);
    }
}

/**
 * 设置实时预览功能（防抖处理）
 */
function setupRealtimePreview(enhancerType) {
    let debounceTimer;
    
    const inputElements = [
        document.getElementById('edit-description'),
        document.getElementById('edit-intent'),
        document.getElementById('processing-style'),
        document.getElementById('temperature'),
        document.getElementById('seed')
    ];
    
    inputElements.forEach(element => {
        if (element) {
            const eventType = element.tagName === 'TEXTAREA' || element.type === 'text' ? 'input' : 'change';
            element.addEventListener(eventType, () => {
                clearTimeout(debounceTimer);
                
                // 显示正在更新状态
                const previewStatus = document.getElementById('preview-status');
                if (previewStatus) {
                    previewStatus.textContent = '参数已更新';
                    previewStatus.style.background = 'rgba(59, 130, 246, 0.2)';
                    previewStatus.style.color = '#3b82f6';
                }
                
                // 500ms后触发预览更新
                debounceTimer = setTimeout(() => {
                    // 这里可以添加自动预览功能，如果用户启用了该选项
                }, 500);
            });
        }
    });
}

/**
 * 显示增强的提示词预览
 */
function displayEnhancedPrompt(promptText, previewContainer) {
    if (!previewContainer || !promptText) return;
    
    const displayHTML = `
        <div style="color: #10b981; line-height: 1.4; font-size: 10px; margin-bottom: 8px;">
            ${promptText}
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; padding-top: 6px; border-top: 1px dashed #555;">
            <div style="font-size: 8px; color: #666;">
                字符数: ${promptText.length} | 词汇数: ${promptText.split(' ').length}
            </div>
            <div style="font-size: 8px;">
                <span style="color: #10b981; cursor: pointer;" onclick="copyPromptToClipboard('${promptText.replace(/'/g, "\\'")}')">📋 复制</span>
            </div>
        </div>
    `;
    
    previewContainer.innerHTML = displayHTML;
}

/**
 * 分析提示词质量
 */
function analyzePromptQuality(promptText, isExample = false) {
    try {
        const analysis = {
            length: promptText.length,
            wordCount: promptText.split(' ').length,
            hasColorTerms: /\b(color|blue|red|green|yellow|purple|orange|pink|black|white|gray|grey)\b/i.test(promptText),
            hasQualityTerms: /\b(beautiful|stunning|professional|natural|smooth|seamless|realistic|high.quality)\b/i.test(promptText),
            hasActionTerms: /\b(transform|change|convert|maintain|ensure|create|blend|integrate)\b/i.test(promptText),
            hasLocationTerms: /\b(area|region|section|zone|marked|rectangular|circular)\b/i.test(promptText)
        };
        
        // 计算质量分数
        let qualityScore = 0;
        if (analysis.length > 50 && analysis.length < 300) qualityScore += 25;
        if (analysis.wordCount > 10 && analysis.wordCount < 50) qualityScore += 25;
        if (analysis.hasColorTerms) qualityScore += 15;
        if (analysis.hasQualityTerms) qualityScore += 15;
        if (analysis.hasActionTerms) qualityScore += 10;
        if (analysis.hasLocationTerms) qualityScore += 10;
        
        // 可以在这里添加更多的质量反馈逻辑
        if (qualityScore >= 80) {
        } else if (qualityScore >= 60) {
        } else {
        }
        
    } catch (error) {
    }
}

/**
 * 复制提示词到剪贴板
 */
function copyPromptToClipboard(promptText) {
    if (!promptText) return;
    
    navigator.clipboard.writeText(promptText).then(() => {
        
        // 显示临时提示
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 30000;
            background: #10b981; color: white; padding: 8px 16px;
            border-radius: 6px; font-size: 12px; font-weight: bold;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
            animation: slideInFromRight 0.3s ease;
        `;
        toast.textContent = '✅ 提示词已复制！';
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInFromRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
            style.remove();
        }, 2000);
        
    }).catch(error => {
        console.error('复制到剪贴板失败:', error);
        alert('复制失败，请手动复制提示词内容');
    });
}

/**
 * 增强器连接测试
 */
async function testEnhancerConnection(enhancerType) {
    
    try {
        let endpoint = '';
        let testData = {};
        
        switch (enhancerType) {
            case 'api':
                endpoint = '/kontext/api_test';
                const apiConfig = getAPIConfig();
                testData = {
                    api_provider: apiConfig.provider,
                    api_key: apiConfig.apiKey,
                    base_url: apiConfig.baseUrl
                };
                break;
            case 'ollama':
                endpoint = '/kontext/ollama_test';
                const ollamaConfig = getOllamaConfig();
                testData = {
                    ollama_base_url: ollamaConfig.baseUrl
                };
                break;
            case 'textgen':
                endpoint = '/kontext/textgen_test';
                const textgenConfig = getTextGenConfig();
                testData = {
                    base_url: textgenConfig.baseUrl
                };
                break;
        }
        
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            return { success: true, message: '连接正常' };
        } else {
            return { success: false, message: result.error };
        }
        
    } catch (error) {
        console.error(`❌ ${enhancerType}增强器连接测试失败:`, error);
        return { success: false, message: error.message };
    }
}

/**
 * 测试API连接
 */
async function testAPIConnection() {
    const statusElement = document.getElementById('api-status');
    if (statusElement) {
        statusElement.textContent = '● 测试中...';
        statusElement.style.color = '#f59e0b';
    }
    
    const result = await testEnhancerConnection('api');
    
    if (statusElement) {
        if (result.success) {
            statusElement.textContent = '● 连接正常';
            statusElement.style.color = '#10b981';
        } else {
            statusElement.textContent = '● 连接失败';
            statusElement.style.color = '#ef4444';
        }
    }
}

/**
 * 测试Ollama连接
 */
async function testOllamaConnection() {
    const statusElement = document.getElementById('ollama-status');
    if (statusElement) {
        statusElement.textContent = '● 测试中...';
        statusElement.style.color = '#f59e0b';
    }
    
    const result = await testEnhancerConnection('ollama');
    
    if (statusElement) {
        if (result.success) {
            statusElement.textContent = '● 连接正常';
            statusElement.style.color = '#10b981';
        } else {
            statusElement.textContent = '● 连接失败';
            statusElement.style.color = '#ef4444';
        }
    }
}

/**
 * 测试TextGen连接
 */
async function testTextGenConnection() {
    const statusElement = document.getElementById('textgen-status');
    if (statusElement) {
        statusElement.textContent = '● 测试中...';
        statusElement.style.color = '#f59e0b';
    }
    
    const result = await testEnhancerConnection('textgen');
    
    if (statusElement) {
        if (result.success) {
            statusElement.textContent = '● 连接正常';
            statusElement.style.color = '#10b981';
        } else {
            statusElement.textContent = '● 连接失败';
            statusElement.style.color = '#ef4444';
        }
    }
}

/**
 * 创建图层列表项
 * 从主文件迁移的UI创建逻辑
 */
export function createLayerListItem(layer, layerId, type, nodeInstance) {
    const layerItem = document.createElement('div');
    layerItem.className = 'layer-list-item vpe-layer-item';
    layerItem.setAttribute('data-layer-id', layerId);
    layerItem.setAttribute('data-layer-type', type);
    layerItem.setAttribute('draggable', 'true');
    layerItem.style.position = 'relative';
    
    let icon, description, statusColor;
    // 直接使用layer.visible，默认为true
    const isVisible = layer.visible !== false; // 默认为可见
    
    if (type === 'IMAGE_LAYER') {
        icon = '🖼️';
        description = layer.name;
        statusColor = '#10b981';
    } else {
        // 为annotation保持一致的图标，基于type生成但保存到layer对象中以便复用
        if (!layer.cachedIcon) {
            layer.cachedIcon = nodeInstance?.getSimpleIcon ? nodeInstance.getSimpleIcon(layer.type) : '📝';
        }
        icon = layer.cachedIcon;
        description = `${layer.type} annotation ${layer.number + 1}`;
        statusColor = '#4CAF50';
    }
    
    layerItem.innerHTML = `
        <div class="layer-drag-handle" 
             style="cursor: grab; margin-right: 8px; padding: 4px; color: #888; font-size: 14px; user-select: none;"
             title="Drag to reorder">
            ⋮⋮
        </div>
        <button class="layer-visibility-btn" data-layer-id="${layerId}" data-layer-type="${type}"
                style="background: none; border: none; cursor: pointer; margin-right: 8px; font-size: 16px; padding: 2px;">
            ${isVisible ? '👁️' : '🙈'}
        </button>
        <input type="checkbox" data-annotation-id="${layerId}" data-layer-id="${layerId}" data-layer-type="${type}"
               style="margin-right: 8px; accent-color: ${statusColor};">
        <span style="margin-right: 8px; font-size: 16px;">${icon}</span>
        <span style="flex: 1; color: white; font-size: 12px; opacity: ${isVisible ? '1' : '0.5'};">${description}</span>
        <div class="layer-controls" style="display: flex; align-items: center; margin-left: 8px; gap: 4px;">
            <div class="layer-order-controls" style="display: flex; flex-direction: column;">
                <button class="layer-move-up" data-layer-id="${layerId}" data-layer-type="${type}"
                        style="background: none; border: none; cursor: pointer; color: #888; font-size: 10px; line-height: 1; padding: 1px 3px;"
                        title="Move Up">
                    ▲
                </button>
                <button class="layer-move-down" data-layer-id="${layerId}" data-layer-type="${type}"
                        style="background: none; border: none; cursor: pointer; color: #888; font-size: 10px; line-height: 1; padding: 1px 3px;"
                        title="Move Down">
                    ▼
                </button>
            </div>
        </div>
        <span style="color: ${statusColor}; font-size: 10px; margin-left: 8px; opacity: ${isVisible ? '1' : '0.5'};">
            ${type === 'IMAGE_LAYER' ? 'LAYER' : 'ANNOTATION'}
        </span>
    `;
    
    return layerItem;
}

/**
 * Load Fabric objects to panel
 * Updated to display Fabric.js objects instead of layer connections
 */
export function loadLayersToPanel(modal, layers) {
    
    // Safety checks
    if (!modal) {
        console.error('❌ loadLayersToPanel: modal is null/undefined');
        return;
    }

    // Find the layers container - use correct element ID from UI module
    const layersList = modal.querySelector('#annotation-objects');
    
    if (!layersList) {
        console.error('❌ loadLayersToPanel: #annotation-objects element not found');
        return;
    }
    
    if (!Array.isArray(layers) || layers.length === 0) {
        layersList.innerHTML = '<div style="color: #888; text-align: center; padding: 20px;">No Fabric objects<br><small>Draw annotations to see them here</small></div>';
        return;
    }
    
    try {
        layersList.innerHTML = '';
        
        layers.forEach((layer, index) => {
        const layerItem = document.createElement('div');
        layerItem.style.cssText = `
            margin: 8px 0; padding: 12px; background: #2b2b2b;
            border-radius: 6px; cursor: pointer; border: 2px solid transparent;
            transition: all 0.2s;
        `;
        
        layerItem.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="flex: 1;">
                    <div style="color: white; font-weight: 600; margin-bottom: 4px;">${layer.class_name || 'Annotation'}</div>
                    <div style="font-size: 12px; color: #888;">
                        ID: ${layer.id || index} | Type: ${layer.type || 'manual'}
                    </div>
                    ${layer.area ? `<div style="font-size: 12px; color: #888;">Area: ${layer.area} px</div>` : ''}
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <input type="checkbox" ${index < 3 ? 'checked' : ''} data-layer-id="${layer.id || index}" 
                           style="transform: scale(1.2);">
                </div>
            </div>
        `;
        
        // 点击选择图层
        layerItem.onclick = (e) => {
            if (e.target.type !== 'checkbox') {
                const checkbox = layerItem.querySelector('input[type="checkbox"]');
                checkbox.checked = !checkbox.checked;
            }
            
            const isSelected = layerItem.querySelector('input[type="checkbox"]').checked;
            layerItem.style.borderColor = isSelected ? '#673AB7' : 'transparent';
            layerItem.style.background = isSelected ? '#3a2a5c' : '#2b2b2b';
            
        };
        
        layersList.appendChild(layerItem);
    });
    
    } catch (error) {
        console.error('❌ Error in loadLayersToPanel:', error);
        console.error('❌ Error stack:', error.stack);
    }
}

/**
 * 显示Toast通知
 * @param {string} message - 通知消息
 * @param {string} type - 通知类型 ('success', 'error', 'info')
 * @param {Element} targetElement - 可选，相对定位的目标元素
 */
export function showToast(message, type = 'success', targetElement = null) {
    const colors = {
        success: '#10b981',
        error: '#ef4444', 
        info: '#3b82f6'
    };
    
    const toast = document.createElement('div');
    
    let positionStyle;
    let animationName;
    
    if (targetElement) {
        // 相对于目标元素定位，显示在元素上方
        const rect = targetElement.getBoundingClientRect();
        positionStyle = `
            position: fixed;
            left: ${rect.left + (rect.width / 2)}px;
            top: ${rect.top - 60}px;
            transform: translateX(-50%);
            z-index: 30000;
        `;
        animationName = 'slideInFromTop';
    } else {
        // 默认右上角定位
        positionStyle = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 30000;
        `;
        animationName = 'slideInFromRight';
    }
    
    toast.style.cssText = `
        ${positionStyle}
        background: ${colors[type]}; color: white; padding: 8px 16px;
        border-radius: 6px; font-size: 12px; font-weight: bold;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        animation: ${animationName} 0.3s ease;
        white-space: nowrap;
    `;
    toast.textContent = message;
    
    // 添加动画样式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInFromRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideInFromTop {
            from { transform: translate(-50%, -20px); opacity: 0; }
            to { transform: translate(-50%, 0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(toast);
    
    // 3秒后自动移除
    setTimeout(() => {
        toast.remove();
        style.remove();
    }, 3000);
}

/**
 * 应用设置到选中的图层
 */
function applySettingsToSelectedLayers(layersContent, applyButton) {
    try {
        const modal = layersContent.closest('#unified-editor-modal');
        if (!modal) {
            showToast('❌ 无法找到模态窗口', 'error', applyButton);
            return;
        }
        
        console.log('🔍 Apply to Selected - Debugging:', {
            modal: !!modal,
            modalNodeInstance: !!modal.nodeInstance,
            windowCurrentVPEInstance: !!window.currentVPEInstance,
            windowCurrentVPENode: !!window.currentVPENode
        });

        // 获取当前设置
        const operationType = modal.querySelector('#operation-type')?.value || '';
        const targetInput = modal.querySelector('#target-input')?.value || '';
        
        const constraintPrompts = [];
        const constraintCheckboxes = modal.querySelectorAll('#layer-constraint-prompts-container .constraint-prompt-checkbox:checked');
        constraintCheckboxes.forEach(checkbox => {
            const promptText = checkbox.nextElementSibling?.textContent?.trim();
            if (promptText) {
                constraintPrompts.push(promptText);
            }
        });
        
        const decorativePrompts = [];
        const decorativeCheckboxes = modal.querySelectorAll('#layer-decorative-prompts-container .decorative-prompt-checkbox:checked');
        decorativeCheckboxes.forEach(checkbox => {
            const promptText = checkbox.nextElementSibling?.textContent?.trim();
            if (promptText) {
                decorativePrompts.push(promptText);
            }
        });

        // 获取选中的图层
        const selectedLayers = [];
        
        // 方法1: 从图层列表获取选中的图层
        const layerItems = modal.querySelectorAll('#layers-list .layer-list-item');
        layerItems.forEach(item => {
            const checkbox = item.querySelector('input[type="checkbox"]');
            if (checkbox && checkbox.checked) {
                selectedLayers.push(item.dataset.layerId);
            }
        });
        
        // 方法2: 如果没有勾选的图层，使用当前选中的图层
        if (selectedLayers.length === 0 && modal.currentSelectedLayer) {
            selectedLayers.push(modal.currentSelectedLayer);
        }
        
        // 方法3: 从modal.selectedLayers Set获取
        if (selectedLayers.length === 0 && modal.selectedLayers && modal.selectedLayers.size > 0) {
            selectedLayers.push(...Array.from(modal.selectedLayers));
        }

        if (selectedLayers.length === 0) {
            showToast('❌ 请先选择要应用设置的图层', 'error', applyButton);
            return;
        }

        // 获取nodeInstance来使用dataManager
        let nodeInstance = modal.nodeInstance || window.currentVPEInstance || window.currentVPENode;
        
        // 如果还是没有找到，尝试从全局获取
        if (!nodeInstance) {
            nodeInstance = window.app?.graph?._nodes?.find(node => node.type === 'VisualPromptEditor');
        }
        
        if (!nodeInstance) {
            showToast('❌ 节点实例不可用', 'error', applyButton);
            console.error('nodeInstance not found. Available:', {
                modalNodeInstance: modal.nodeInstance,
                windowCurrentVPEInstance: window.currentVPEInstance,
                windowCurrentVPENode: window.currentVPENode
            });
            return;
        }
        
        if (!nodeInstance.dataManager) {
            // 尝试直接初始化layerStateCache作为备用方案
            if (!modal.layerStateCache) {
                modal.layerStateCache = new Map();
            }
            console.warn('dataManager not available, using modal layerStateCache as fallback');
        }

        // 应用设置到每个选中的图层
        const layerState = {
            operationType: operationType,
            targetInput: targetInput,
            constraintPrompts: constraintPrompts,
            decorativePrompts: decorativePrompts,
            timestamp: Date.now()
        };

        let appliedCount = 0;
        selectedLayers.forEach(layerId => {
            if (layerId) {
                nodeInstance.dataManager.layerStateCache.set(layerId, { ...layerState });
                appliedCount++;
            }
        });

        if (appliedCount > 0) {
            const message = appliedCount === 1 
                ? '✅ 已应用到 1 个图层' 
                : `✅ 已应用到 ${appliedCount} 个图层`;
            showToast(message, 'success', applyButton);
        } else {
            showToast('❌ 没有成功应用到任何图层', 'error', applyButton);
        }

    } catch (error) {
        console.error('Apply settings to layers failed:', error);
        showToast('❌ 应用设置失败', 'error', applyButton);
    }
}

// 在window对象上暴露函数，以便在HTML中调用
window.toggleEnhancerConfig = toggleEnhancerConfig;
window.copyPromptToClipboard = copyPromptToClipboard;
window.testEnhancerConnection = testEnhancerConnection;
window.testAPIConnection = testAPIConnection;
window.testOllamaConnection = testOllamaConnection;
window.testTextGenConnection = testTextGenConnection;