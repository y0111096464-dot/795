<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nexus AI Hub | المنصة المتكاملة</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {
            --primary: #6366f1;
            --secondary: #a855f7;
            --accent: #f43f5e;
            --bg-dark: #0f172a;
            --glass: rgba(30, 41, 59, 0.7);
        }

        body {
            font-family: 'Cairo', sans-serif;
            background-color: var(--bg-dark);
            color: #f8fafc;
            overflow-x: hidden;
            margin: 0;
        }

        .glass-panel {
            background: var(--glass);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 24px;
        }

        .ai-gradient-text {
            background: linear-gradient(135deg, #6366f1, #a855f7, #f43f5e);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .glow-btn {
            position: relative;
            transition: all 0.3s ease;
        }

        .glow-btn:hover:not(:disabled) {
            box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
            transform: translateY(-2px);
        }

        .glow-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .tab-content {
            display: none;
            animation: fadeIn 0.4s ease-out;
        }

        .tab-content.active {
            display: block;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .loader {
            width: 20px;
            height: 20px;
            border: 2px solid #FFF;
            border-bottom-color: transparent;
            border-radius: 50%;
            display: inline-block;
            animation: rotation 1s linear infinite;
        }

        @keyframes rotation {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .code-editor {
            font-family: 'Consolas', 'Monaco', monospace;
            background: #0f172a;
            color: #e2e8f0;
            padding: 1.5rem;
            border-radius: 12px;
            border: 1px solid #334155;
            overflow-x: auto;
            direction: ltr;
            text-align: left;
            font-size: 14px;
            line-height: 1.6;
            max-height: 500px;
        }

        /* لإخفاء السكرول النافلي */
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
    </style>
</head>
<body class="min-h-screen flex flex-col">

    <!-- Navigation -->
    <header class="p-4 sticky top-0 z-50">
        <div class="glass-panel px-6 py-4 flex justify-between items-center max-w-7xl mx-auto">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg">
                    <i class="fas fa-microchip text-white text-xl"></i>
                </div>
                <h1 class="text-xl font-bold ai-gradient-text tracking-tight hidden sm:block">NEXUS PRO</h1>
            </div>
            <nav class="flex items-center gap-2 md:gap-4 overflow-x-auto no-scrollbar py-1">
                <button onclick="showTab('text-gen')" class="nav-link px-3 py-1 text-sm font-semibold text-indigo-400 border-b-2 border-indigo-500 transition-all">النصوص</button>
                <button onclick="showTab('forge-ide')" class="nav-link px-3 py-1 text-sm font-semibold hover:text-indigo-400 transition-all">البرمجة</button>
                <button onclick="showTab('vision')" class="nav-link px-3 py-1 text-sm font-semibold hover:text-indigo-400 transition-all">الرؤية</button>
                <button onclick="showTab('image-gen')" class="nav-link px-3 py-1 text-sm font-semibold hover:text-indigo-400 transition-all">الصور</button>
                <button onclick="showTab('audio-gen')" class="nav-link px-3 py-1 text-sm font-semibold hover:text-indigo-400 transition-all">الصوت</button>
            </nav>
        </div>
    </header>

    <main class="flex-1 container mx-auto px-4 pt-4 pb-20">

        <!-- Welcome Section -->
        <section class="text-center mb-10 mt-4">
            <h2 class="text-3xl md:text-5xl font-black mb-4">قوة <span class="ai-gradient-text">الذكاء المطلق</span></h2>
            <p class="text-slate-400 text-sm md:text-base">تحكم في أقوى النماذج العالمية لإنشاء أي شيء تتخيله في مكان واحد.</p>
        </section>

        <!-- Tab: Forge IDE (Software Creation) -->
        <div id="forge-ide" class="tab-content">
            <div class="glass-panel p-6 max-w-5xl mx-auto shadow-2xl">
                <div class="flex items-center gap-3 mb-6">
                    <i class="fas fa-terminal text-cyan-400 text-2xl"></i>
                    <h3 class="text-xl font-bold">Forge IDE | بناء الأنظمة والمنصات</h3>
                </div>
                <textarea id="code-prompt" placeholder="صف البرنامج الذي تريده (مثلاً: نظام إدارة مهام كامل مع تخزين بيانات وتصميم عصري)" class="w-full h-32 bg-slate-900/50 border border-slate-700 rounded-xl p-4 mb-4 focus:ring-2 focus:ring-cyan-500 outline-none transition-all" dir="rtl"></textarea>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <button onclick="generateSoftware('html')" id="html-btn" class="py-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl font-bold transition-all flex items-center justify-center gap-3">
                        <i class="fab fa-chrome text-orange-400 text-xl"></i> بناء منصة ويب كاملة
                    </button>
                    <button onclick="generateSoftware('python')" id="py-btn" class="py-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl font-bold transition-all flex items-center justify-center gap-3">
                        <i class="fab fa-python text-blue-400 text-xl"></i> بناء برنامج Python متطور
                    </button>
                </div>
                <div id="code-result-container" class="mt-8 hidden animate-fadeIn">
                    <div class="flex justify-between items-center mb-4 bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                        <span class="text-cyan-400 font-mono text-xs">SOURCE_CODE_READY</span>
                        <div class="flex gap-2">
                            <button onclick="copyToClipboard('code-output')" class="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-md text-xs font-bold transition-all">نسخ الكود</button>
                            <button id="preview-btn" onclick="previewCode()" class="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-md text-xs font-bold transition-all hidden">تشغيل المنصة</button>
                        </div>
                    </div>
                    <pre id="code-output" class="code-editor"></pre>
                </div>
                <div id="live-preview-container" class="mt-8 hidden border-2 border-slate-700 rounded-2xl overflow-hidden shadow-2xl bg-white">
                    <div class="bg-slate-800 p-3 flex justify-between items-center text-white text-xs px-6">
                        <span class="font-bold flex items-center gap-2"><i class="fas fa-play-circle text-emerald-400"></i> نظام المعاينة الحية</span>
                        <button onclick="document.getElementById('live-preview-container').classList.add('hidden')" class="hover:text-rose-400 transition-colors">إغلاق <i class="fas fa-times"></i></button>
                    </div>
                    <iframe id="code-iframe" class="w-full h-[600px] border-none"></iframe>
                </div>
            </div>
        </div>

        <!-- Tab: Text Generation -->
        <div id="text-gen" class="tab-content active">
*

