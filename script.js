document.addEventListener('DOMContentLoaded', () => {
    const bodyElement = document.body;
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const searchEngineBtns = document.querySelectorAll('.search-engine-btn-inline');

    const currentDateDisplay = document.getElementById('current-date');
    const currentTimeDisplay = document.getElementById('current-time');
    const weatherInfo = document.getElementById('weather-info');
    const hitokotoQuote = document.getElementById('hitokoto-quote');
    document.getElementById('current-year').textContent = new Date().getFullYear();

    const weiboHotContent = document.getElementById('weibo-hot-content');
    const sspaiHotContent = document.getElementById('sspai-hot-content');
    const githubHotContent = document.getElementById('github-hot-content');

    const toggleFocusModeBtn = document.getElementById('toggle-focus-mode');

    const toolLinksContainer = document.getElementById('tool-links');

    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoListUL = document.getElementById('todo-list');
    let todos = [];

    const WEIBO_API_URL = 'https://listapi.vercel.app/weibo';
    const SSPAI_API_URL = 'https://listapi.vercel.app/sspai';
    const GITHUB_API_URL = 'https://listapi.vercel.app/hellogithub';

    const TOOLS_API_URL = '/tool.json';

    async function fetchApiData(url, sourceName = "Data") {
        console.log(`Workspaceing ${sourceName} from: ${url}`);
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} for ${sourceName}`);
            }
            const jsonData = await response.json();
            if (jsonData.code === 200 && Array.isArray(jsonData.data)) {
                return jsonData.data;
            } else if (Array.isArray(jsonData)) {
                return jsonData;
            }
            throw new Error(`API error or invalid data structure for ${sourceName}: ${jsonData.message || jsonData.msg || 'Unknown API error'}`);
        } catch (error) {
            console.error(`Error fetching ${sourceName}:`, error);
            throw error;
        }
    }

    async function fetchAndRenderTools() {
        const toolLoadingMessage = toolLinksContainer.querySelector('.tool-loading-message');
        try {
            console.log(`Workspaceing tools from: ${TOOLS_API_URL}`);
            const response = await fetch(TOOLS_API_URL);
            if (!response.ok) {
                let errorDetail = `HTTP error! Status: ${response.status}`;
                try {
                    const errorText = await response.text();
                    errorDetail += ` - ${errorText.substring(0,100)}`;
                } catch (e) { /* no extra detail */ }
                throw new Error(errorDetail);
            }
            const jsonData = await response.json();

            if (jsonData && jsonData.success === true && Array.isArray(jsonData.data)) {
                renderTools(jsonData.data);
            } else if (Array.isArray(jsonData)) {
                renderTools(jsonData);
            } else if (jsonData && jsonData.data && Array.isArray(jsonData.data)) {
                renderTools(jsonData.data);
            }
            else {
                throw new Error(jsonData.message || 'Invalid data structure from tools API');
            }
        } catch (error) {
            console.error("Failed to fetch or render tools:", error);
            if (toolLoadingMessage) toolLoadingMessage.remove();
            toolLinksContainer.innerHTML = `<p class="text-red-500 col-span-full text-center py-4">
                                                <i class="fas fa-exclamation-triangle mr-2"></i>常用工具加载失败。<br>
                                                <span class="text-xs text-gray-400">(${error.message})</span><br>
                                                <span class="text-xs text-gray-400 mt-1">请检查链接或网络，并确认服务器CORS策略允许本域访问。</span>
                                           </p>`;
        }
    }

    function renderTools(toolDataArray) {
        const toolLoadingMessage = toolLinksContainer.querySelector('.tool-loading-message');
        if (toolLoadingMessage) toolLoadingMessage.remove();

        toolLinksContainer.innerHTML = '';
        if (!toolDataArray || toolDataArray.length === 0) {
            toolLinksContainer.innerHTML = '<p class="text-gray-400 col-span-full text-center py-4">常用工具列表为空。</p>';
            return;
        }
        const defaultIconColor = 'text-sky-500';

        toolDataArray.forEach(tool => {
            const toolLink = document.createElement('a');
            toolLink.href = tool.url;
            toolLink.target = "_blank";
            toolLink.className = "tool-item p-3 rounded-xl flex flex-col items-center justify-center aspect-square";
            toolLink.title = tool.description || tool.name;

            const iconElement = document.createElement('i');
            iconElement.className = `${tool.icon || 'fas fa-link'} fa-2x mb-1.5 ${tool.accentColor || defaultIconColor}`;

            const nameSpan = document.createElement('span');
            nameSpan.className = "text-xs text-center text-gray-600";
            nameSpan.textContent = tool.name;

            toolLink.appendChild(iconElement);
            toolLink.appendChild(nameSpan);
            toolLinksContainer.appendChild(toolLink);
        });
    }

    fetchAndRenderTools();

    function setActiveSearchEngine(btn) {
        searchInput.classList.remove('ring-2', 'ring-red-500/70', 'placeholder:text-red-500/70');

        searchEngineBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        searchForm.action = btn.dataset.url;
        searchInput.name = btn.dataset.query;
        searchInput.placeholder = `在 ${btn.title || btn.dataset.engine} 中探索...`;
    }

    searchEngineBtns.forEach(btn => btn.addEventListener('click', () => setActiveSearchEngine(btn)));

    const bingButton = Array.from(searchEngineBtns).find(btn => btn.dataset.engine === 'bing');
    if (bingButton) {
        setActiveSearchEngine(bingButton);
    } else if (searchEngineBtns.length > 0) {
        setActiveSearchEngine(searchEngineBtns[0]);
    }

    searchForm.addEventListener('submit', (event) => {
        if (!searchInput.value.trim()) {
            event.preventDefault();
            searchInput.focus();
            searchInput.classList.add('ring-2', 'ring-red-500/70', 'placeholder:text-red-500/70');
            setTimeout(() => searchInput.classList.remove('ring-2', 'ring-red-500/70', 'placeholder:text-red-500/70'), 1500);
            return;
        }
        searchForm.target = "_blank";
    });

    function updateDateTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        currentTimeDisplay.innerHTML = `
            <span class="text-3xl md:text-4xl">${hours}</span><span class="time-colon text-3xl md:text-4xl mx-0.5 relative top-[-0.03em]">:</span><span class="text-3xl md:text-4xl">${minutes}</span><span class="time-colon text-xl md:text-2xl relative top-[-0.1em] mx-0.5">:</span><span class="text-xl md:text-2xl text-gray-600">${seconds}</span>
        `;
        currentDateDisplay.textContent = now.toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
    updateDateTime();
    setInterval(updateDateTime, 1000);

    async function fetchWeather() {
        try {
            const response = await fetch(`https://wttr.in/?format=j1`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            const currentCondition = data.current_condition[0];
            let cityName = "未知地点"; let regionName = "";
            if (data.nearest_area && data.nearest_area.length > 0) {
                const weatherArea = data.nearest_area[0];
                if (weatherArea.areaName && weatherArea.areaName.length > 0) cityName = weatherArea.areaName[0].value;
                if (weatherArea.region && weatherArea.region.length > 0 && weatherArea.region[0].value) regionName = weatherArea.region[0].value;
                else if (weatherArea.country && weatherArea.country.length > 0 && weatherArea.country[0].value) regionName = weatherArea.country[0].value;
            }
            const locationDisplay = regionName ? `${cityName}, ${regionName}` : cityName;
            const weatherIcon = getWeatherIcon(currentCondition.weatherCode);
            weatherInfo.innerHTML = `
                    <i class="fas ${weatherIcon} mr-1.5 text-amber-500"></i>
                    ${locationDisplay}
                    <span class="ml-1.5">${currentCondition.temp_C}°C <span class="hidden sm:inline text-gray-500">(${currentCondition.weatherDesc[0].value})</span></span>
                    <span class="ml-1.5 text-sm text-gray-500 hidden md:inline">体感: ${currentCondition.FeelsLikeC}°C</span>`;
        } catch (error) {
            console.error('获取天气失败:', error);
            weatherInfo.innerHTML = `<i class="fas fa-exclamation-circle mr-2 text-orange-500"></i>天气信息加载失败`;
        }
    }

    function getWeatherIcon(weatherCode) {
        const code = parseInt(weatherCode);
        if (code === 113) return 'fa-sun'; if (code === 116) return 'fa-cloud-sun'; if (code === 119) return 'fa-cloud'; if (code === 122) return 'fa-cloud-meatball';
        if ([176, 179, 182, 185, 263, 266, 281, 284, 293, 296, 299, 302, 305, 308, 311, 353, 356, 359].includes(code)) return 'fa-cloud-showers-heavy';
        if ([176,185,227,317,320,323,326,329,332,335,338,350,368,371,392,395].includes(code)) return 'fa-snowflake';
        if (code === 200) return 'fa-cloud-bolt'; return 'fa-smog';
    }
    fetchWeather();
    setInterval(fetchWeather, 30 * 60 * 1000);

    async function fetchHitokoto() {
        hitokotoQuote.style.opacity = '0.3';
        try {
            const response = await fetch('https://v1.hitokoto.cn/?encode=json&charset=utf-8&c=a&c=b&c=c&c=d&c=e&c=f&c=g&c=h&c=i&c=j&c=k&c=l');
            if (!response.ok) throw new Error('Network response was not ok for Hitokoto');
            const data = await response.json();
            let quoteText = data.hitokoto; let sourceHTML = '';
            if (data.from_who || data.from) {
                sourceHTML = `<span class="source-text">—— ${data.from_who || ''}${data.from_who && data.from ? ' ' : ''}${data.from ? `《${data.from}》` : ''}</span>`;
            }
            hitokotoQuote.innerHTML = quoteText + sourceHTML;
        } catch (error) {
            hitokotoQuote.innerHTML = '保持探索，保持热爱。<span class="source-text">—— 导航</span>';
        } finally {
            setTimeout(() => { hitokotoQuote.style.opacity = '1'; }, 100);
        }
    }
    fetchHitokoto();
    hitokotoQuote.addEventListener('click', fetchHitokoto);

    function displayHotDataError(containerElement, sourceName = "内容") {
        containerElement.innerHTML = `<div class="flex flex-col items-center justify-center h-full text-gray-500 p-4">
                                        <i class="fas fa-wifi-slash fa-2x mb-3 text-orange-400"></i>
                                        <p>${sourceName}加载失败</p>
                                        <p class="text-xs mt-1">请检查网络或稍后重试</p>
                                    </div>`;
    }

    function renderSimplifiedHotList(items, container, titleKey = 'title', urlKey = 'url') {
        if (!Array.isArray(items) || items.length === 0) {
            container.innerHTML = `<p class="text-center p-4 text-gray-500"><i class="fas fa-list-alt mr-2"></i> 暂无热点数据</p>`;
            return;
        }
        let html = '<ul class="space-y-0">';
        items.slice(0, 10).forEach((item, index) => {
            const title = item[titleKey] || '未知标题';
            const url = item[urlKey] || '#';
            html += `
                    <li class="hot-item py-3 px-2 rounded-md"> 
                        <a href="${url}" target="_blank" class="flex items-start text-sm group w-full">
                            <span class="text-xs w-7 text-center mr-1.5 pt-1 text-gray-400 group-hover:text-sky-500 transition-colors flex-shrink-0">${index + 1}.</span> 
                            <span class="hot-title-text text-base  group-hover:text-sky-500 transition-colors flex-grow min-w-0">${title}</span> 
                        </a>
                    </li>`;
        });
        html += '</ul>';
        container.innerHTML = html;
        if (container.firstChild && container.firstChild.tagName === 'UL') {
            container.firstChild.classList.add('divide-y', 'divide-gray-200');
        }
    }

    fetchApiData(WEIBO_API_URL, "Weibo")
        .then(data => renderSimplifiedHotList(data, weiboHotContent, 'title', 'url'))
        .catch(error => { console.error("微博热搜加载失败:", error); displayHotDataError(weiboHotContent, "微博热搜"); });

    fetchApiData(SSPAI_API_URL, "Sspai")
        .then(data => renderSimplifiedHotList(data, sspaiHotContent, 'title', 'url'))
        .catch(error => { console.error("少数派热榜加载失败:", error); displayHotDataError(sspaiHotContent, "少数派热榜"); });

    fetchApiData(GITHUB_API_URL, "HelloGitHub")
        .then(data => renderSimplifiedHotList(data, githubHotContent, 'title', 'url'))
        .catch(error => { console.error("HelloGitHub加载失败:", error); displayHotDataError(githubHotContent, "HelloGitHub"); });

    let isFocused = false;
    toggleFocusModeBtn.addEventListener('click', () => {
        isFocused = !isFocused;
        bodyElement.classList.toggle('focused', isFocused);
        toggleFocusModeBtn.classList.toggle('active', isFocused);
        toggleFocusModeBtn.title = isFocused ? "退出专注" : "专注模式";
        const iconElement = toggleFocusModeBtn.querySelector('i');
        if (isFocused) {
            iconElement.classList.remove('fa-street-view'); iconElement.classList.add('fa-eye');
        } else {
            iconElement.classList.remove('fa-eye'); iconElement.classList.add('fa-street-view');
        }
    });

    function loadTodos() {
        const storedTodos = localStorage.getItem('todos');
        if (storedTodos) { todos = JSON.parse(storedTodos); }
        renderTodos();
    }

    function saveTodos() { localStorage.setItem('todos', JSON.stringify(todos)); }

    function renderTodos() {
        todoListUL.innerHTML = '';
        if (todos.length === 0) {
            todoListUL.innerHTML = `<p class="text-center text-gray-400 py-4">太棒了，没有待办事项! <i class="fas fa-glass-cheers ml-1 text-yellow-500"></i></p>`;
            return;
        }
        todos.forEach((todo, index) => {
            const li = document.createElement('li');
            li.className = `flex items-center justify-between p-2.5 rounded-lg group transition-colors duration-150 shadow-sm ${todo.completed ? 'bg-sky-50 hover:bg-sky-100' : 'bg-gray-50 hover:bg-gray-100'}`;
            li.dataset.index = index;
            const textSpan = document.createElement('span');
            textSpan.className = `todo-text flex-grow mr-2 text-sm ${todo.completed ? 'line-through text-gray-400' : 'text-gray-700'}`;
            textSpan.textContent = todo.text;
            textSpan.addEventListener('click', () => toggleTodoCompleted(index));
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-todo-btn text-red-400 hover:text-red-500 opacity-30 group-hover:opacity-100 transition-opacity duration-150 focus:outline-none ml-2 px-1';
            deleteBtn.innerHTML = `<i class="fas fa-trash-alt fa-sm"></i>`;
            deleteBtn.addEventListener('click', () => deleteTodo(index));
            li.appendChild(textSpan); li.appendChild(deleteBtn);
            todoListUL.appendChild(li);
        });
    }

    function addTodo(text) {
        if (!text.trim()) return;
        todos.unshift({ text: text.trim(), completed: false });
        if(todos.length > 15) todos.pop();
        saveTodos(); renderTodos();
    }

    function deleteTodo(index) { todos.splice(index, 1); saveTodos(); renderTodos(); }
    function toggleTodoCompleted(index) { todos[index].completed = !todos[index].completed; saveTodos(); renderTodos(); }

    todoForm.addEventListener('submit', (e) => { e.preventDefault(); addTodo(todoInput.value); todoInput.value = ''; });
    loadTodos();

    const contentBlocks = document.querySelectorAll('.content-block');
    contentBlocks.forEach((block, index) => {
        setTimeout(() => {
            block.classList.add('animate-fadeInUp');
        }, index * 70);
    });
});
