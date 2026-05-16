// 登录状态常量
const LOGIN_EXPIRE_MINUTES = 30;
const STORAGE_KEY_LOGIN = 'user_login_info';

// 应用状态管理
const AppState = {
    currentPage: 'login',
    currentSubPage: 'taxi-index',
    selectedStartLocation: null,
    selectedEndLocation: null,
    selectedCarType: 'comfort',
    addressSelectType: null,
    map: null,
    geocoder: null,
    currentAddressType: null
};

// 登录状态管理函数
function saveLoginInfo(userInfo) {
    const loginData = {
        user: userInfo,
        loginTime: Date.now(),
        expireMinutes: LOGIN_EXPIRE_MINUTES
    };
    localStorage.setItem(STORAGE_KEY_LOGIN, JSON.stringify(loginData));
}

function getLoginInfo() {
    const stored = localStorage.getItem(STORAGE_KEY_LOGIN);
    if (!stored) return null;
    
    try {
        const loginData = JSON.parse(stored);
        const now = Date.now();
        const expireTime = loginData.loginTime + (loginData.expireMinutes * 60 * 1000);
        
        if (now > expireTime) {
            clearLoginInfo();
            return null;
        }
        
        return loginData.user;
    } catch (e) {
        clearLoginInfo();
        return null;
    }
}

function clearLoginInfo() {
    localStorage.removeItem(STORAGE_KEY_LOGIN);
}

function isLoggedIn() {
    return getLoginInfo() !== null;
}

// DOM 元素
const loginPage = document.getElementById('login-page');
const mainApp = document.getElementById('main-app');
const navbar = document.getElementById('navbar');
const navbarTitle = document.getElementById('navbarTitle');
const contentArea = document.getElementById('contentArea');
const tabbar = document.getElementById('tabbar');// 全局变量
let addressModal;
let addressModalTitle;

// 初始化DOM元素
function initDOMElements() {
    addressModal = document.getElementById('address-modal');
    addressModalTitle = document.getElementById('addressModalTitle');
    toast = document.getElementById('toast');
    toastText = document.getElementById('toastText');
}

// 全局变量
let toast;
let toastText;

// 页面切换
function showPage(pageName) {
    loginPage.classList.remove('active');
    mainApp.classList.remove('active');
    
    if (pageName === 'login') {
        loginPage.classList.add('active');
    } else if (pageName === 'main') {
        mainApp.classList.add('active');
    }
    
    AppState.currentPage = pageName;
}

// 子页面切换
function showSubPage(pageName) {
    const subPages = contentArea.querySelectorAll('.sub-page');
    subPages.forEach(page => {
        page.classList.remove('active');
    });
    
    const targetPage = document.getElementById(pageName);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // 更新导航栏标题
    const pageTitles = {
        'taxi-index': '公务打车',
        'hotel-index': '酒店预订',
        'flight-index': '机票预订',
        'train-index': '火车票',
        'orders-index': '我的订单',
        'profile-index': '我的'
    };
    navbarTitle.textContent = pageTitles[pageName] || '企业商旅';
    
    // 更新 TabBar 选中状态
    const tabbarItems = tabbar.querySelectorAll('.tabbar-item');
    tabbarItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === pageName) {
            item.classList.add('active');
        }
    });
    
    AppState.currentSubPage = pageName;
    
    // 加载订单列表
    if (pageName === 'orders-index') {
        loadOrderList();
    }
}

// 显示 Toast
function showToast(message, type = 'success') {
    toastText.textContent = message;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 2000);
}

// 显示地址选择弹窗
function showAddressModal(type) {
    console.log('显示地址选择弹窗:', type);
    AppState.addressSelectType = type;
    console.log('addressModalTitle:', addressModalTitle);
    console.log('addressModal:', addressModal);
    if (addressModalTitle) {
        addressModalTitle.textContent = type === 'start' ? '选择出发地点' : '选择目的地';
        console.log('弹窗标题设置成功');
    }
    if (addressModal) {
        addressModal.classList.add('active');
        console.log('弹窗显示成功');
    } else {
        console.error('弹窗元素不存在');
    }
}

// 隐藏地址选择弹窗
function hideAddressModal() {
    if (addressModal) {
        addressModal.classList.remove('active');
    }
    AppState.addressSelectType = null;
}

// 初始化地图
function initMap() {
    if (AppState.map) return;
    
    // 检查DOM元素是否存在
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
        console.error('地图容器不存在');
        return;
    }
    
    try {
        // 创建地图实例
        AppState.map = new AMap.Map('map', {
            zoom: 13,
            center: [116.397428, 39.90923], // 默认北京
            resizeEnable: true
        });
        
        console.log('地图初始化成功');
        
        // 添加定位控件
        AppState.map.addControl(new AMap.Geolocation({
            enableHighAccuracy: true,
            timeout: 10000,
            buttonOffset: new AMap.Pixel(10, 20),
            zoomToAccuracy: true,
            buttonPosition: 'RB'
        }));
        
        // 初始化地理编码
        AppState.geocoder = new AMap.Geocoder({
            city: '全国'
        });
        
        // 尝试定位当前位置
        AMap.plugin('AMap.Geolocation', function() {
            const geolocation = new AMap.Geolocation({
                enableHighAccuracy: true,
                timeout: 10000,
                buttonOffset: new AMap.Pixel(10, 20),
                zoomToAccuracy: true,
                buttonPosition: 'RB'
            });
            
            geolocation.getCurrentPosition(function(status, result) {
                if (status === 'complete') {
                    console.log('定位成功:', result);
                    const { position } = result;
                    AppState.map.setCenter([position.getLng(), position.getLat()]);
                } else {
                    console.error('定位失败:', status, result);
                }
            });
        });
    } catch (error) {
        console.error('地图初始化失败:', error);
    }
}

// 搜索地址
function searchAddress() {
    try {
        const keyword = document.getElementById('addressInput').value.trim();
        if (!keyword) {
            console.error('搜索关键词为空');
            return;
        }
        
        console.log('开始搜索地址:', keyword);
        
        AMap.plugin('AMap.PlaceSearch', function() {
            const placeSearch = new AMap.PlaceSearch({
                city: '全国',
                pageSize: 10,
                pageIndex: 1
            });
            
            placeSearch.search(keyword, function(status, result) {
                console.log('搜索结果:', status, result);
                if (status === 'complete' && result.poiList) {
                    const results = result.poiList.pois;
                    const resultsEl = document.getElementById('addressResults');
                    if (!resultsEl) {
                        console.error('搜索结果容器不存在');
                        return;
                    }
                    resultsEl.innerHTML = '';
                    
                    results.forEach(poi => {
                        const item = document.createElement('div');
                        item.className = 'search-result-item';
                        item.onclick = function() {
                            selectAddress(poi.name, poi.address);
                        };
                        item.innerHTML = `
                            <div class="result-name">${poi.name}</div>
                            <div class="result-address">${poi.address}</div>
                        `;
                        resultsEl.appendChild(item);
                    });
                } else {
                    console.error('搜索失败:', status, result);
                    const resultsEl = document.getElementById('addressResults');
                    if (resultsEl) {
                        resultsEl.innerHTML = '<div style="text-align: center; padding: 20px; color: #999;">搜索失败，请重试</div>';
                    }
                }
            });
        });
    } catch (error) {
        console.error('搜索地址失败:', error);
    }
}

// 选择地址
function selectAddress(name, address) {
    if (AppState.addressSelectType === 'start') {
        AppState.selectedStartLocation = { name, address };
        document.getElementById('startName').textContent = name;
    } else if (AppState.addressSelectType === 'end') {
        AppState.selectedEndLocation = { name, address };
        document.getElementById('endName').textContent = name;
    }
    hideAddressModal();
    
    // 更新地图显示
    updateMapRoute();
}

// 更新地图路线
function updateMapRoute() {
    if (!AppState.map) return;
    
    // 清除之前的覆盖物
    AppState.map.clearMap();
    
    // 如果有起点和终点，显示路线
    if (AppState.selectedStartLocation && AppState.selectedEndLocation) {
        AMap.plugin('AMap.Driving', function() {
            const driving = new AMap.Driving({
                map: AppState.map,
                policy: AMap.DrivingPolicy.LEAST_TIME
            });
            
            driving.search([
                { keyword: AppState.selectedStartLocation.address },
                { keyword: AppState.selectedEndLocation.address }
            ], function(status, result) {
                if (status === 'complete') {
                    // 计算距离和时间
                    const route = result.routes[0];
                    if (route) {
                        const distance = (route.distance / 1000).toFixed(1);
                        const duration = Math.round(route.time / 60);
                        
                        // 更新页面上的距离和时间
                        document.getElementById('confirmDistance').textContent = distance;
                        document.getElementById('confirmDuration').textContent = duration;
                    }
                }
            });
        });
    }
}

// 登录功能
function handleLogin() {
    const companyCode = document.getElementById('companyCode').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (!companyCode || !username || !password) {
        showToast('请填写完整的登录信息', 'error');
        return;
    }
    
    // 模拟登录
    showToast('登录成功');
    
    // 存储登录信息
    const userInfo = {
        companyCode: companyCode,
        username: username,
        name: '张三',
        company: '某某科技有限公司',
        department: '技术部 · 高级工程师'
    };
    saveLoginInfo(userInfo);
    
    // 更新个人中心显示的用户信息
    updateProfileInfo(userInfo);
    
    setTimeout(() => {
        showPage('main');
        showSubPage('taxi-index');
    }, 500);
}

// 退出登录
function handleLogout() {
    showToast('已退出登录');
    
    // 清除登录状态
    clearLoginInfo();
    
    // 清除个人中心显示的用户信息
    clearProfileInfo();
    
    setTimeout(() => {
        showPage('login');
        // 重置状态
        AppState.selectedStartLocation = null;
        AppState.selectedEndLocation = null;
        AppState.selectedCarType = 'comfort';
        
        // 重置地址显示
        const startName = document.getElementById('startName');
        const endName = document.getElementById('endName');
        if (startName) startName.textContent = '请选择出发地点';
        if (endName) endName.textContent = '请选择目的地';
    }, 500);
}

// 切换密码显示
function togglePasswordVisible() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.getElementById('togglePassword');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.textContent = '隐藏';
    } else {
        passwordInput.type = 'password';
        toggleBtn.textContent = '显示';
    }
}

// 选择地址
function selectAddress(name, address) {
    const startName = document.getElementById('startName');
    const endName = document.getElementById('endName');
    
    if (AppState.addressSelectType === 'start') {
        AppState.selectedStartLocation = { name, address };
        if (startName) startName.textContent = name;
    } else {
        AppState.selectedEndLocation = { name, address };
        if (endName) endName.textContent = name;
    }
    
    hideAddressModal();
    showToast('已选择' + name);
}

// 交换起终点
function swapLocations() {
    const startName = document.getElementById('startName');
    const endName = document.getElementById('endName');
    
    if (!AppState.selectedStartLocation || !AppState.selectedEndLocation) {
        showToast('请先选择起终点');
        return;
    }
    
    const temp = AppState.selectedStartLocation;
    AppState.selectedStartLocation = AppState.selectedEndLocation;
    AppState.selectedEndLocation = temp;
    
    if (startName && endName) {
        const tempText = startName.textContent;
        startName.textContent = endName.textContent;
        endName.textContent = tempText;
    }
    
    showToast('已交换起终点');
}

// 选择车型
function selectCarType(type) {
    AppState.selectedCarType = type;
    
    const carTypeItems = document.querySelectorAll('.car-type-item');
    carTypeItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.type === type) {
            item.classList.add('active');
        }
    });
}

// 切换订单类型标签
function switchOrderTab(type) {
    const tabItems = document.querySelectorAll('#orders-index .tab-item');
    tabItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.type === type) {
            item.classList.add('active');
        }
    });
    
    // 更新当前订单类型过滤状态
    AppState.currentOrderType = type;
    
    // 重新渲染订单列表
    renderOrderList(AppState.orders || []);
    
    const typeNames = {
        'all': '全部',
        'taxi': '打车',
        'hotel': '酒店',
        'flight': '机票',
        'train': '火车票'
    };
    showToast('已切换到' + (typeNames[type] || '全部') + '订单');
}

// 切换价格筛选
function switchPriceFilter(filter) {
    const filterItems = document.querySelectorAll('#hotel-index .filter-item');
    filterItems.forEach(item => {
        item.classList.remove('active');
        if (item.textContent === filter) {
            item.classList.add('active');
        }
    });
}

// 初始化事件监听
function initEventListeners() {
    // 登录按钮
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }
    
    // 密码显示切换
    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
        togglePassword.addEventListener('click', togglePasswordVisible);
    }
    
    // 退出登录
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // TabBar 点击
    const tabbarItems = tabbar.querySelectorAll('.tabbar-item');
    tabbarItems.forEach(item => {
        item.addEventListener('click', function() {
            const page = this.dataset.page;
            if (page) {
                // 检查是否需要登录
                const pagesRequiringLogin = ['orders-index', 'profile-index'];
                if (pagesRequiringLogin.includes(page) && !isLoggedIn()) {
                    // 未登录，跳转登录页面
                    showToast('请先登录', 'error');
                    setTimeout(() => {
                        showPage('login');
                    }, 500);
                    return;
                }
                
                // 已登录或不需要登录的页面
                showSubPage(page);
                
                // 如果是机票订单确认页面，绑定事件
                if (page === 'flight-order-confirm') {
                    bindFlightOrderConfirmEvents();
                }
            }
        });
    });
    
    // 起点选择
    const selectStart = document.getElementById('selectStart');
    if (selectStart) {
        selectStart.addEventListener('click', function() {
            showAddressModal('start');
        });
    }
    
    // 终点选择
    const selectEnd = document.getElementById('selectEnd');
    if (selectEnd) {
        selectEnd.addEventListener('click', function() {
            showAddressModal('end');
        });
    }
    
    // 交换起终点
    const swapBtn = document.getElementById('swapBtn');
    if (swapBtn) {
        swapBtn.addEventListener('click', swapLocations);
    }
    
    // 关闭地址弹窗
    const closeAddressModal = document.getElementById('closeAddressModal');
    if (closeAddressModal) {
        closeAddressModal.addEventListener('click', hideAddressModal);
    }
    
    // 点击弹窗背景关闭
    addressModal.addEventListener('click', function(e) {
        if (e.target === this) {
            hideAddressModal();
        }
    });
    
    // 地址列表项点击
    const addressItems = document.querySelectorAll('.address-item-modal');
    addressItems.forEach(item => {
        item.addEventListener('click', function() {
            const name = this.dataset.name;
            const address = this.dataset.address;
            if (name) {
                selectAddress(name, address);
            }
        });
    });
    
    // 常用地址点击
    const locationItems = document.querySelectorAll('.location-item');
    locationItems.forEach(item => {
        item.addEventListener('click', function() {
            const name = this.dataset.name;
            const address = this.dataset.address;
            if (name) {
                // 自动填充到未选择的位置
                if (!AppState.selectedStartLocation) {
                    AppState.addressSelectType = 'start';
                    selectAddress(name, address);
                } else if (!AppState.selectedEndLocation) {
                    AppState.addressSelectType = 'end';
                    selectAddress(name, address);
                } else {
                    // 如果都已选择，填充到终点
                    AppState.addressSelectType = 'end';
                    selectAddress(name, address);
                }
            }
        });
    });
    
    // 车型选择
    const carTypeItems = document.querySelectorAll('.car-type-item');
    carTypeItems.forEach(item => {
        item.addEventListener('click', function() {
            const type = this.dataset.type;
            if (type) {
                selectCarType(type);
            }
        });
    });
    
    // 叫车按钮点击
    const callTaxiBtn = document.getElementById('callTaxiBtn');
    if (callTaxiBtn) {
        callTaxiBtn.addEventListener('click', function() {
            if (!AppState.selectedStartLocation || !AppState.selectedEndLocation) {
                showToast('请选择起终点', 'error');
                return;
            }
            showTaxiOrderConfirmPage();
        });
    }
    
    // 确认叫车按钮点击
    const confirmTaxiOrderBtn = document.getElementById('confirmTaxiOrderBtn');
    if (confirmTaxiOrderBtn) {
        confirmTaxiOrderBtn.addEventListener('click', function() {
            const passengerName = document.getElementById('taxiPassengerName').value;
            const passengerPhone = document.getElementById('confirmPassengerPhone').value;
            
            if (!passengerName) {
                showToast('请输入姓名', 'error');
                return;
            }
            
            if (!passengerPhone) {
                showToast('请输入手机号', 'error');
                return;
            }
            
            // 创建打车订单
            createTaxiOrder();
        });
    }
    
    // 订单标签切换
    const orderTabItems = document.querySelectorAll('#orders-index .tab-item');
    orderTabItems.forEach(item => {
        item.addEventListener('click', function() {
            const type = this.dataset.type;
            if (type) {
                switchOrderTab(type);
            }
        });
    });
    
    // 酒店价格筛选
    const filterItems = document.querySelectorAll('#hotel-index .filter-item');
    filterItems.forEach(item => {
        item.addEventListener('click', function() {
            const filter = this.textContent;
            switchPriceFilter(filter);
            showToast('已筛选: ' + filter);
        });
    });
    

    
    // 菜单项目点击
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach((item, index) => {
        item.addEventListener('click', function() {
            const menuTitles = ['我的打车', '我的酒店', '常用地址', '发票信息', '紧急联系人', 
                                 '帮助中心', '意见反馈', '关于我们'];
            
            // 我的打车和我的酒店跳转
            if (index === 0) {
                showSubPage('taxi-index');
            } else if (index === 1) {
                showSubPage('hotel-index');
            } else if (index === 2) {
                showSubPage('addresses-index');
            } else if (index === 3) {
                showSubPage('invoice-index');
            } else if (index === 4) {
                showSubPage('contact-index');
            } else if (index === 5) {
                showSubPage('help-index');
            } else if (index === 6) {
                showSubPage('feedback-index');
            } else if (index === 7) {
                showSubPage('about-index');
            }
        });
    });
    

    
    // 常用地址页面函数
    window.addAddress = function() {
        document.getElementById('addressEditTitle').textContent = '添加地址';
        // 重置表单
        document.getElementById('addressName').value = '';
        document.getElementById('addressPhone').value = '';
        document.getElementById('addressDetail').value = '';
        document.getElementById('addressDefault').checked = false;
        // 重置类型选择
        const typeOptions = document.querySelectorAll('.type-option');
        typeOptions.forEach(option => option.classList.remove('active'));
        typeOptions[0].classList.add('active');
        showSubPage('addresses-edit');
    };
    
    window.editAddress = function() {
        document.getElementById('addressEditTitle').textContent = '编辑地址';
        // 模拟填充表单数据
        document.getElementById('addressName').value = '张三';
        document.getElementById('addressPhone').value = '13800138000';
        document.getElementById('addressDetail').value = '北京市朝阳区建国路88号';
        document.getElementById('addressDefault').checked = true;
        showSubPage('addresses-edit');
    };
    
    window.deleteAddress = function(index) {
        if (confirm('确定要删除这个地址吗？')) {
            showToast('删除成功');
        }
    };
    
    window.saveAddress = function() {
        showToast('保存地址成功');
        setTimeout(() => {
            showSubPage('addresses-index');
        }, 1500);
    };
    
    window.selectAddressType = function(type) {
        const typeOptions = document.querySelectorAll('.type-option');
        typeOptions.forEach(option => option.classList.remove('active'));
        event.target.classList.add('active');
    };
    
    // 发票信息页面函数
    window.addInvoice = function() {
        document.getElementById('invoiceEditTitle').textContent = '添加发票';
        // 重置表单
        document.getElementById('invoiceTitle').value = '';
        document.getElementById('invoiceTaxNumber').value = '';
        document.getElementById('invoiceBank').value = '';
        document.getElementById('invoiceAccount').value = '';
        document.getElementById('invoiceAddress').value = '';
        document.getElementById('invoicePhone').value = '';
        document.getElementById('invoiceDefault').checked = false;
        // 重置类型选择
        const typeOptions = document.querySelectorAll('.type-option');
        typeOptions.forEach(option => option.classList.remove('active'));
        typeOptions[0].classList.add('active');
        // 显示税号等字段
        document.getElementById('taxNumberSection').style.display = 'block';
        showSubPage('invoice-edit');
    };
    
    window.editInvoice = function() {
        document.getElementById('invoiceEditTitle').textContent = '编辑发票';
        // 模拟填充表单数据
        document.getElementById('invoiceTitle').value = '北京科技有限公司';
        document.getElementById('invoiceTaxNumber').value = '91110000XXXXXXXXXX';
        document.getElementById('invoiceBank').value = '中国工商银行';
        document.getElementById('invoiceAccount').value = '622202XXXXXXXXXXXX';
        document.getElementById('invoiceAddress').value = '北京市朝阳区';
        document.getElementById('invoicePhone').value = '010-12345678';
        document.getElementById('invoiceDefault').checked = true;
        showSubPage('invoice-edit');
    };
    
    window.deleteInvoice = function(index) {
        if (confirm('确定要删除这个发票信息吗？')) {
            showToast('删除成功');
        }
    };
    
    window.setDefault = function(index) {
        showToast('已设为默认');
    };
    
    window.saveInvoice = function() {
        showToast('保存发票成功');
        setTimeout(() => {
            showSubPage('invoice-index');
        }, 1500);
    };
    
    window.selectInvoiceType = function(type) {
        const typeOptions = document.querySelectorAll('.type-option');
        typeOptions.forEach(option => option.classList.remove('active'));
        event.target.classList.add('active');
        
        // 个人发票隐藏税号等字段
        if (type === 'personal') {
            document.getElementById('taxNumberSection').style.display = 'none';
        } else {
            document.getElementById('taxNumberSection').style.display = 'block';
        }
    };
    
    // 紧急联系人页面函数
    window.addContact = function() {
        document.getElementById('contactEditTitle').textContent = '添加联系人';
        // 重置表单
        document.getElementById('contactName').value = '';
        document.getElementById('contactPhone').value = '';
        document.getElementById('contactAddress').value = '';
        // 重置类型选择
        const typeOptions = document.querySelectorAll('.type-option');
        typeOptions.forEach(option => option.classList.remove('active'));
        typeOptions[0].classList.add('active');
        showSubPage('contact-edit');
    };
    
    window.editContact = function() {
        document.getElementById('contactEditTitle').textContent = '编辑联系人';
        // 模拟填充表单数据
        document.getElementById('contactName').value = '李四';
        document.getElementById('contactPhone').value = '13900139000';
        document.getElementById('contactAddress').value = '上海市浦东新区';
        showSubPage('contact-edit');
    };
    
    window.deleteContact = function(index) {
        if (confirm('确定要删除这个紧急联系人吗？')) {
            showToast('删除成功');
        }
    };
    
    window.saveContact = function() {
        showToast('保存联系人成功');
        setTimeout(() => {
            showSubPage('contact-index');
        }, 1500);
    };
    
    window.selectRelation = function(relation) {
        const typeOptions = document.querySelectorAll('.type-option');
        typeOptions.forEach(option => option.classList.remove('active'));
        event.target.classList.add('active');
    };
    
    // 帮助中心页面函数
    window.toggleFAQ = function(index) {
        const answer = document.getElementById('faq-answer-' + index);
        if (answer.style.display === 'none') {
            answer.style.display = 'block';
        } else {
            answer.style.display = 'none';
        }
    };
    
    // 意见反馈页面函数
    window.selectType = function(type) {
        const options = document.querySelectorAll('.type-option');
        options.forEach(option => {
            option.classList.remove('active');
        });
        event.target.classList.add('active');
    };
    
    window.chooseImage = function() {
        // 模拟图片选择
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = true;
        input.onchange = function(e) {
            const files = e.target.files;
            if (files && files.length > 0) {
                // 限制最多3张图片
                const selectedFiles = Array.from(files).slice(0, 3);
                selectedFiles.forEach(file => {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        if (event.target) {
                            const imageUrl = event.target.result;
                            addImagePreview(imageUrl);
                        }
                    };
                    reader.readAsDataURL(file);
                });
            }
        };
        input.click();
    };
    
    function addImagePreview(imageUrl) {
        const uploadSection = document.querySelector('.upload-section');
        const uploadBtn = uploadSection.querySelector('.upload-btn');
        
        // 创建图片预览元素
        const imageItem = document.createElement('div');
        imageItem.className = 'image-item';
        imageItem.innerHTML = `
            <img src="${imageUrl}" class="uploaded-image" style="width: 80px; height: 80px; border-radius: 8px; object-fit: cover;">
            <div class="image-delete" onclick="deleteImage(this)">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="8" fill="#FF4D4F"/>
                    <path d="M6 6L14 14M14 6L6 14" stroke="white" stroke-width="2" stroke-linecap="round"/>
                </svg>
            </div>
        `;
        
        // 在上传按钮前插入图片预览
        uploadSection.insertBefore(imageItem, uploadBtn);
        
        // 检查图片数量，超过3张隐藏上传按钮
        const imageItems = uploadSection.querySelectorAll('.image-item');
        if (imageItems.length >= 3) {
            uploadBtn.style.display = 'none';
        }
    }
    
    window.deleteImage = function(element) {
        const imageItem = element.closest('.image-item');
        imageItem.remove();
        
        // 显示上传按钮
        const uploadSection = document.querySelector('.upload-section');
        const uploadBtn = uploadSection.querySelector('.upload-btn');
        uploadBtn.style.display = 'flex';
    };
    
    window.submitFeedback = function() {
        showToast('反馈提交成功，感谢您的建议！');
        setTimeout(() => {
            showSubPage('profile-index');
        }, 1500);
    };
    
    // 关于我们页面函数
    window.showAgreement = function() {
        alert('服务协议内容...');
    };
    
    window.showPrivacy = function() {
        alert('隐私政策内容...');
    };
    
    window.checkUpdate = function() {
        showToast('当前已是最新版本');
    };
    
    // 城市选择
    const selectCity = document.getElementById('selectCity');
    if (selectCity) {
        selectCity.addEventListener('click', function() {
            showToast('城市选择功能开发中');
        });
    }
    
    // 酒店搜索
    const searchHotel = document.getElementById('searchHotel');
    if (searchHotel) {
        searchHotel.addEventListener('click', function() {
            showToast('搜索功能开发中');
        });
    }
    
    // 日期选择
    const selectDate = document.getElementById('selectDate');
    if (selectDate) {
        selectDate.addEventListener('click', function() {
            showToast('日期选择功能开发中');
        });
    }
    
    // 初始化酒店预订相关事件
    initHotelBookingEventListeners();
    
    // 初始化机票预订相关事件
    initFlightBookingEventListeners();
    
    // 初始化火车票预订相关事件
    initTrainBookingEventListeners();
    

}

// 城市选择相关
let currentCitySelectType = null;

// 显示城市选择弹窗
function showCityModal(type) {
    currentCitySelectType = type;
    const cityModal = document.getElementById('city-modal');
    const cityModalTitle = document.getElementById('cityModalTitle');
    if (cityModal && cityModalTitle) {
        cityModalTitle.textContent = type === 'departure' ? '选择出发城市' : '选择到达城市';
        cityModal.classList.add('active');
    }
}

// 隐藏城市选择弹窗
function hideCityModal() {
    const cityModal = document.getElementById('city-modal');
    if (cityModal) {
        cityModal.classList.remove('active');
    }
    currentCitySelectType = null;
}

// 搜索城市
function searchCity() {
    const keyword = document.getElementById('cityInput').value.trim();
    const cityResults = document.getElementById('cityResults');
    if (!cityResults) return;
    
    if (!keyword) {
        cityResults.innerHTML = '';
        return;
    }
    
    // 模拟城市搜索结果
    const cities = ['北京', '上海', '广州', '深圳', '成都', '杭州', '南京', '武汉', '西安', '重庆', '厦门', '青岛', '大连', '天津', '苏州'];
    const filteredCities = cities.filter(city => city.includes(keyword));
    
    if (filteredCities.length > 0) {
        cityResults.innerHTML = filteredCities.map(city => `
            <div class="city-item" data-city="${city}" onclick="selectCity('${city}')">${city}</div>
        `).join('');
    } else {
        cityResults.innerHTML = '<div style="text-align: center; padding: 20px; color: #999;">未找到匹配城市</div>';
    }
}

// 选择城市
function selectCity(city) {
    if (currentCitySelectType === 'departure') {
        if (AppState.currentSubPage === 'flight-index') {
            document.getElementById('flightDepartureCity').textContent = city;
        } else if (AppState.currentSubPage === 'train-index') {
            document.getElementById('trainDepartureCity').textContent = city;
        }
    } else if (currentCitySelectType === 'arrival') {
        if (AppState.currentSubPage === 'flight-index') {
            document.getElementById('flightArrivalCity').textContent = city;
        } else if (AppState.currentSubPage === 'train-index') {
            document.getElementById('trainArrivalCity').textContent = city;
        }
    }
    hideCityModal();
    showToast('已选择: ' + city);
}

// 日期选择相关
let selectedDate = null;

// 显示日期选择器
function showDatePicker() {
    // 创建日期选择弹窗
    const dateModal = document.createElement('div');
    dateModal.className = 'modal active';
    dateModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>选择出发日期</h3>
                <button class="close-btn" onclick="hideDateModal()">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <div class="date-picker" id="datePicker"></div>
            </div>
        </div>
    `;
    document.body.appendChild(dateModal);
    
    // 生成日期选择器内容
    generateDatePicker();
    
    // 点击弹窗背景关闭
    dateModal.addEventListener('click', function(e) {
        if (e.target === this) {
            hideDateModal();
        }
    });
}

// 生成日期选择器
function generateDatePicker() {
    const datePicker = document.getElementById('datePicker');
    if (!datePicker) return;
    
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    let html = '<div class="date-header">';
    html += `<div class="date-title">${currentYear}年${currentMonth + 1}月</div>`;
    html += '</div>';
    html += '<div class="date-grid">';
    
    // 星期标题
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    html += '<div class="date-weekdays">';
    weekdays.forEach(day => {
        html += `<div class="date-weekday">${day}</div>`;
    });
    html += '</div>';
    
    // 日期格子
    html += '<div class="date-days">';
    
    // 计算当月第一天是星期几
    const firstDay = new Date(currentYear, currentMonth, 1);
    const startDay = firstDay.getDay();
    
    // 上个月的日期
    const lastMonthDays = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
        const date = lastMonthDays - i;
        html += `<div class="date-day other-month">${date}</div>`;
    }
    
    // 当月的日期
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(currentYear, currentMonth, i);
        const dateStr = date.toISOString().split('T')[0];
        const isToday = dateStr === today.toISOString().split('T')[0];
        html += `<div class="date-day ${isToday ? 'today' : ''}" data-date="${dateStr}" onclick="selectDate('${dateStr}')">${i}</div>`;
    }
    
    html += '</div>';
    html += '</div>';
    
    datePicker.innerHTML = html;
}

// 选择日期
function selectDate(dateStr) {
    const date = new Date(dateStr);
    let dateValue, dateWeek;
    
    if (AppState.currentSubPage === 'flight-index') {
        dateValue = document.getElementById('flightDepartureDate');
        dateWeek = document.getElementById('flightDepartureWeek');
    } else if (AppState.currentSubPage === 'train-index') {
        dateValue = document.getElementById('trainDepartureDate');
        dateWeek = document.getElementById('trainDepartureWeek');
    }
    
    if (dateValue && dateWeek) {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        if (dateStr === todayStr) {
            dateValue.textContent = '今天';
        } else {
            dateValue.textContent = `${date.getMonth() + 1}月${date.getDate()}日`;
        }
        
        dateWeek.textContent = getWeekday(date);
        selectedDate = dateStr;
        showToast('已选择日期: ' + dateStr);
        hideDateModal();
    }
}

// 隐藏日期选择器
function hideDateModal() {
    const dateModal = document.querySelector('.modal.active');
    if (dateModal) {
        dateModal.remove();
    }
}

// 获取星期几
function getWeekday(date) {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return weekdays[date.getDay()];
}

// 初始化机票预订事件监听
function initFlightBookingEventListeners() {
    // 出发城市选择
    const flightSelectDeparture = document.getElementById('flightSelectDeparture');
    if (flightSelectDeparture) {
        flightSelectDeparture.addEventListener('click', function() {
            showCityModal('departure');
        });
    }
    
    // 到达城市选择
    const flightSelectArrival = document.getElementById('flightSelectArrival');
    if (flightSelectArrival) {
        flightSelectArrival.addEventListener('click', function() {
            showCityModal('arrival');
        });
    }
    
    // 交换城市
    const flightSwapCities = document.getElementById('flightSwapCities');
    if (flightSwapCities) {
        flightSwapCities.addEventListener('click', function() {
            const departureCity = document.getElementById('flightDepartureCity');
            const arrivalCity = document.getElementById('flightArrivalCity');
            
            if (departureCity && arrivalCity) {
                const temp = departureCity.textContent;
                departureCity.textContent = arrivalCity.textContent;
                arrivalCity.textContent = temp;
                showToast('已交换出发/到达城市');
            }
        });
    }
    
    // 日期选择
    const flightSelectDate = document.getElementById('flightSelectDate');
    if (flightSelectDate) {
        flightSelectDate.addEventListener('click', function() {
            showDatePicker();
        });
    }
    
    // 筛选条件切换
    const flightFilterOptions = document.querySelectorAll('#flight-index .filter-option');
    flightFilterOptions.forEach(option => {
        option.addEventListener('click', function() {
            flightFilterOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            showToast('已筛选: ' + this.textContent);
        });
    });
    
    // 搜索按钮
    const flightSearchBtn = document.getElementById('flightSearchBtn');
    if (flightSearchBtn) {
        flightSearchBtn.addEventListener('click', async function() {
            showToast('搜索航班中...');
            try {
                const departureCity = document.getElementById('flightDepartureCity').textContent;
                const arrivalCity = document.getElementById('flightArrivalCity').textContent;
                const result = await getFlights({ departureCity, arrivalCity, date: selectedDate });
                const flights = result.list || [];
                renderFlightList(flights);
                showToast('搜索完成');
            } catch (error) {
                console.error('搜索航班失败:', error);
                showToast('搜索失败，请重试', 'error');
            }
        });
    }
    
    // 航班卡片点击
    const flightCards = document.querySelectorAll('.flight-card');
    flightCards.forEach(card => {
        card.addEventListener('click', function() {
            const flightId = this.dataset.flightId;
            showFlightDetailPage(flightId);
        });
    });
    
    // 城市选择弹窗关闭按钮
    const closeCityModal = document.getElementById('closeCityModal');
    if (closeCityModal) {
        closeCityModal.addEventListener('click', hideCityModal);
    }
    
    // 点击弹窗背景关闭
    const cityModal = document.getElementById('city-modal');
    if (cityModal) {
        cityModal.addEventListener('click', function(e) {
            if (e.target === this) {
                hideCityModal();
            }
        });
    }
    
    // 城市列表项点击
    const cityItems = document.querySelectorAll('.city-item');
    cityItems.forEach(item => {
        item.addEventListener('click', function() {
            const city = this.dataset.city;
            if (city) {
                selectCity(city);
            }
        });
    });
}

// 机票相关API请求
async function getFlights(params = {}) {
    const queryParams = new URLSearchParams();
    // 转换参数名：date -> departureDate
    if (params.date) {
        queryParams.append('departureDate', params.date);
    }
    if (params.departureCity) {
        queryParams.append('departureCity', params.departureCity);
    }
    if (params.arrivalCity) {
        queryParams.append('arrivalCity', params.arrivalCity);
    }
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/flights?${queryString}` : '/flights';
    return apiRequest(endpoint, { method: 'GET' });
}

async function getFlightDetail(flightId) {
    return apiRequest(`/flights/${flightId}`, { method: 'GET' });
}

async function createFlightOrder(params) {
    return apiRequest('/flight-orders', {
        method: 'POST',
        body: JSON.stringify(params)
    });
}

async function getFlightOrders(params = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
    });
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/flight-orders?${queryString}` : '/flight-orders';
    return apiRequest(endpoint, { method: 'GET' });
}

async function getFlightOrderDetail(orderId) {
    return apiRequest(`/flight-orders/${orderId}`, { method: 'GET' });
}

async function cancelFlightOrder(orderId, reason) {
    return apiRequest(`/flight-orders/${orderId}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ cancelReason: reason })
    });
}

// 火车票相关API请求
async function getTrains(params = {}) {
    const queryParams = new URLSearchParams();
    // 转换参数名：date -> departureDate
    if (params.date) {
        queryParams.append('departureDate', params.date);
    }
    if (params.departureCity) {
        queryParams.append('departureCity', params.departureCity);
    }
    if (params.arrivalCity) {
        queryParams.append('arrivalCity', params.arrivalCity);
    }
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/trains?${queryString}` : '/trains';
    return apiRequest(endpoint, { method: 'GET' });
}

async function getTrainDetail(trainId) {
    return apiRequest(`/api/trains/${trainId}`, { method: 'GET' });
}

async function createTrainOrder(params) {
    return apiRequest('/api/train-orders', {
        method: 'POST',
        body: JSON.stringify(params)
    });
}

async function getTrainOrders(params = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
    });
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/api/train-orders?${queryString}` : '/api/train-orders';
    return apiRequest(endpoint, { method: 'GET' });
}

async function getTrainOrderDetail(orderId) {
    return apiRequest(`/api/train-orders/${orderId}`, { method: 'GET' });
}

async function cancelTrainOrder(orderId, reason) {
    return apiRequest(`/api/train-orders/${orderId}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ cancelReason: reason })
    });
}

// 渲染航班列表
function renderFlightList(flights) {
    const flightList = document.getElementById('flightList');
    if (!flightList) return;
    
    if (!flights || flights.length === 0) {
        flightList.innerHTML = '<div class="empty-flights">暂无航班</div>';
        return;
    }
    
    flightList.innerHTML = flights.map(flight => `
        <div class="flight-card" data-flight-id="${flight.id}">
            <div class="flight-info">
                <div class="airline-info">
                    <div class="airline-name">${flight.airline}</div>
                    <div class="flight-no">${flight.flightNo}</div>
                </div>
                <div class="flight-time">
                    <div class="time-block">
                        <div class="time">${flight.departureTime}</div>
                        <div class="city">${flight.departureAirport}</div>
                    </div>
                    <div class="flight-duration">
                        <div class="duration">${flight.duration}</div>
                        <div class="flight-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M21 16L13 14L5 16L9 22H15L21 16Z" stroke="#1890FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M13 2V14" stroke="#1890FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M5 10L13 14L21 10" stroke="#1890FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <div class="direct-tag">${flight.isDirect ? '直飞' : '中转'}</div>
                    </div>
                    <div class="time-block">
                        <div class="time">${flight.arrivalTime}</div>
                        <div class="city">${flight.arrivalAirport}</div>
                    </div>
                </div>
            </div>
            <div class="flight-price">
                <div class="price-info">
                    <span class="price-symbol">¥</span>
                    <span class="price-value">${flight.price}</span>
                    <span class="price-unit">起</span>
                </div>
                <div class="seat-info">${flight.cabinClass} · 剩余 ${flight.availableSeats} 张</div>
            </div>
        </div>
    `).join('');
    
    // 重新绑定点击事件
    const flightCards = document.querySelectorAll('.flight-card');
    flightCards.forEach(card => {
        card.addEventListener('click', function() {
            const flightId = this.dataset.flightId;
            showFlightDetailPage(flightId);
        });
    });
}

// 渲染火车票列表
function renderTrainList(trains) {
    const trainList = document.getElementById('trainList');
    if (!trainList) return;
    
    if (!trains || trains.length === 0) {
        trainList.innerHTML = '<div class="empty-trains">暂无车次</div>';
        return;
    }
    
    trainList.innerHTML = trains.map(train => `
        <div class="train-card" data-train-id="${train.id}">
            <div class="train-info">
                <div class="train-header">
                    <div class="train-no">${train.trainNo}</div>
                    <div class="train-type">${train.trainType}</div>
                </div>
                <div class="train-time">
                    <div class="time-block">
                        <div class="time">${train.departureTime}</div>
                        <div class="station">${train.departureStation}</div>
                    </div>
                    <div class="train-duration">
                        <div class="duration">${train.duration}</div>
                        <div class="train-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <rect x="4" y="2" width="16" height="16" rx="3" stroke="#1890FF" stroke-width="2"/>
                                <path d="M8 2V0H16V2" stroke="#1890FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <circle cx="8" cy="20" r="2" stroke="#1890FF" stroke-width="2"/>
                                <circle cx="16" cy="20" r="2" stroke="#1890FF" stroke-width="2"/>
                            </svg>
                        </div>
                        <div class="direct-tag">${train.isThrough ? '直达' : '中转'}</div>
                    </div>
                    <div class="time-block">
                        <div class="time">${train.arrivalTime}</div>
                        <div class="station">${train.arrivalStation}</div>
                    </div>
                </div>
            </div>
            <div class="train-price">
                <div class="price-item">
                    <span class="seat-type">${train.seatType}</span>
                    <span class="price">¥${train.price}</span>
                    <span class="seat-status">剩余 ${train.availableSeats} 张</span>
                </div>
            </div>
        </div>
    `).join('');
    
    // 重新绑定点击事件
    const trainCards = document.querySelectorAll('.train-card');
    trainCards.forEach(card => {
        card.addEventListener('click', function() {
            const trainId = this.dataset.trainId;
            showTrainDetailPage(trainId);
        });
    });
}

// 显示机票详情页面
function showFlightDetailPage(flightId) {
    const backBtn = document.getElementById('backBtn');
    const tabbar = document.getElementById('tabbar');
    
    // 显示返回按钮，隐藏TabBar
    if (backBtn) backBtn.style.display = 'flex';
    if (tabbar) tabbar.style.display = 'none';
    
    // 更新导航栏标题
    navbarTitle.textContent = '航班详情';
    
    // 显示详情页
    showSubPage('flight-detail');
    
    // 加载航班详情
    loadFlightDetail(flightId);
}

// 显示火车票详情页面
function showTrainDetailPage(trainId) {
    const backBtn = document.getElementById('backBtn');
    const tabbar = document.getElementById('tabbar');
    
    // 显示返回按钮，隐藏TabBar
    if (backBtn) backBtn.style.display = 'flex';
    if (tabbar) tabbar.style.display = 'none';
    
    // 更新导航栏标题
    navbarTitle.textContent = '车次详情';
    
    // 显示详情页
    showSubPage('train-detail');
    
    // 加载火车票详情
    loadTrainDetail(trainId);
}

// 加载航班详情
async function loadFlightDetail(flightId) {
    try {
        const flight = await getFlightDetail(flightId);
        AppState.currentFlight = flight;
        renderFlightDetail(flight);
    } catch (error) {
        console.error('加载航班详情失败:', error);
        showToast('加载航班详情失败', 'error');
    }
}

// 渲染航班详情
function renderFlightDetail(flight) {
    // 渲染基本信息
    const departureCityEl = document.getElementById('flightDetailDepartureCity');
    const departureAirportEl = document.getElementById('flightDetailDepartureAirport');
    const arrivalCityEl = document.getElementById('flightDetailArrivalCity');
    const arrivalAirportEl = document.getElementById('flightDetailArrivalAirport');
    const durationEl = document.getElementById('flightDetailDuration');
    const departureTimeEl = document.getElementById('flightDetailDepartureTime');
    const arrivalTimeEl = document.getElementById('flightDetailArrivalTime');
    const dateEl = document.getElementById('flightDetailDate');
    
    if (departureCityEl) departureCityEl.textContent = flight.departureCity;
    if (departureAirportEl) departureAirportEl.textContent = flight.departureAirport;
    if (arrivalCityEl) arrivalCityEl.textContent = flight.arrivalCity;
    if (arrivalAirportEl) arrivalAirportEl.textContent = flight.arrivalAirport;
    if (durationEl) durationEl.textContent = flight.duration;
    if (departureTimeEl) departureTimeEl.textContent = flight.departureTime;
    if (arrivalTimeEl) arrivalTimeEl.textContent = flight.arrivalTime;
    if (dateEl) dateEl.textContent = new Date().toISOString().split('T')[0];
    
    // 渲染航班信息
    const airlineEl = document.getElementById('flightDetailAirline');
    const flightNoEl = document.getElementById('flightDetailFlightNo');
    const aircraftTypeEl = document.getElementById('flightDetailAircraftType');
    const mealEl = document.getElementById('flightDetailMeal');
    const baggagePolicyEl = document.getElementById('flightDetailBaggagePolicy');
    const isDirectEl = document.getElementById('flightDetailIsDirect');
    
    if (airlineEl) airlineEl.textContent = flight.airline;
    if (flightNoEl) flightNoEl.textContent = flight.flightNo;
    if (aircraftTypeEl) aircraftTypeEl.textContent = flight.aircraftType;
    if (mealEl) mealEl.textContent = flight.meal;
    if (baggagePolicyEl) baggagePolicyEl.textContent = flight.baggagePolicy;
    if (isDirectEl) isDirectEl.textContent = flight.isDirect ? '是' : '否';
    
    // 渲染舱位列表
    renderCabinTypesList(flight);
}

// 加载火车票详情
async function loadTrainDetail(trainId) {
    try {
        const train = await getTrainDetail(trainId);
        AppState.currentTrain = train;
        renderTrainDetail(train);
    } catch (error) {
        console.error('加载火车票详情失败:', error);
        showToast('加载火车票详情失败', 'error');
    }
}

// 渲染火车票详情
function renderTrainDetail(train) {
    // 渲染基本信息
    const departureCityEl = document.getElementById('trainDetailDepartureCity');
    const departureStationEl = document.getElementById('trainDetailDepartureStation');
    const arrivalCityEl = document.getElementById('trainDetailArrivalCity');
    const arrivalStationEl = document.getElementById('trainDetailArrivalStation');
    const durationEl = document.getElementById('trainDetailDuration');
    const departureTimeEl = document.getElementById('trainDetailDepartureTime');
    const arrivalTimeEl = document.getElementById('trainDetailArrivalTime');
    const dateEl = document.getElementById('trainDetailDate');
    
    if (departureCityEl) departureCityEl.textContent = train.departureCity;
    if (departureStationEl) departureStationEl.textContent = train.departureStation;
    if (arrivalCityEl) arrivalCityEl.textContent = train.arrivalCity;
    if (arrivalStationEl) arrivalStationEl.textContent = train.arrivalStation;
    if (durationEl) durationEl.textContent = train.duration;
    if (departureTimeEl) departureTimeEl.textContent = train.departureTime;
    if (arrivalTimeEl) arrivalTimeEl.textContent = train.arrivalTime;
    if (dateEl) dateEl.textContent = new Date().toISOString().split('T')[0];
    
    // 渲染车次信息
    const trainNoEl = document.getElementById('trainDetailTrainNo');
    const trainTypeEl = document.getElementById('trainDetailTrainType');
    const isThroughEl = document.getElementById('trainDetailIsThrough');
    
    if (trainNoEl) trainNoEl.textContent = train.trainNo;
    if (trainTypeEl) trainTypeEl.textContent = train.trainType;
    if (isThroughEl) isThroughEl.textContent = train.isThrough ? '是' : '否';
    
    // 渲染途经站点
    const passStationsEl = document.getElementById('trainDetailPassStations');
    if (passStationsEl) {
        passStationsEl.innerHTML = train.passStations.map(station => `
            <div class="station-item">${station}</div>
        `).join('');
    }
    
    // 渲染座位信息
    const seatInfoEl = document.getElementById('trainDetailSeatInfo');
    if (seatInfoEl) {
        seatInfoEl.innerHTML = `
            <div class="seat-item">
                <span class="seat-type">${train.seatType}</span>
                <span class="price">¥${train.price}</span>
                <span class="seat-status">剩余 ${train.availableSeats} 张</span>
            </div>
        `;
    }
}

// 渲染舱位列表
function renderCabinTypesList(flight) {
    const listEl = document.getElementById('cabinTypesList');
    if (!listEl) return;
    
    // 模拟舱位数据
    const cabinTypes = [
        {
            id: 'economy',
            name: '经济舱',
            price: flight.price,
            originalPrice: flight.originalPrice,
            availableSeats: flight.availableSeats,
            description: '标准经济舱，包含免费行李额'
        },
        {
            id: 'business',
            name: '商务舱',
            price: flight.price * 2,
            originalPrice: flight.originalPrice * 2,
            availableSeats: Math.floor(flight.availableSeats / 5),
            description: '商务舱，更多腿部空间和优先服务'
        }
    ];
    
    listEl.innerHTML = cabinTypes.map(cabin => `
        <div class="cabin-type-card" data-cabin-id="${cabin.id}">
            <div class="cabin-type-info">
                <div class="cabin-type-name">${cabin.name}</div>
                <div class="cabin-type-desc">${cabin.description}</div>
                <div class="cabin-type-available">剩余 ${cabin.availableSeats} 个座位</div>
            </div>
            <div class="cabin-type-price">
                <div class="price">¥${cabin.price}</div>
                ${cabin.originalPrice ? `<div class="original-price">¥${cabin.originalPrice}</div>` : ''}
                <div class="price-unit">起/人</div>
            </div>
        </div>
    `).join('');
    
    // 绑定舱位卡片点击事件
    const cabinCards = listEl.querySelectorAll('.cabin-type-card');
    cabinCards.forEach(card => {
        card.addEventListener('click', function() {
            // 移除所有卡片的active类
            cabinCards.forEach(c => c.classList.remove('active'));
            // 添加当前卡片的active类
            this.classList.add('active');
            
            const cabinId = this.dataset.cabinId;
            // 从舱位列表中找到对应舱位
            const cabinType = cabinTypes.find(c => c.id === cabinId);
            if (cabinType) {
                AppState.currentCabinType = cabinType;
                // 更新底部价格
                const selectedPriceEl = document.getElementById('selectedPrice');
                if (selectedPriceEl) {
                    selectedPriceEl.textContent = cabinType.price;
                }
                // 启用预订按钮
                const bookBtn = document.getElementById('bookFlightBtn');
                if (bookBtn) {
                    bookBtn.disabled = false;
                }
            }
        });
    });
    
    // 绑定预订按钮点击事件
    const bookBtn = document.getElementById('bookFlightBtn');
    if (bookBtn) {
        bookBtn.disabled = true;
        bookBtn.addEventListener('click', function() {
            if (AppState.currentCabinType) {
                showFlightOrderConfirmPage();
            } else {
                showToast('请选择舱位', 'error');
            }
        });
    }
}

// 显示机票订单确认页面
function showFlightOrderConfirmPage() {
    const backBtn = document.getElementById('backBtn');
    const tabbar = document.getElementById('tabbar');
    
    // 显示返回按钮，隐藏TabBar
    if (backBtn) backBtn.style.display = 'flex';
    if (tabbar) tabbar.style.display = 'none';
    
    // 更新导航栏标题
    navbarTitle.textContent = '确认订单';
    
    // 显示订单确认页
    showSubPage('flight-order-confirm');
    
    // 渲染订单确认信息
    renderFlightOrderConfirm();
    
    // 绑定订单确认页面事件
    bindFlightOrderConfirmEvents();
}

// 渲染机票订单确认信息
function renderFlightOrderConfirm() {
    const flight = AppState.currentFlight;
    const cabinType = AppState.currentCabinType;
    if (!flight || !cabinType) return;
    
    // 渲染航班信息
    const departureCityEl = document.getElementById('confirmFlightDepartureCity');
    const arrivalCityEl = document.getElementById('confirmFlightArrivalCity');
    const airlineEl = document.getElementById('confirmFlightAirline');
    const flightNoEl = document.getElementById('confirmFlightNo');
    const dateEl = document.getElementById('confirmFlightDate');
    const departureTimeEl = document.getElementById('confirmFlightDepartureTime');
    const arrivalTimeEl = document.getElementById('confirmFlightArrivalTime');
    const cabinClassEl = document.getElementById('confirmFlightCabinClass');
    const departureAirportEl = document.getElementById('confirmFlightDepartureAirport');
    const arrivalAirportEl = document.getElementById('confirmFlightArrivalAirport');
    const durationEl = document.getElementById('confirmFlightDuration');
    
    if (departureCityEl) departureCityEl.textContent = flight.departureCity;
    if (arrivalCityEl) arrivalCityEl.textContent = flight.arrivalCity;
    if (airlineEl) airlineEl.textContent = flight.airline;
    if (flightNoEl) flightNoEl.textContent = flight.flightNo;
    if (dateEl) dateEl.textContent = new Date().toISOString().split('T')[0];
    if (departureTimeEl) departureTimeEl.textContent = flight.departureTime;
    if (arrivalTimeEl) arrivalTimeEl.textContent = flight.arrivalTime;
    if (cabinClassEl) cabinClassEl.textContent = cabinType.name;
    if (departureAirportEl) departureAirportEl.textContent = flight.departureAirport.replace('国际机场', '');
    if (arrivalAirportEl) arrivalAirportEl.textContent = flight.arrivalAirport.replace('国际机场', '');
    if (durationEl) durationEl.textContent = flight.duration;
    
    // 初始化价格
    updateFlightOrderPrice();
}

// 绑定机票订单确认页面事件
function bindFlightOrderConfirmEvents() {
    // 保险选择
    const insuranceCheckbox = document.getElementById('confirmInsurance');
    if (insuranceCheckbox) {
        // 先移除所有事件监听器
        const newCheckbox = insuranceCheckbox.cloneNode(true);
        insuranceCheckbox.parentNode.replaceChild(newCheckbox, insuranceCheckbox);
        newCheckbox.addEventListener('change', function() {
            updateFlightOrderPrice();
        });
    }
    
    // 座位数量选择
    const decreaseBtn = document.getElementById('decreaseSeatCount');
    const increaseBtn = document.getElementById('increaseSeatCount');
    const seatCountEl = document.getElementById('seatCount');
    
    if (decreaseBtn) {
        // 先移除所有事件监听器
        const newDecreaseBtn = decreaseBtn.cloneNode(true);
        decreaseBtn.parentNode.replaceChild(newDecreaseBtn, decreaseBtn);
        newDecreaseBtn.addEventListener('click', function() {
            let count = parseInt(seatCountEl.textContent) || 1;
            if (count > 1) {
                seatCountEl.textContent = count - 1;
                updateFlightOrderPrice();
            }
        });
    }
    
    if (increaseBtn) {
        // 先移除所有事件监听器
        const newIncreaseBtn = increaseBtn.cloneNode(true);
        increaseBtn.parentNode.replaceChild(newIncreaseBtn, increaseBtn);
        newIncreaseBtn.addEventListener('click', function() {
            let count = parseInt(seatCountEl.textContent) || 1;
            if (count < 9) {
                seatCountEl.textContent = count + 1;
                updateFlightOrderPrice();
            }
        });
    }
    
    // 支付方式选择
    const paymentOptions = document.querySelectorAll('#flight-order-confirm .payment-item');
    paymentOptions.forEach(option => {
        option.addEventListener('click', function() {
            paymentOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // 身份证号验证
    const idInput = document.getElementById('confirmPassengerID');
    if (idInput) {
        idInput.addEventListener('input', function(e) {
            // 只允许输入数字和Xx
            this.value = this.value.replace(/[^0-9Xx]/g, '');
            // 限制长度为18位
            if (this.value.length > 18) {
                this.value = this.value.substring(0, 18);
            }
        });
    }
    
    // 手机号验证
    const phoneInput = document.getElementById('flightPassengerPhone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            // 只允许输入数字
            this.value = this.value.replace(/[^0-9]/g, '');
            // 限制长度为11位
            if (this.value.length > 11) {
                this.value = this.value.substring(0, 11);
            }
        });
    }
    
    // 提交订单按钮
    const submitOrderBtn = document.getElementById('submitFlightOrderBtn');
    if (submitOrderBtn) {
        // 先移除所有事件监听器
        const newSubmitOrderBtn = submitOrderBtn.cloneNode(true);
        submitOrderBtn.parentNode.replaceChild(newSubmitOrderBtn, submitOrderBtn);
        newSubmitOrderBtn.addEventListener('click', async function() {
            // 防止重复提交
            if (this.disabled) return;
            this.disabled = true;
            try {
                await submitFlightOrder();
            } finally {
                this.disabled = false;
            }
        });
    }
}

// 更新航班订单价格
function updateFlightOrderPrice() {
    const seatCount = parseInt(document.getElementById('seatCount').textContent) || 1;
    const insuranceCheckbox = document.getElementById('confirmInsurance');
    const insuranceChecked = insuranceCheckbox ? insuranceCheckbox.checked : false;
    
    // 获取舱位信息，如果没有则使用默认值
    const cabinType = AppState.currentCabinType || { price: 580 };
    
    // 计算价格
    const ticketFee = cabinType.price * seatCount;
    const insuranceFee = insuranceChecked ? 30 * seatCount : 0;
    const totalPrice = ticketFee + insuranceFee;
    
    // 更新价格显示
    const ticketFeeEl = document.getElementById('priceDetailFlightFee');
    const seatCountEl = document.getElementById('priceDetailSeatCount');
    const insuranceFeeEl = document.getElementById('priceDetailInsuranceFee');
    const insuranceCountEl = document.getElementById('priceDetailInsuranceCount');
    const totalPriceEl = document.getElementById('flightConfirmTotalPrice');
    const bottomPriceEl = document.getElementById('flightConfirmBottomPrice');
    const insuranceItemEl = document.getElementById('insuranceFeeItem');
    
    if (ticketFeeEl) ticketFeeEl.textContent = `¥${cabinType.price}`;
    if (seatCountEl) seatCountEl.textContent = seatCount;
    if (insuranceFeeEl) insuranceFeeEl.textContent = `¥30`;
    if (insuranceCountEl) insuranceCountEl.textContent = seatCount;
    if (totalPriceEl) totalPriceEl.textContent = totalPrice;
    if (bottomPriceEl) bottomPriceEl.textContent = totalPrice;
    
    // 显示或隐藏保险费用项
    if (insuranceItemEl) {
        insuranceItemEl.style.display = insuranceChecked ? 'flex' : 'none';
    }
}

// 提交机票订单
async function submitFlightOrder() {
    const flight = AppState.currentFlight;
    const cabinType = AppState.currentCabinType;
    
    // 获取表单数据
    const passengerName = document.getElementById('confirmPassengerName').value.trim();
    const passengerID = document.getElementById('confirmPassengerID').value.trim();
    const passengerPhone = document.getElementById('flightPassengerPhone').value.trim();
    const seatCount = parseInt(document.getElementById('seatCount').textContent) || 1;
    const insuranceCheckbox = document.getElementById('confirmInsurance');
    const insuranceChecked = insuranceCheckbox ? insuranceCheckbox.checked : false;
    
    // 验证表单
    if (!passengerName) {
        showToast('请输入乘机人姓名', 'error');
        return;
    }
    
    if (!passengerID) {
        showToast('请输入身份证号', 'error');
        return;
    }
    
    if (passengerID.length !== 18) {
        showToast('身份证号必须为18位', 'error');
        return;
    }
    
    // 身份证号验证
    const idPattern = /(^\d{15}$)|(^\d{17}([0-9]|X|x)$)/;
    if (!idPattern.test(passengerID)) {
        showToast('请输入有效的身份证号', 'error');
        return;
    }
    
    if (!passengerPhone) {
        showToast('请输入手机号', 'error');
        return;
    }
    
    if (passengerPhone.length !== 11) {
        showToast('手机号必须为11位', 'error');
        return;
    }
    
    showToast('提交订单中...');
    
    try {
        const insuranceFee = insuranceChecked ? 30 * seatCount : 0;
        const totalAmount = cabinType.price * seatCount + insuranceFee;
        
        const orderData = {
            flightId: flight.id,
            departureDate: new Date().toISOString().split('T')[0],
            passengerName,
            passengerId: passengerID,
            passengerPhone,
            cabinClass: cabinType.id,
            seatCount,
            insurance: insuranceChecked,
            totalAmount,
            paymentMethod: '企业对公支付'
        };
        
        const order = await createFlightOrder(orderData);
        AppState.currentFlightOrder = order;
        showFlightOrderDetailPage(order.id);
        showToast('订单提交成功');
    } catch (error) {
        console.error('提交订单失败:', error);
        showToast('提交订单失败', 'error');
    }
}

// 显示机票订单详情页面
function showFlightOrderDetailPage(orderId) {
    const backBtn = document.getElementById('backBtn');
    const tabbar = document.getElementById('tabbar');
    
    // 显示返回按钮，隐藏TabBar
    if (backBtn) backBtn.style.display = 'flex';
    if (tabbar) tabbar.style.display = 'none';
    
    // 更新导航栏标题
    navbarTitle.textContent = '订单详情';
    
    // 显示订单详情页
    showSubPage('flight-order-detail');
    
    // 加载订单详情
    loadFlightOrderDetail(orderId);
}

// 加载机票订单详情
async function loadFlightOrderDetail(orderId) {
    try {
        const order = await getFlightOrderDetail(orderId);
        AppState.currentFlightOrder = order;
        renderFlightOrderDetail(order);
    } catch (error) {
        console.error('加载订单详情失败:', error);
        showToast('加载订单详情失败', 'error');
    }
}

// 渲染机票订单详情
function renderFlightOrderDetail(order) {
    // 渲染订单状态
    const statusTextEl = document.getElementById('flightOrderStatusText');
    const statusDescEl = document.getElementById('flightOrderStatusDesc');
    
    if (statusTextEl) statusTextEl.textContent = order.status === 'confirmed' ? '已确认' : order.status === 'cancelled' ? '已取消' : '待确认';
    if (statusDescEl) statusDescEl.textContent = order.status === 'confirmed' ? '订单已确认，请按时登机' : order.status === 'cancelled' ? '订单已取消' : '订单待确认';
    
    // 渲染订单信息
    const orderNoEl = document.getElementById('flightDetailOrderNo');
    const createTimeEl = document.getElementById('flightDetailCreateTime');
    
    if (orderNoEl) orderNoEl.textContent = order.orderNo;
    if (createTimeEl) createTimeEl.textContent = order.createdAt;
    
    // 渲染航班信息
    const departureCityEl = document.getElementById('flightDetailDepartureCity');
    const departureAirportEl = document.getElementById('flightDetailDepartureAirport');
    const arrivalCityEl = document.getElementById('flightDetailArrivalCity');
    const arrivalAirportEl = document.getElementById('flightDetailArrivalAirport');
    const departureTimeEl = document.getElementById('flightDetailDepartureTime');
    const arrivalTimeEl = document.getElementById('flightDetailArrivalTime');
    const durationEl = document.getElementById('flightDetailDuration');
    const airlineEl = document.getElementById('flightDetailAirline');
    const flightNoEl = document.getElementById('flightDetailFlightNo');
    const dateEl = document.getElementById('flightDetailDate');
    
    if (departureCityEl) departureCityEl.textContent = order.flight.departureCity;
    if (departureAirportEl) departureAirportEl.textContent = order.flight.departureAirport;
    if (arrivalCityEl) arrivalCityEl.textContent = order.flight.arrivalCity;
    if (arrivalAirportEl) arrivalAirportEl.textContent = order.flight.arrivalAirport;
    if (departureTimeEl) departureTimeEl.textContent = order.flight.departureTime;
    if (arrivalTimeEl) arrivalTimeEl.textContent = order.flight.arrivalTime;
    if (durationEl) durationEl.textContent = order.flight.duration;
    if (airlineEl) airlineEl.textContent = order.flight.airline;
    if (flightNoEl) flightNoEl.textContent = order.flight.flightNo;
    if (dateEl) dateEl.textContent = order.flight.date;
    
    // 渲染乘机人信息
    const passengerNameEl = document.getElementById('flightDetailPassengerName');
    const passengerIDEl = document.getElementById('flightDetailPassengerID');
    const passengerPhoneEl = document.getElementById('flightDetailPassengerPhone');
    const seatCountEl = document.getElementById('flightDetailSeatCount');
    
    if (passengerNameEl) passengerNameEl.textContent = order.passengerName;
    if (passengerIDEl) passengerIDEl.textContent = order.passengerID;
    if (passengerPhoneEl) passengerPhoneEl.textContent = order.passengerPhone;
    if (seatCountEl) seatCountEl.textContent = order.seatCount;
    
    // 渲染价格信息
    const flightFeeEl = document.getElementById('flightDetailFlightFee');
    const insuranceFeeEl = document.getElementById('flightDetailInsuranceFee');
    const totalPriceEl = document.getElementById('flightDetailTotalPrice');
    
    if (flightFeeEl) flightFeeEl.textContent = `¥${order.totalAmount - 30 * order.seatCount}`;
    if (insuranceFeeEl) insuranceFeeEl.textContent = `¥${30 * order.seatCount}`;
    if (totalPriceEl) totalPriceEl.textContent = order.totalAmount;
    
    // 绑定订单详情页面事件
    bindFlightOrderDetailEvents();
}

// 绑定机票订单详情页面事件
function bindFlightOrderDetailEvents() {
    // 取消订单按钮
    const cancelOrderBtn = document.getElementById('cancelFlightOrderBtn');
    if (cancelOrderBtn) {
        cancelOrderBtn.addEventListener('click', function() {
            showCancelOrderModal('flight');
        });
    }
    
    // 联系客服按钮
    const contactServiceBtn = document.getElementById('contactFlightServiceBtn');
    if (contactServiceBtn) {
        contactServiceBtn.addEventListener('click', function() {
            showToast('客服电话：400-123-4567');
        });
    }
}

// 显示取消订单弹窗
function showCancelOrderModal(type) {
    const modal = document.getElementById('cancel-order-modal');
    const modalTitle = document.getElementById('cancel-modal-title');
    const cancelReason = document.getElementById('cancel-reason');
    const confirmCancelBtn = document.getElementById('confirm-cancel-btn');
    
    if (modal) {
        modalTitle.textContent = type === 'flight' ? '取消机票订单' : '取消酒店订单';
        cancelReason.value = '';
        modal.style.display = 'flex';
        
        // 绑定确认取消按钮事件
        if (confirmCancelBtn) {
            confirmCancelBtn.onclick = async function() {
                const reason = cancelReason.value;
                if (!reason) {
                    showToast('请填写取消原因', 'error');
                    return;
                }
                
                try {
                    if (type === 'flight') {
                        await cancelFlightOrder(AppState.currentFlightOrder.id, reason);
                    } else {
                        await cancelHotelOrder(AppState.currentHotelOrder.id, reason);
                    }
                    showToast('订单已取消');
                    modal.style.display = 'none';
                    // 重新加载订单详情
                    if (type === 'flight') {
                        loadFlightOrderDetail(AppState.currentFlightOrder.id);
                    } else {
                        loadHotelOrderDetail(AppState.currentHotelOrder.id);
                    }
                } catch (error) {
                    console.error('取消订单失败:', error);
                    showToast('取消订单失败', 'error');
                }
            };
        }
    }
}

// 初始化火车票预订事件监听
function initTrainBookingEventListeners() {
    // 出发站选择
    const trainSelectDeparture = document.getElementById('trainSelectDeparture');
    if (trainSelectDeparture) {
        trainSelectDeparture.addEventListener('click', function() {
            showCityModal('departure');
        });
    }
    
    // 到达站选择
    const trainSelectArrival = document.getElementById('trainSelectArrival');
    if (trainSelectArrival) {
        trainSelectArrival.addEventListener('click', function() {
            showCityModal('arrival');
        });
    }
    
    // 交换车站
    const trainSwapStations = document.getElementById('trainSwapStations');
    if (trainSwapStations) {
        trainSwapStations.addEventListener('click', function() {
            const departureCity = document.getElementById('trainDepartureCity');
            const arrivalCity = document.getElementById('trainArrivalCity');
            
            if (departureCity && arrivalCity) {
                const temp = departureCity.textContent;
                departureCity.textContent = arrivalCity.textContent;
                arrivalCity.textContent = temp;
                showToast('已交换出发/到达车站');
            }
        });
    }
    
    // 日期选择
    const trainSelectDate = document.getElementById('trainSelectDate');
    if (trainSelectDate) {
        trainSelectDate.addEventListener('click', function() {
            showDatePicker();
        });
    }
    
    // 车次类型筛选
    const trainFilterOptions = document.querySelectorAll('#train-index .filter-option');
    trainFilterOptions.forEach(option => {
        option.addEventListener('click', function() {
            trainFilterOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            showToast('已筛选: ' + this.textContent);
        });
    });
    
    // 搜索按钮
    const trainSearchBtn = document.getElementById('trainSearchBtn');
    if (trainSearchBtn) {
        trainSearchBtn.addEventListener('click', async function() {
            showToast('搜索车票中...');
            try {
                const departureCity = document.getElementById('trainDepartureCity').textContent;
                const arrivalCity = document.getElementById('trainArrivalCity').textContent;
                const result = await getTrains({ departureCity, arrivalCity, date: selectedDate });
                const trains = result.list || [];
                renderTrainList(trains);
                showToast('搜索完成');
            } catch (error) {
                console.error('搜索车票失败:', error);
                showToast('搜索失败，请重试', 'error');
            }
        });
    }
    
    // 火车票卡片点击
    const trainCards = document.querySelectorAll('.train-card');
    trainCards.forEach(card => {
        card.addEventListener('click', function() {
            const trainId = this.dataset.trainId;
            showTrainDetailPage(trainId);
        });
    });
}

// 更新日期显示
function updateDates() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const weeks = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    
    const checkInDate = document.getElementById('checkInDate');
    const checkInWeek = document.getElementById('checkInWeek');
    const checkOutDate = document.getElementById('checkOutDate');
    const checkOutWeek = document.getElementById('checkOutWeek');
    
    if (checkInDate) checkInDate.textContent = '今天';
    if (checkInWeek) checkInWeek.textContent = weeks[today.getDay()];
    if (checkOutDate) checkOutDate.textContent = '明天';
    if (checkOutWeek) checkOutWeek.textContent = weeks[tomorrow.getDay()];
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('企业商旅 APP 演示版本已加载');
    
    // 初始化DOM元素
    initDOMElements();
    
    // 初始化事件监听
    initEventListeners();
    
    // 更新日期显示
    updateDates();
    
    // 检查登录状态，决定显示哪个页面
    if (isLoggedIn()) {
        // 已登录，显示主页面
        const userInfo = getLoginInfo();
        // 更新个人中心显示的用户信息
        updateProfileInfo(userInfo);
        showPage('main');
        showSubPage('taxi-index');
        
        // 初始化地图
        setTimeout(initMap, 1000);
    } else {
        // 未登录，显示登录页面
        showPage('login');
    }
});

// 更新个人中心用户信息
function updateProfileInfo(userInfo) {
    const userNameEl = document.querySelector('#profile-index .user-name');
    const userCompanyEl = document.querySelector('#profile-index .user-company');
    const userDepartmentEl = document.querySelector('#profile-index .user-department');
    
    if (userInfo && userInfo.name) {
        if (userNameEl) userNameEl.textContent = userInfo.name;
    }
    if (userInfo && userInfo.company) {
        if (userCompanyEl) userCompanyEl.textContent = userInfo.company;
    }
    if (userInfo && userInfo.department) {
        if (userDepartmentEl) userDepartmentEl.textContent = userInfo.department;
    }
}

// 清除个人中心用户信息
function clearProfileInfo() {
    const userNameEl = document.querySelector('#profile-index .user-name');
    const userCompanyEl = document.querySelector('#profile-index .user-company');
    const userDepartmentEl = document.querySelector('#profile-index .user-department');
    
    if (userNameEl) userNameEl.textContent = '未登录';
    if (userCompanyEl) userCompanyEl.textContent = '';
    if (userDepartmentEl) userDepartmentEl.textContent = '';
}

// ==================== API 配置 ====================
const API_BASE_URL = 'http://localhost:8080/api';

// ==================== 应用状态扩展 ====================
Object.assign(AppState, {
    currentHotel: null,
    currentRoomType: null,
    currentOrder: null,
    checkInDate: null,
    checkOutDate: null,
    guestCount: 1,
    selectedCancelReason: null,
    hotels: [],
    orders: [],
    currentTrain: null,
    currentSeatType: null
});

// 打车订单创建函数
async function createTaxiOrder() {
    try {
        showLoading();
        
        // 收集订单信息
        const orderData = {
            startLocation: AppState.selectedStartLocation.name,
            startAddress: AppState.selectedStartLocation.address,
            endLocation: AppState.selectedEndLocation.name,
            endAddress: AppState.selectedEndLocation.address,
            carType: AppState.selectedCarType,
            passengerName: document.getElementById('taxiPassengerName').value,
            passengerPhone: document.getElementById('confirmPassengerPhone').value,
            passengerRemark: document.getElementById('confirmPassengerRemark').value,
            paymentMethod: AppState.paymentMethod || 'company',
            distance: document.getElementById('confirmDistance').textContent,
            duration: document.getElementById('confirmDuration').textContent,
            estimatedPrice: document.getElementById('confirmTotalPrice').textContent
        };
        
        // 调用后端API创建订单
        const newOrder = await apiRequest('/taxi-orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
        
        // 添加到订单列表
        if (!AppState.orders) {
            AppState.orders = [];
        }
        AppState.orders.unshift(newOrder);
        
        // 跳转到行程跟踪页面
        showToast('叫车成功，正在为您寻找司机');
        setTimeout(() => {
            showTaxiTrackingPage(newOrder);
        }, 1500);
    } catch (error) {
        hideLoading();
        console.error('创建打车订单失败:', error);
        showToast('叫车失败，请稍后重试', 'error');
    }
}

// ==================== API 请求方法 ====================

async function apiRequest(endpoint, options = {}) {
    const url = API_BASE_URL + endpoint;
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
        mode: 'cors',
    };
    
    try {
        showLoading();
        const response = await fetch(url, { ...defaultOptions, ...options });
        hideLoading();
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.code !== 200) {
            throw new Error(data.message || '请求失败');
        }
        
        return data.data;
    } catch (error) {
        hideLoading();
        console.error('API请求错误:', error);
        showToast('网络错误，请稍后重试', 'error');
        throw error;
    }
}

async function getHotels(params = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
    });
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/hotels?${queryString}` : '/hotels';
    return apiRequest(endpoint, { method: 'GET' });
}

async function getHotelDetail(hotelId) {
    return apiRequest(`/hotels/${hotelId}`, { method: 'GET' });
}

async function getRoomTypeDetail(roomTypeId) {
    return apiRequest(`/room-types/${roomTypeId}`, { method: 'GET' });
}

async function createOrder(params) {
    return apiRequest('/hotel-orders', {
        method: 'POST',
        body: JSON.stringify(params)
    });
}

async function getOrders(params = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
    });
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/hotel-orders?${queryString}` : '/hotel-orders';
    return apiRequest(endpoint, { method: 'GET' });
}

async function getOrderDetail(orderId) {
    return apiRequest(`/hotel-orders/${orderId}`, { method: 'GET' });
}

async function cancelOrder(orderId, reason) {
    return apiRequest(`/hotel-orders/${orderId}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ cancelReason: reason })
    });
}

// 火车票相关API请求
async function getTrainDetail(trainId) {
    return apiRequest(`/trains/${trainId}`, { method: 'GET' });
}

async function createTrainOrder(params) {
    return apiRequest('/train-orders', {
        method: 'POST',
        body: JSON.stringify(params)
    });
}

async function getTrains(params = {}) {
    const queryParams = new URLSearchParams();
    // 转换参数名：date -> departureDate
    if (params.date) {
        queryParams.append('departureDate', params.date);
    }
    if (params.departureCity) {
        queryParams.append('departureCity', params.departureCity);
    }
    if (params.arrivalCity) {
        queryParams.append('arrivalCity', params.arrivalCity);
    }
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/trains?${queryString}` : '/trains';
    const data = await apiRequest(endpoint, { method: 'GET' });
    return data;
}

function renderTrainList(trains) {
    const trainList = document.getElementById('trainList');
    if (!trainList) return;
    
    if (!trains || trains.length === 0) {
        trainList.innerHTML = '<div class="empty-trains">暂无车次</div>';
        return;
    }
    
    trainList.innerHTML = trains.map(train => `
        <div class="train-card" data-train-id="${train.id}">
            <div class="train-info">
                <div class="train-no">${train.trainNo}</div>
                <div class="train-type">${train.trainType}</div>
            </div>
            <div class="train-route">
                <div class="station-time">
                    <div class="time">${train.departureTime}</div>
                    <div class="station">${train.departureStation}</div>
                </div>
                <div class="train-duration">
                    <div class="duration">${train.duration}</div>
                    <div class="arrow">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M8 5L16 12L8 19" stroke="#1890FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                </div>
                <div class="station-time">
                    <div class="time">${train.arrivalTime}</div>
                    <div class="station">${train.arrivalStation}</div>
                </div>
            </div>
            <div class="train-price">
                <div class="price">¥${train.price}</div>
                <div class="seats">剩余 ${train.availableSeats} 张</div>
            </div>
        </div>
    `).join('');
    
    // 重新绑定点击事件
    const trainCards = document.querySelectorAll('.train-card');
    trainCards.forEach(card => {
        card.addEventListener('click', function() {
            const trainId = this.dataset.trainId;
            showTrainDetailPage(trainId);
        });
    });
}

// ==================== 加载/隐藏状态 ====================

function showLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.classList.remove('hidden');
    }
}

function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
}

// ==================== 页面导航扩展 ====================

function showHotelDetailPage(hotelId) {
    const backBtn = document.getElementById('backBtn');
    const tabbar = document.getElementById('tabbar');
    
    // 显示返回按钮，隐藏TabBar
    if (backBtn) backBtn.style.display = 'flex';
    if (tabbar) tabbar.style.display = 'none';
    
    // 更新导航栏标题
    navbarTitle.textContent = '酒店详情';
    
    // 显示详情页
    showSubPage('hotel-detail');
    
    // 加载酒店详情
    loadHotelDetail(hotelId);
}

function showRoomDetailPage(roomTypeId) {
    const backBtn = document.getElementById('backBtn');
    const tabbar = document.getElementById('tabbar');
    
    if (backBtn) backBtn.style.display = 'flex';
    if (tabbar) tabbar.style.display = 'none';
    
    navbarTitle.textContent = '房型详情';
    showSubPage('room-detail');
    
    loadRoomDetail(roomTypeId);
}

function showOrderConfirmPage() {
    if (!AppState.currentHotel || !AppState.currentRoomType) {
        showToast('请先选择酒店和房型', 'error');
        return;
    }
    
    const backBtn = document.getElementById('backBtn');
    const tabbar = document.getElementById('tabbar');
    
    if (backBtn) backBtn.style.display = 'flex';
    if (tabbar) tabbar.style.display = 'none';
    
    navbarTitle.textContent = '订单确认';
    showSubPage('hotel-order-confirm');
    
    renderOrderConfirmPage();
}

function showOrderDetailPage(orderId) {
    const backBtn = document.getElementById('backBtn');
    const tabbar = document.getElementById('tabbar');
    
    if (backBtn) backBtn.style.display = 'flex';
    if (tabbar) tabbar.style.display = 'none';
    
    navbarTitle.textContent = '订单详情';
    
    // 移除硬编码的页面切换，让 loadOrderDetail 函数根据订单类型处理页面切换
    loadOrderDetail(orderId);
}

function showTaxiOrderConfirmPage() {
    const backBtn = document.getElementById('backBtn');
    const tabbar = document.getElementById('tabbar');
    
    // 显示返回按钮，隐藏TabBar
    if (backBtn) backBtn.style.display = 'flex';
    if (tabbar) tabbar.style.display = 'none';
    
    // 更新导航栏标题
    navbarTitle.textContent = '确认叫车';
    
    // 显示订单确认页面
    showSubPage('taxi-order-confirm');
    
    // 渲染订单确认页面数据
    renderTaxiOrderConfirmPage();
}

// 火车票详情页面
function showTrainDetailPage(trainId) {
    const backBtn = document.getElementById('backBtn');
    const tabbar = document.getElementById('tabbar');
    
    // 显示返回按钮，隐藏TabBar
    if (backBtn) backBtn.style.display = 'flex';
    if (tabbar) tabbar.style.display = 'none';
    
    // 更新导航栏标题
    navbarTitle.textContent = '车次详情';
    
    // 显示详情页
    showSubPage('train-detail');
    
    // 加载火车票详情
    loadTrainDetail(trainId);
}

// 加载火车票详情
async function loadTrainDetail(trainId) {
    try {
        // 调用后端API获取火车票详情
        const train = await getTrainDetail(trainId);
        AppState.currentTrain = train;
        renderTrainDetail(train);
    } catch (error) {
        console.error('加载火车票详情失败:', error);
        showToast('加载火车票详情失败', 'error');
    }
}

// 渲染火车票详情
function renderTrainDetail(train) {
    // 渲染基本信息
    const trainNoEl = document.getElementById('trainDetailNo');
    const trainTypeEl = document.getElementById('trainDetailType');
    const departureTimeEl = document.getElementById('trainDetailDepartureTime');
    const departureStationEl = document.getElementById('trainDetailDepartureStation');
    const departureDateEl = document.getElementById('trainDetailDepartureDate');
    const arrivalTimeEl = document.getElementById('trainDetailArrivalTime');
    const arrivalStationEl = document.getElementById('trainDetailArrivalStation');
    const arrivalDateEl = document.getElementById('trainDetailArrivalDate');
    const durationEl = document.getElementById('trainDetailDuration');
    const tagEl = document.getElementById('trainDetailTag');
    
    if (trainNoEl) trainNoEl.textContent = train.trainNo;
    if (trainTypeEl) trainTypeEl.textContent = train.trainType;
    if (departureTimeEl) departureTimeEl.textContent = train.departureTime;
    if (departureStationEl) departureStationEl.textContent = train.departureStation;
    if (departureDateEl) departureDateEl.textContent = '今天';
    if (arrivalTimeEl) arrivalTimeEl.textContent = train.arrivalTime;
    if (arrivalStationEl) arrivalStationEl.textContent = train.arrivalStation;
    if (arrivalDateEl) arrivalDateEl.textContent = '今天';
    if (durationEl) durationEl.textContent = train.duration;
    if (tagEl) tagEl.textContent = train.isThrough ? '直达' : '中转';
    
    // 渲染座位类型列表
    renderSeatTypesList(train);
}

// 渲染座位类型列表
function renderSeatTypesList(train) {
    const listEl = document.getElementById('seatTypesList');
    if (!listEl) return;
    
    // 模拟座位类型数据
    const seatTypes = [
        {
            id: 'business',
            name: '商务座',
            price: 1748,
            available: 10
        },
        {
            id: 'first',
            name: '一等座',
            price: 933,
            available: 20
        },
        {
            id: 'second',
            name: '二等座',
            price: 553,
            available: 90
        }
    ];
    
    listEl.innerHTML = seatTypes.map(seat => `
        <div class="seat-type-card" data-seat-id="${seat.id}">
            <div class="seat-type-info">
                <div class="seat-type-name">${seat.name}</div>
                <div class="seat-type-available">剩余 ${seat.available} 个座位</div>
            </div>
            <div class="seat-type-price">¥${seat.price}</div>
        </div>
    `).join('');
    
    // 绑定座位类型卡片点击事件
    const seatCards = listEl.querySelectorAll('.seat-type-card');
    seatCards.forEach(card => {
        card.addEventListener('click', function() {
            const seatId = this.dataset.seatId;
            // 从座位类型列表中找到对应座位
            const seatType = seatTypes.find(s => s.id === seatId);
            if (seatType) {
                AppState.currentSeatType = seatType;
                showTrainOrderConfirmPage();
            }
        });
    });
}

// 显示火车票订单确认页面
function showTrainOrderConfirmPage() {
    if (!AppState.currentTrain || !AppState.currentSeatType) {
        showToast('请先选择车次和座位类型', 'error');
        return;
    }
    
    const backBtn = document.getElementById('backBtn');
    const tabbar = document.getElementById('tabbar');
    
    if (backBtn) backBtn.style.display = 'flex';
    if (tabbar) tabbar.style.display = 'none';
    
    navbarTitle.textContent = '确认订单';
    showSubPage('train-order-confirm');
    
    // 填充订单信息
    fillTrainOrderInfo();
    
    // 绑定提交订单按钮事件
    const submitBtn = document.getElementById('submitTrainOrderBtn');
    if (submitBtn) {
        submitBtn.addEventListener('click', submitTrainOrder);
    }
}

// 填充火车票订单信息
function fillTrainOrderInfo() {
    const train = AppState.currentTrain;
    const seatType = AppState.currentSeatType;
    
    if (!train || !seatType) return;
    
    // 填充车次信息
    const trainNoEl = document.getElementById('confirmTrainNo');
    const trainTypeEl = document.getElementById('confirmTrainType');
    const departureTimeEl = document.getElementById('confirmDepartureTime');
    const departureStationEl = document.getElementById('confirmDepartureStation');
    const arrivalTimeEl = document.getElementById('confirmArrivalTime');
    const arrivalStationEl = document.getElementById('confirmArrivalStation');
    const durationEl = document.getElementById('confirmDuration');
    
    if (trainNoEl) trainNoEl.textContent = train.trainNo;
    if (trainTypeEl) trainTypeEl.textContent = train.trainType;
    if (departureTimeEl) departureTimeEl.textContent = train.departureTime;
    if (departureStationEl) departureStationEl.textContent = train.departureStation;
    if (arrivalTimeEl) arrivalTimeEl.textContent = train.arrivalTime;
    if (arrivalStationEl) arrivalStationEl.textContent = train.arrivalStation;
    if (durationEl) durationEl.textContent = train.duration;
    
    // 填充座位类型
    const seatTypeEl = document.getElementById('confirmSeatType');
    if (seatTypeEl) seatTypeEl.textContent = seatType.name;
    
    // 填充价格信息
    const ticketPriceEl = document.getElementById('priceTicket');
    const insurancePriceEl = document.getElementById('priceInsurance');
    const totalPriceEl = document.getElementById('confirmTotalPrice');
    const bottomPriceEl = document.getElementById('confirmBottomPrice');
    
    const ticketPrice = seatType.price;
    const insurancePrice = 20;
    const totalPrice = ticketPrice + insurancePrice;
    
    if (ticketPriceEl) ticketPriceEl.textContent = `¥${ticketPrice}`;
    if (insurancePriceEl) insurancePriceEl.textContent = `¥${insurancePrice}`;
    if (totalPriceEl) totalPriceEl.textContent = totalPrice;
    if (bottomPriceEl) bottomPriceEl.textContent = totalPrice;
}

// 提交火车票订单
async function submitTrainOrder() {
    try {
        showLoading();
        
        // 收集订单信息
        const orderData = {
            trainId: AppState.currentTrain.id,
            departureDate: new Date().toISOString().split('T')[0],
            passengerName: document.getElementById('trainPassengerName').value,
            passengerId: document.getElementById('trainPassengerId').value,
            passengerPhone: document.getElementById('trainPassengerPhone').value,
            seatType: AppState.currentSeatType.name,
            seatCount: 1,
            insurance: document.getElementById('trainInsurance').checked
        };
        
        // 验证表单
        if (!orderData.passengerName) {
            hideLoading();
            showToast('请输入乘客姓名', 'error');
            return;
        }
        
        if (!orderData.passengerId) {
            hideLoading();
            showToast('请输入身份证号', 'error');
            return;
        }
        
        // 身份证号验证
        const idCardRegex = /(^\d{15}$)|(^\d{17}([0-9]|X)$)/;
        if (!idCardRegex.test(orderData.passengerId)) {
            hideLoading();
            showToast('请输入正确的身份证号', 'error');
            return;
        }
        
        if (!orderData.passengerPhone) {
            hideLoading();
            showToast('请输入手机号', 'error');
            return;
        }
        
        // 手机号验证
        const phoneRegex = /^1[3-9]\d{9}$/;
        if (!phoneRegex.test(orderData.passengerPhone)) {
            hideLoading();
            showToast('请输入正确的手机号', 'error');
            return;
        }
        
        // 调用后端API创建订单
        const newOrder = await createTrainOrder(orderData);
        
        // 添加订单类型
        newOrder.type = 'train';
        
        // 添加到订单列表
        if (!AppState.orders) {
            AppState.orders = [];
        }
        AppState.orders.unshift(newOrder);
        
        hideLoading();
        
        // 显示成功提示并跳转到订单列表
        showToast('订单提交成功！');
        setTimeout(() => {
            // 显示返回按钮，显示TabBar
            const backBtn = document.getElementById('backBtn');
            const tabbar = document.getElementById('tabbar');
            if (backBtn) backBtn.style.display = 'none';
            if (tabbar) tabbar.style.display = 'flex';
            
            showSubPage('orders-index');
        }, 1500);
    } catch (error) {
        hideLoading();
        console.error('提交火车票订单失败:', error);
        showToast('提交订单失败，请稍后重试', 'error');
    }
}

function renderTaxiOrderConfirmPage() {
    // 填充起终点信息
    const startLocationEl = document.getElementById('confirmStartLocation');
    const endLocationEl = document.getElementById('confirmEndLocation');
    const carTypeEl = document.getElementById('confirmCarType');
    
    if (AppState.selectedStartLocation) {
        startLocationEl.textContent = AppState.selectedStartLocation.name;
    }
    
    if (AppState.selectedEndLocation) {
        endLocationEl.textContent = AppState.selectedEndLocation.name;
    }
    
    // 填充车型信息
    const carTypeMap = {
        'economy': '经济型',
        'comfort': '舒适型',
        'business': '商务型',
        'luxury': '豪华型'
    };
    carTypeEl.textContent = carTypeMap[AppState.selectedCarType] || '舒适型';
    
    // 模拟距离和时长
    const distance = Math.floor(Math.random() * 20) + 5; // 5-25公里
    const duration = Math.floor(distance * 2) + 10; // 预估时长
    
    document.getElementById('confirmDistance').textContent = distance;
    document.getElementById('confirmDuration').textContent = duration;
    
    // 计算价格
    const carTypePrices = {
        'economy': { start: 8, distance: 2, duration: 0.5 },
        'comfort': { start: 10, distance: 2.5, duration: 0.8 },
        'business': { start: 15, distance: 3.5, duration: 1.2 },
        'luxury': { start: 20, distance: 5, duration: 1.5 }
    };
    
    const prices = carTypePrices[AppState.selectedCarType] || carTypePrices.comfort;
    const startPrice = prices.start;
    const distancePrice = Math.round(distance * prices.distance);
    const durationPrice = Math.round(duration * prices.duration);
    const totalPrice = startPrice + distancePrice + durationPrice;
    
    document.getElementById('priceStart').textContent = `¥${startPrice}`;
    document.getElementById('priceDistance').textContent = `¥${distancePrice}`;
    document.getElementById('priceDuration').textContent = `¥${durationPrice}`;
    document.getElementById('confirmTotalPrice').textContent = totalPrice;
    document.getElementById('confirmBottomPrice').textContent = totalPrice;
    
    // 预填出行人信息
    const userInfo = getLoginInfo();
    if (userInfo) {
        // 预填出租车预订页面
        const taxiNameEl = document.getElementById('taxiPassengerName');
        if (taxiNameEl && !taxiNameEl.value) {
            taxiNameEl.value = userInfo.name || '';
        }
        
        // 预填机票预订页面
        const flightNameEl = document.getElementById('confirmPassengerName');
        if (flightNameEl && !flightNameEl.value) {
            flightNameEl.value = userInfo.name || '';
        }
        
        // 预填火车票预订页面
        const trainNameEl = document.getElementById('trainPassengerName');
        if (trainNameEl && !trainNameEl.value) {
            trainNameEl.value = userInfo.name || '';
        }
    }
}

function selectPaymentMethod(method) {
    const paymentItems = document.querySelectorAll('.payment-item');
    paymentItems.forEach(item => {
        item.classList.remove('active');
    });
    
    const selectedItem = document.querySelector(`.payment-item`);
    if (selectedItem) {
        selectedItem.classList.add('active');
    }
    
    AppState.paymentMethod = method;
}

function showTaxiTrackingPage(order) {
    const backBtn = document.getElementById('backBtn');
    const tabbar = document.getElementById('tabbar');
    
    // 显示返回按钮，隐藏TabBar
    if (backBtn) backBtn.style.display = 'flex';
    if (tabbar) tabbar.style.display = 'none';
    
    // 更新导航栏标题
    navbarTitle.textContent = '行程跟踪';
    
    // 显示行程跟踪页面
    showSubPage('taxi-tracking');
    
    // 渲染行程跟踪页面数据
    renderTaxiTrackingPage(order);
    
    // 开始行程状态更新
    startTripStatusUpdate();
}

function renderTaxiTrackingPage(order) {
    // 填充行程信息
    if (order) {
        document.getElementById('trackingStartLocation').textContent = order.startLocation || '公司总部';
        document.getElementById('trackingEndLocation').textContent = order.endLocation || '北京首都国际机场';
        document.getElementById('trackingCarType').textContent = order.carType || '舒适型';
        document.getElementById('trackingDistance').textContent = order.distance || '28.5';
        document.getElementById('trackingDuration').textContent = order.duration || '45';
    }
}

function startTripStatusUpdate() {
    // 模拟行程状态更新
    const statusTexts = [
        { text: '司机正在赶来', desc: '预计3分钟后到达' },
        { text: '司机已到达', desc: '请尽快上车' },
        { text: '行程中', desc: '正在前往目的地' },
        { text: '行程即将结束', desc: '请准备下车' }
    ];
    
    let statusIndex = 0;
    
    const updateInterval = setInterval(() => {
        statusIndex++;
        if (statusIndex >= statusTexts.length) {
            clearInterval(updateInterval);
            return;
        }
        
        const status = statusTexts[statusIndex];
        document.getElementById('trackingStatusText').textContent = status.text;
        document.getElementById('trackingStatusDesc').textContent = status.desc;
    }, 10000); // 每10秒更新一次状态
}

window.goBack = function() {
    const backBtn = document.getElementById('backBtn');
    const tabbar = document.getElementById('tabbar');
    const currentPage = AppState.currentSubPage;
    
    // 隐藏返回按钮，显示TabBar
    if (backBtn) backBtn.style.display = 'none';
    if (tabbar) tabbar.style.display = 'flex';
    
    // 根据当前页面决定返回目标
    if (currentPage === 'hotel-detail') {
        // 从酒店详情返回酒店列表
        showSubPage('hotel-index');
        navbarTitle.textContent = '酒店预订';
        AppState.currentHotel = null;
    } else if (currentPage === 'room-detail') {
        // 从房型详情返回酒店详情
        if (AppState.currentHotel) {
            showHotelDetailPage(AppState.currentHotel.id);
        } else {
            showSubPage('hotel-index');
            navbarTitle.textContent = '酒店预订';
        }
    } else if (currentPage === 'hotel-order-confirm') {
        // 从订单确认返回房型详情
        if (AppState.currentRoomType) {
            showRoomDetailPage(AppState.currentRoomType.id);
        } else if (AppState.currentHotel) {
            showHotelDetailPage(AppState.currentHotel.id);
        } else {
            showSubPage('hotel-index');
            navbarTitle.textContent = '酒店预订';
        }
    } else if (currentPage === 'taxi-order-confirm') {
        // 从打车订单确认返回打车首页
        showSubPage('taxi-index');
        navbarTitle.textContent = '公务打车';
    } else if (currentPage === 'taxi-tracking') {
        // 从行程跟踪返回订单列表
        showSubPage('orders-index');
        navbarTitle.textContent = '我的订单';
    } else if (currentPage === 'hotel-order-detail') {
        // 从订单详情返回订单列表
        showSubPage('orders-index');
        navbarTitle.textContent = '我的订单';
        AppState.currentOrder = null;
    } else if (currentPage === 'flight-detail') {
        // 从航班详情返回机票列表
        showSubPage('flight-index');
        navbarTitle.textContent = '机票预订';
        AppState.currentFlight = null;
    } else if (currentPage === 'flight-order-confirm') {
        // 从机票订单确认返回航班详情
        if (AppState.currentFlight) {
            showFlightDetailPage(AppState.currentFlight.id);
        } else {
            showSubPage('flight-index');
            navbarTitle.textContent = '机票预订';
        }
    } else if (currentPage === 'flight-order-detail') {
        // 从机票订单详情返回订单列表
        showSubPage('orders-index');
        navbarTitle.textContent = '我的订单';
    } else if (currentPage === 'train-detail') {
        // 从火车票详情返回火车票列表
        showSubPage('train-index');
        navbarTitle.textContent = '火车票';
        AppState.currentTrain = null;
    } else if (currentPage === 'train-order-confirm') {
        // 从火车票订单确认返回火车票详情
        if (AppState.currentTrain) {
            showTrainDetailPage(AppState.currentTrain.id);
        } else {
            showSubPage('train-index');
            navbarTitle.textContent = '火车票';
        }
    } else if (currentPage === 'addresses-edit') {
        // 从地址编辑返回地址列表
        showSubPage('addresses-index');
        navbarTitle.textContent = '常用地址';
    } else if (currentPage === 'invoice-edit') {
        // 从发票编辑返回发票列表
        showSubPage('invoice-index');
        navbarTitle.textContent = '发票信息';
    } else if (currentPage === 'contact-edit') {
        // 从联系人编辑返回联系人列表
        showSubPage('contact-index');
        navbarTitle.textContent = '紧急联系人';
    } else if (currentPage === 'help-index' || currentPage === 'feedback-index' || currentPage === 'about-index') {
        // 从帮助、反馈、关于页面返回个人中心
        showSubPage('profile-index');
        navbarTitle.textContent = '我的';
    } else {
        // 默认返回上一个主要页面
        showSubPage('taxi-index');
        navbarTitle.textContent = '公务打车';
    }
}

// ==================== 数据渲染函数 ====================

async function loadHotelDetail(hotelId) {
    try {
        const data = await getHotelDetail(hotelId);
        AppState.currentHotel = data;
        renderHotelDetail(data);
    } catch (error) {
        console.error('加载酒店详情失败:', error);
    }
}

function renderHotelDetail(hotel) {
    // 渲染酒店图片
    const imageEl = document.getElementById('hotelDetailImage');
    if (imageEl && hotel.image) {
        imageEl.style.backgroundImage = `url(${hotel.image})`;
        imageEl.style.backgroundSize = 'cover';
        imageEl.style.backgroundPosition = 'center';
    }
    
    // 渲染酒店名称
    const nameEl = document.getElementById('hotelDetailName');
    if (nameEl) nameEl.textContent = hotel.name || '';
    
    // 渲染标签
    const tagsEl = document.getElementById('hotelDetailTags');
    if (tagsEl && hotel.tags) {
        tagsEl.innerHTML = hotel.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
    }
    
    // 渲染评分
    const ratingEl = document.getElementById('hotelDetailRating');
    if (ratingEl) ratingEl.textContent = hotel.rating || 0;
    
    const reviewsEl = document.getElementById('hotelDetailReviews');
    if (reviewsEl) reviewsEl.textContent = `${hotel.reviewCount || 0}条评价`;
    
    // 渲染地址
    const addressEl = document.getElementById('hotelDetailAddress');
    if (addressEl) addressEl.textContent = hotel.address || '';
    
    // 渲染描述
    const descEl = document.getElementById('hotelDetailDescription');
    if (descEl) descEl.textContent = hotel.description || '';
    
    // 渲染房型列表
    renderRoomTypesList(hotel.roomTypes);
}

function renderRoomTypesList(roomTypes) {
    const listEl = document.getElementById('roomTypesList');
    if (!listEl) return;
    
    if (!roomTypes || roomTypes.length === 0) {
        listEl.innerHTML = '<div class="empty-rooms">暂无可预订房型</div>';
        return;
    }
    
    listEl.innerHTML = roomTypes.map(room => `
        <div class="room-type-card" data-room-id="${room.id}">
            <div class="room-card-image" style="background-image: url(${room.image || ''}); background-size: cover; background-position: center;">
            </div>
            <div class="room-card-info">
                <div class="room-card-name">${room.name || ''}</div>
                <div class="room-card-specs">
                    <span class="spec-text">${room.size || ''}</span>
                    <span class="spec-text">${room.bedType || ''}</span>
                    <span class="spec-text">${room.breakfast || ''}</span>
                </div>
                <div class="room-card-cancel">${room.cancelPolicy || ''}</div>
                <div class="room-card-availability">剩余 ${room.availableCount || 0} 间</div>
            </div>
            <div class="room-card-price">
                <span class="price-symbol">¥</span>
                <span class="price-value">${room.price || 0}</span>
                <span class="price-unit">/晚</span>
                ${room.originalPrice ? `<span class="original-price">¥${room.originalPrice}</span>` : ''}
            </div>
        </div>
    `).join('');
    
    // 绑定房型卡片点击事件
    const roomCards = listEl.querySelectorAll('.room-type-card');
    roomCards.forEach(card => {
        card.addEventListener('click', function() {
            const roomId = this.dataset.roomId;
            // 从当前酒店的房型列表中找到对应房型
            const roomType = roomTypes.find(r => r.id === roomId);
            if (roomType) {
                AppState.currentRoomType = roomType;
                showRoomDetailPage(roomId);
            }
        });
    });
}

async function loadRoomDetail(roomTypeId) {
    try {
        const data = await getRoomTypeDetail(roomTypeId);
        AppState.currentRoomType = data.roomType;
        renderRoomDetail(data.roomType, data.hotel);
    } catch (error) {
        console.error('加载房型详情失败:', error);
    }
}

function renderRoomDetail(roomType, hotel) {
    // 渲染房型图片
    const imageEl = document.getElementById('roomDetailImage');
    if (imageEl && roomType.image) {
        imageEl.style.backgroundImage = `url(${roomType.image})`;
        imageEl.style.backgroundSize = 'cover';
        imageEl.style.backgroundPosition = 'center';
    }
    
    // 渲染房型名称
    const nameEl = document.getElementById('roomDetailName');
    if (nameEl) nameEl.textContent = roomType.name || '';
    
    // 渲染价格
    const priceEl = document.getElementById('roomDetailPrice');
    if (priceEl) priceEl.textContent = roomType.price || 0;
    
    const origPriceEl = document.getElementById('roomDetailOriginalPrice');
    if (origPriceEl && roomType.originalPrice) {
        origPriceEl.textContent = `¥${roomType.originalPrice}`;
        origPriceEl.style.display = 'inline';
    } else if (origPriceEl) {
        origPriceEl.style.display = 'none';
    }
    
    // 底部价格
    const bottomPriceEl = document.getElementById('roomBottomPrice');
    if (bottomPriceEl) bottomPriceEl.textContent = roomType.price || 0;
    
    // 渲染规格
    const sizeEl = document.getElementById('roomDetailSize');
    if (sizeEl) sizeEl.textContent = roomType.size || '';
    
    const bedEl = document.getElementById('roomDetailBedType');
    if (bedEl) bedEl.textContent = roomType.bedType || '';
    
    const breakfastEl = document.getElementById('roomDetailBreakfast');
    if (breakfastEl) breakfastEl.textContent = roomType.breakfast || '';
    
    // 渲染取消政策
    const cancelEl = document.getElementById('roomDetailCancelPolicy');
    if (cancelEl) cancelEl.textContent = roomType.cancelPolicy || '';
    
    // 渲染可用数量
    const availableEl = document.getElementById('roomDetailAvailableCount');
    if (availableEl) availableEl.textContent = roomType.availableCount || 0;
    
    // 渲染设施列表
    renderRoomFacilities(roomType.facilities);
}

function renderRoomFacilities(facilities) {
    const listEl = document.getElementById('roomFacilitiesList');
    if (!listEl) return;
    
    if (!facilities || facilities.length === 0) {
        listEl.innerHTML = '<div class="no-facilities">暂无设施信息</div>';
        return;
    }
    
    listEl.innerHTML = facilities.map(facility => `
        <div class="facility-item">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8" stroke="#1890FF" stroke-width="1.5"/>
                <path d="M6 10L9 13L14 8" stroke="#1890FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="facility-text">${facility}</span>
        </div>
    `).join('');
}

function renderOrderConfirmPage() {
    const hotel = AppState.currentHotel;
    const room = AppState.currentRoomType;
    
    if (!hotel || !room) return;
    
    // 渲染酒店图片
    const hotelImageEl = document.getElementById('confirmHotelImage');
    if (hotelImageEl && hotel.image) {
        hotelImageEl.style.backgroundImage = `url(${hotel.image})`;
        hotelImageEl.style.backgroundSize = 'cover';
        hotelImageEl.style.backgroundPosition = 'center';
    }
    
    // 渲染酒店名称
    const hotelNameEl = document.getElementById('confirmHotelName');
    if (hotelNameEl) hotelNameEl.textContent = hotel.name || '';
    
    // 渲染房型名称
    const roomNameEl = document.getElementById('confirmRoomName');
    if (roomNameEl) roomNameEl.textContent = room.name || '';
    
    // 渲染日期
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const checkInDate = AppState.checkInDate || formatDate(today);
    const checkOutDate = AppState.checkOutDate || formatDate(tomorrow);
    
    const checkInEl = document.getElementById('confirmCheckInDate');
    if (checkInEl) checkInEl.textContent = formatDisplayDate(checkInDate);
    
    const checkOutEl = document.getElementById('confirmCheckOutDate');
    if (checkOutEl) checkOutEl.textContent = formatDisplayDate(checkOutDate);
    
    // 计算天数
    const nights = calculateNights(checkInDate, checkOutDate);
    const nightsEl = document.getElementById('confirmNights');
    if (nightsEl) nightsEl.textContent = nights;
    
    // 渲染价格明细
    const roomFeeEl = document.getElementById('priceDetailRoomFee');
    if (roomFeeEl) roomFeeEl.textContent = `¥${room.price || 0}`;
    
    const priceNightsEl = document.getElementById('priceDetailNights');
    if (priceNightsEl) priceNightsEl.textContent = nights;
    
    // 计算总价
    const totalPrice = (room.price || 0) * nights;
    
    const totalPriceEl = document.getElementById('confirmTotalPrice');
    if (totalPriceEl) totalPriceEl.textContent = totalPrice;
    
    const bottomPriceEl = document.getElementById('confirmBottomPrice');
    if (bottomPriceEl) bottomPriceEl.textContent = totalPrice;
    
    // 预填入住人信息（模拟）
    const guestNameEl = document.getElementById('confirmGuestName');
    if (guestNameEl && !guestNameEl.value) {
        guestNameEl.value = '张三';
    }
    
    const guestPhoneEl = document.getElementById('confirmGuestPhone');
    if (guestPhoneEl && !guestPhoneEl.value) {
        guestPhoneEl.value = '13800138000';
    }
}

async function loadOrderDetail(orderId) {
    try {
        // 查找对应的订单
        let order = AppState.orders?.find(o => o.id === orderId);
        let data;
        
        if (order?.type === 'flight') {
            // 机票订单
            data = await apiRequest(`/flight-orders/${orderId}`, { method: 'GET' });
        } else if (order?.type === 'train') {
            // 火车票订单
            data = await apiRequest(`/train-orders/${orderId}`, { method: 'GET' });
        } else if (order?.type === 'taxi') {
            // 打车订单
            data = await apiRequest(`/taxi-orders/${orderId}`, { method: 'GET' });
        } else {
            // 尝试所有可能的订单类型
            try {
                // 尝试火车票订单
                data = await apiRequest(`/train-orders/${orderId}`, { method: 'GET' });
                data.type = 'train';
            } catch (e) {
                try {
                    // 尝试机票订单
                    data = await apiRequest(`/flight-orders/${orderId}`, { method: 'GET' });
                    data.type = 'flight';
                } catch (e) {
                    try {
                        // 尝试打车订单
                        data = await apiRequest(`/taxi-orders/${orderId}`, { method: 'GET' });
                        data.type = 'taxi';
                    } catch (e) {
                        // 尝试酒店订单
                        data = await apiRequest(`/hotel-orders/${orderId}`, { method: 'GET' });
                        data.type = 'hotel';
                    }
                }
            }
        }
        
        AppState.currentOrder = data;
        
        // 根据订单类型显示对应的详情页面
        if (data.type === 'flight') {
            showSubPage('flight-order-detail');
        } else if (data.type === 'train') {
            // 由于没有专门的火车票订单详情页面，使用酒店订单详情页面作为模板
            showSubPage('hotel-order-detail');
        } else if (data.type === 'taxi') {
            // 由于没有专门的打车订单详情页面，使用酒店订单详情页面作为模板
            showSubPage('hotel-order-detail');
        } else {
            // 酒店订单
            showSubPage('hotel-order-detail');
        }
        
        renderOrderDetail(data);
    } catch (error) {
        console.error('加载订单详情失败:', error);
    }
}

function renderOrderDetail(order) {
    // 渲染订单状态
    const statusHeader = document.getElementById('orderStatusHeader');
    const statusText = document.getElementById('orderStatusText');
    const statusDesc = document.getElementById('orderStatusDesc');
    
    const statusMap = {
        'confirmed': { text: '已确认', desc: '订单已确认，请按时出行', color: '#1890FF' },
        'completed': { text: '已完成', desc: '订单已完成，感谢您的使用', color: '#52C41A' },
        'cancelled': { text: '已取消', desc: '订单已取消', color: '#999999' },
        'active': { text: '行程中', desc: '您正在行程中', color: '#FAAD14' }
    };
    
    const status = statusMap[order.status] || statusMap['confirmed'];
    
    if (statusText) statusText.textContent = status.text;
    if (statusDesc) statusDesc.textContent = status.desc;
    
    // 渲染订单编号
    const orderNoEl = document.getElementById('detailOrderNo');
    if (orderNoEl) orderNoEl.textContent = order.orderNo || '';
    
    // 渲染创建时间
    const createTimeEl = document.getElementById('detailCreateTime');
    if (createTimeEl) {
        createTimeEl.textContent = order.createTime ? formatDateTime(order.createTime) : '';
    }
    
    // 根据订单类型渲染不同的详情
    if (order.type === 'train') {
        // 火车票订单
        const train = order.train || {};
        
        // 渲染火车票信息（第二个 order-detail-section，索引为 1）
        const sections = document.querySelectorAll('#hotel-order-detail .order-detail-section');
        if (sections.length >= 4) {
            // 渲染火车票信息
            sections[1].innerHTML = `
                <div class="detail-section-title">火车票信息</div>
                <div class="detail-hotel-card" style="padding: 16px;">
                    <div class="train-info-detail">
                        <div class="train-header" style="display: flex; justify-content: space-between; margin-bottom: 16px;">
                            <div class="train-no" style="font-size: 18px; font-weight: bold;">${train.trainNo || ''}</div>
                            <div class="train-type" style="color: #1890FF;">${train.trainType || ''}</div>
                        </div>
                        <div class="train-route" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                            <div class="route-item" style="text-align: left;">
                                <div class="station" style="font-size: 16px; font-weight: bold;">${train.departureStation || ''}</div>
                                <div class="time" style="font-size: 14px; color: #666;">${train.departureTime || ''}</div>
                                <div class="city" style="font-size: 12px; color: #999;">${train.departureCity || ''}</div>
                            </div>
                            <div class="route-line" style="flex: 1; margin: 0 16px;">
                                <div style="height: 2px; background: #E8E8E8; position: relative;">
                                    <div style="position: absolute; top: -5px; left: 0; width: 12px; height: 12px; border-radius: 50%; background: #1890FF;"></div>
                                    <div style="position: absolute; top: -5px; right: 0; width: 12px; height: 12px; border-radius: 50%; background: #1890FF;"></div>
                                </div>
                                <div class="duration" style="text-align: center; font-size: 12px; color: #999; margin-top: 8px;">${train.duration || ''}</div>
                            </div>
                            <div class="route-item" style="text-align: right;">
                                <div class="station" style="font-size: 16px; font-weight: bold;">${train.arrivalStation || ''}</div>
                                <div class="time" style="font-size: 14px; color: #666;">${train.arrivalTime || ''}</div>
                                <div class="city" style="font-size: 12px; color: #999;">${train.arrivalCity || ''}</div>
                            </div>
                        </div>
                        <div class="train-detail-info" style="margin-top: 16px;">
                            <div class="info-item" style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span class="label" style="color: #666;">出发日期</span>
                                <span class="value">${order.departureDate || ''}</span>
                            </div>
                            <div class="info-item" style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span class="label" style="color: #666;">座位类型</span>
                                <span class="value">${order.seatType || ''}</span>
                            </div>
                            <div class="info-item" style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span class="label" style="color: #666;">座位数量</span>
                                <span class="value">${order.seatCount || 1}张</span>
                            </div>
                            <div class="info-item" style="display: flex; justify-content: space-between;">
                                <span class="label" style="color: #666;">保险</span>
                                <span class="value">${order.insurance ? '是' : '否'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // 渲染乘车人信息
            sections[2].innerHTML = `
                <div class="detail-section-title">乘车人信息</div>
                <div class="detail-guest-card">
                    <div class="detail-guest-item">
                        <span class="detail-guest-label">姓名</span>
                        <span class="detail-guest-value">${order.passengerName || ''}</span>
                    </div>
                    <div class="detail-guest-item">
                        <span class="detail-guest-label">身份证号</span>
                        <span class="detail-guest-value">${order.passengerId || ''}</span>
                    </div>
                    <div class="detail-guest-item">
                        <span class="detail-guest-label">手机号</span>
                        <span class="detail-guest-value">${order.passengerPhone || ''}</span>
                    </div>
                </div>
            `;
            
            // 渲染价格明细
            sections[3].innerHTML = `
                <div class="detail-section-title">价格明细</div>
                <div class="detail-price-card">
                    <div class="detail-price-item">
                        <span class="detail-price-label">票价</span>
                        <span class="detail-price-value">¥${(train.price || 0) * (order.seatCount || 1)}</span>
                    </div>
                    ${order.insurance ? `
                    <div class="detail-price-item">
                        <span class="detail-price-label">保险</span>
                        <span class="detail-price-value">¥${20 * (order.seatCount || 1)}</span>
                    </div>
                    ` : ''}
                    <div class="detail-price-total">
                        <span class="detail-total-label">支付金额</span>
                        <span class="detail-total-value">
                            <span class="detail-total-symbol">¥</span>
                            <span class="detail-total-amount">${order.totalPrice || 0}</span>
                        </span>
                    </div>
                    <div class="detail-payment-method">
                        <span class="payment-method-label">支付方式</span>
                        <span class="payment-method-value">企业对公支付</span>
                    </div>
                </div>
            `;
        }
    } else if (order.type === 'flight') {
        // 机票订单
        const flight = order.flight || {};
        
        // 渲染机票信息
        const orderContentEl = document.querySelector('#hotel-order-detail .order-content');
        if (orderContentEl) {
            orderContentEl.innerHTML = `
                <div class="flight-info-detail">
                    <div class="flight-header">
                        <div class="airline">${flight.airline || ''}</div>
                        <div class="flight-no">${flight.flightNo || ''}</div>
                    </div>
                    <div class="flight-route">
                        <div class="route-item">
                            <div class="airport">${flight.departureAirport || ''}</div>
                            <div class="time">${flight.departureTime || ''}</div>
                            <div class="city">${flight.departureCity || ''}</div>
                        </div>
                        <div class="route-line">
                            <div class="duration">${flight.duration || ''}</div>
                        </div>
                        <div class="route-item">
                            <div class="airport">${flight.arrivalAirport || ''}</div>
                            <div class="time">${flight.arrivalTime || ''}</div>
                            <div class="city">${flight.arrivalCity || ''}</div>
                        </div>
                    </div>
                    <div class="flight-detail-info">
                        <div class="info-item">
                            <span class="label">出发日期</span>
                            <span class="value">${order.departureDate || ''}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">舱位</span>
                            <span class="value">${order.cabinClass || ''}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">座位数量</span>
                            <span class="value">${order.seatCount || 1}张</span>
                        </div>
                        <div class="info-item">
                            <span class="label">保险</span>
                            <span class="value">${order.insurance ? '是' : '否'}</span>
                        </div>
                    </div>
                </div>
                <div class="passenger-info">
                    <div class="section-title">乘机人信息</div>
                    <div class="info-item">
                        <span class="label">姓名</span>
                        <span class="value">${order.passengerName || ''}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">身份证号</span>
                        <span class="value">${order.passengerId || ''}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">手机号</span>
                        <span class="value">${order.passengerPhone || ''}</span>
                    </div>
                </div>
            `;
        }
        
        // 渲染价格
        const priceSectionEl = document.querySelector('#hotel-order-detail .price-section');
        if (priceSectionEl) {
            priceSectionEl.innerHTML = `
                <div class="price-item">
                    <span class="label">票价</span>
                    <span class="value">¥${(flight.price || 0) * (order.seatCount || 1)}</span>
                </div>
                ${order.insurance ? `
                <div class="price-item">
                    <span class="label">保险</span>
                    <span class="value">¥${30 * (order.seatCount || 1)}</span>
                </div>
                ` : ''}
                <div class="price-item total">
                    <span class="label">总计</span>
                    <span class="value">¥${order.totalPrice || 0}</span>
                </div>
            `;
        }
    } else if (order.type === 'taxi') {
        // 打车订单
        const orderContentEl = document.querySelector('#hotel-order-detail .order-content');
        if (orderContentEl) {
            orderContentEl.innerHTML = `
                <div class="taxi-info-detail">
                    <div class="route-info">
                        <div class="route-item">
                            <div class="dot blue-dot"></div>
                            <div class="location-info">
                                <div class="location-label">起点</div>
                                <div class="location-name">${order.startLocation || ''}</div>
                                <div class="location-address">${order.startAddress || ''}</div>
                            </div>
                        </div>
                        <div class="route-line"></div>
                        <div class="route-item">
                            <div class="dot green-dot"></div>
                            <div class="location-info">
                                <div class="location-label">终点</div>
                                <div class="location-name">${order.endLocation || ''}</div>
                                <div class="location-address">${order.endAddress || ''}</div>
                            </div>
                        </div>
                    </div>
                    <div class="taxi-detail-info">
                        <div class="info-item">
                            <span class="label">车型</span>
                            <span class="value">${order.carType || ''}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">距离</span>
                            <span class="value">${order.distance || ''}公里</span>
                        </div>
                        <div class="info-item">
                            <span class="label">时长</span>
                            <span class="value">${order.duration || ''}分钟</span>
                        </div>
                        ${order.driverName ? `
                        <div class="info-item">
                            <span class="label">司机</span>
                            <span class="value">${order.driverName} ${order.driverCarNo || ''}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
                <div class="passenger-info">
                    <div class="section-title">乘车人信息</div>
                    <div class="info-item">
                        <span class="label">姓名</span>
                        <span class="value">${order.passengerName || ''}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">手机号</span>
                        <span class="value">${order.passengerPhone || ''}</span>
                    </div>
                </div>
            `;
        }
        
        // 渲染价格
        const priceSectionEl = document.querySelector('#hotel-order-detail .price-section');
        if (priceSectionEl) {
            priceSectionEl.innerHTML = `
                <div class="price-item">
                    <span class="label">行程费用</span>
                    <span class="value">¥${order.totalPrice || order.estimatedPrice || 0}</span>
                </div>
                <div class="price-item total">
                    <span class="label">总计</span>
                    <span class="value">¥${order.totalPrice || order.estimatedPrice || 0}</span>
                </div>
            `;
        }
    } else {
        // 酒店订单
        const hotel = order.hotel || {};
        const roomType = order.roomType || {};
        
        // 渲染酒店信息
        const orderContentEl = document.querySelector('#hotel-order-detail .order-content');
        if (orderContentEl) {
            orderContentEl.innerHTML = `
                <div class="hotel-info-detail">
                    <div class="hotel-image" style="background-image: url(${hotel.image || ''}); background-size: cover; background-position: center;"></div>
                    <div class="hotel-details">
                        <div class="hotel-name">${hotel.name || ''}</div>
                        <div class="hotel-address">${hotel.address || ''}</div>
                        <div class="room-info">
                            <div class="room-name">${roomType.name || ''}</div>
                            <div class="room-facilities">
                                ${roomType.facilities ? roomType.facilities.map(f => `<span class="facility-tag">${f}</span>`).join('') : ''}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="booking-info">
                    <div class="section-title">预订信息</div>
                    <div class="info-item">
                        <span class="label">入住日期</span>
                        <span class="value">${order.checkInDate || ''}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">离店日期</span>
                        <span class="value">${order.checkOutDate || ''}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">入住天数</span>
                        <span class="value">${order.nights || 0}晚</span>
                    </div>
                </div>
                <div class="guest-info">
                    <div class="section-title">入住人信息</div>
                    <div class="info-item">
                        <span class="label">姓名</span>
                        <span class="value">${order.guestName || ''}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">手机号</span>
                        <span class="value">${order.guestPhone || ''}</span>
                    </div>
                </div>
            `;
        }
        
        // 渲染价格
        const priceSectionEl = document.querySelector('#hotel-order-detail .price-section');
        if (priceSectionEl) {
            priceSectionEl.innerHTML = `
                <div class="price-item">
                    <span class="label">房费</span>
                    <span class="value">¥${order.totalPrice || 0}</span>
                </div>
                <div class="price-item total">
                    <span class="label">总计</span>
                    <span class="value">¥${order.totalPrice || 0}</span>
                </div>
            `;
        }
    }
    
    // 渲染操作按钮
    const actionsEl = document.getElementById('orderDetailActions');
    const cancelBtn = document.getElementById('cancelOrderBtn');
    
    if (order.status === 'confirmed') {
        // 已确认订单可以取消
        if (actionsEl) actionsEl.style.display = 'flex';
        if (cancelBtn) cancelBtn.style.display = 'block';
    } else {
        // 其他状态隐藏取消按钮
        if (actionsEl) actionsEl.style.display = 'none';
    }
}

// 加载订单列表
async function loadOrderList() {
    try {
        // 同时获取酒店订单、打车订单、机票订单和火车票订单
        const [hotelOrders, taxiOrders, flightOrders, trainOrders] = await Promise.all([
            getOrders(),
            apiRequest('/taxi-orders', { method: 'GET' }),
            apiRequest('/flight-orders', { method: 'GET' }),
            apiRequest('/train-orders', { method: 'GET' })
        ]);
        
        // 合并订单列表
        const hotelList = hotelOrders.list || [];
        const taxiList = taxiOrders.list || [];
        const flightList = flightOrders.list || [];
        const trainList = trainOrders.list || [];
        
        // 为打车订单添加type字段
        taxiList.forEach(order => {
            order.type = 'taxi';
        });
        
        // 为机票订单添加type字段
        flightList.forEach(order => {
            order.type = 'flight';
        });
        
        // 为火车票订单添加type字段
        trainList.forEach(order => {
            order.type = 'train';
        });
        
        // 合并并按创建时间排序
        const allOrders = [...hotelList, ...taxiList, ...flightList, ...trainList].sort((a, b) => {
            return new Date(b.createTime || b.createdAt) - new Date(a.createTime || a.createdAt);
        });
        
        AppState.orders = allOrders;
        renderOrderList(allOrders);
    } catch (error) {
        console.error('加载订单列表失败:', error);
        renderOrderList([]);
    }
}

// 渲染订单列表
function renderOrderList(orders) {
    const listEl = document.querySelector('#orders-index .orders-list');
    if (!listEl) return;
    
    // 根据当前订单类型过滤订单
    const currentType = AppState.currentOrderType || 'all';
    let filteredOrders = orders || [];
    
    if (currentType === 'hotel') {
        // 酒店订单：有 hotel 字段的订单
        filteredOrders = filteredOrders.filter(order => order.hotel);
    } else if (currentType === 'taxi') {
        // 打车订单：type 为 taxi 的订单
        filteredOrders = filteredOrders.filter(order => order.type === 'taxi');
    } else if (currentType === 'flight') {
        // 机票订单：type 为 flight 的订单
        filteredOrders = filteredOrders.filter(order => order.type === 'flight');
    } else if (currentType === 'train') {
        // 火车票订单：type 为 train 的订单
        filteredOrders = filteredOrders.filter(order => order.type === 'train');
    }
    
    // 根据订单类型显示不同的空状态
    if (!filteredOrders || filteredOrders.length === 0) {
        let emptyText = '暂无订单';
        let emptyTip = '去预订一个酒店吧';
        
        if (currentType === 'hotel') {
            emptyText = '暂无酒店订单';
            emptyTip = '去预订一个酒店吧';
        } else if (currentType === 'taxi') {
            emptyText = '暂无打车订单';
            emptyTip = '去打一个车吧';
        } else if (currentType === 'flight') {
            emptyText = '暂无机票订单';
            emptyTip = '去预订一张机票吧';
        } else if (currentType === 'train') {
            emptyText = '暂无火车票订单';
            emptyTip = '去预订一张火车票吧';
        }
        
        listEl.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                        <rect x="4" y="8" width="56" height="48" rx="4" stroke="#999999" stroke-width="2"/>
                        <line x1="4" y1="20" x2="60" y2="20" stroke="#999999" stroke-width="2"/>
                        <path d="M20 40L28 48L44 32" stroke="#999999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/>
                    </svg>
                </div>
                <div class="empty-text">${emptyText}</div>
                <div class="empty-tip">${emptyTip}</div>
            </div>
        `;
        return;
    }
    
    listEl.innerHTML = filteredOrders.map(order => {
        const hotel = order.hotel || {};
        const roomType = order.roomType || {};
        
        const statusMap = {
            'confirmed': { text: '已确认', class: 'confirmed' },
            'completed': { text: '已完成', class: 'completed' },
            'cancelled': { text: '已取消', class: 'cancelled' },
            'active': { text: '行程中', class: 'active' }
        };
        
        const status = statusMap[order.status] || statusMap['confirmed'];
        
        let actionsHtml = '';
        if (order.status === 'confirmed') {
            actionsHtml = `
                <div class="order-actions">
                    <div class="action-btn secondary">联系客服</div>
                    <div class="action-btn primary" data-order-id="${order.id}">取消订单</div>
                </div>
            `;
        } else if (order.status === 'active') {
            actionsHtml = `
                <div class="order-actions">
                    <div class="action-btn secondary">联系客服</div>
                    <div class="action-btn primary">查看行程</div>
                </div>
            `;
        }
        
        // 判断订单类型
        if (order.type === 'flight') {
            // 机票订单
            const flight = order.flight || {};
            return `
                <div class="order-card" data-order-id="${order.id}">
                    <div class="order-header">
                        <div class="order-type">
                            <div class="type-icon flight">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M21 16L13 14L5 16L9 22H15L21 16Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M13 2V14" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M5 10L13 14L21 10" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </div>
                            <span class="type-text">机票预订</span>
                        </div>
                        <span class="order-status ${status.class}">${status.text}</span>
                    </div>
                    <div class="order-content">
                        <div class="order-main">
                            <div class="flight-info-small">
                                <div class="flight-route">
                                    <span class="flight-city">${flight.departureCity || '未知'}</span>
                                    <svg class="flight-arrow" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path d="M21 16L13 14L5 16L9 22H15L21 16Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M13 2V14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M5 10L13 14L21 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                    <span class="flight-city">${flight.arrivalCity || '未知'}</span>
                                </div>
                                <div class="flight-detail">${flight.airline || '未知'} ${flight.flightNo || ''} · ${order.departureDate || ''} · ${order.seatCount || 1}人</div>
                            </div>
                        </div>
                    </div>
                    <div class="order-footer">
                        <span class="order-time">${order.createdAt ? formatDateTime(order.createdAt) : order.createTime ? formatDateTime(order.createTime) : ''}</span>
                        <div class="order-price">
                            <span class="price-label">订单金额</span>
                            <span class="price-symbol">¥</span>
                            <span class="price-value">${order.totalPrice || order.totalAmount || 0}</span>
                        </div>
                    </div>
                    ${actionsHtml}
                </div>
            `;
        } else if (order.type === 'train') {
            // 火车票订单
            const train = order.train || {};
            return `
                <div class="order-card" data-order-id="${order.id}">
                    <div class="order-header">
                        <div class="order-type">
                            <div class="type-icon train">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <rect x="4" y="2" width="16" height="16" rx="3" stroke="white" stroke-width="2"/>
                                    <path d="M8 2V0H16V2" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <circle cx="8" cy="20" r="2" stroke="white" stroke-width="2"/>
                                    <circle cx="16" cy="20" r="2" stroke="white" stroke-width="2"/>
                                </svg>
                            </div>
                            <span class="type-text">火车票</span>
                        </div>
                        <span class="order-status ${status.class}">${status.text}</span>
                    </div>
                    <div class="order-content">
                        <div class="order-main">
                            <div class="flight-info-small">
                                <div class="flight-route">
                                    <span class="flight-city">${train.departureCity || '未知'}</span>
                                    <svg class="flight-arrow" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path d="M21 16L13 14L5 16L9 22H15L21 16Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M13 2V14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M5 10L13 14L21 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                    <span class="flight-city">${train.arrivalCity || '未知'}</span>
                                </div>
                                <div class="flight-detail">${train.trainNo || '未知'} ${train.trainType || ''} · ${order.departureDate || ''} · ${order.seatCount || 1}人</div>
                            </div>
                        </div>
                    </div>
                    <div class="order-footer">
                        <span class="order-time">${order.createdAt ? formatDateTime(order.createdAt) : order.createTime ? formatDateTime(order.createTime) : ''}</span>
                        <div class="order-price">
                            <span class="price-label">订单金额</span>
                            <span class="price-symbol">¥</span>
                            <span class="price-value">${order.totalPrice || order.totalAmount || 0}</span>
                        </div>
                    </div>
                    ${actionsHtml}
                </div>
            `;
        } else if (order.type === 'taxi') {
            // 打车订单
            return `
                <div class="order-card" data-order-id="${order.id}">
                    <div class="order-header">
                        <div class="order-type">
                            <div class="type-icon taxi">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <rect x="3" y="8" width="18" height="12" rx="3" fill="white"/>
                                    <rect x="6" y="4" width="12" height="6" rx="2" fill="white" opacity="0.7"/>
                                    <circle cx="7" cy="22" r="2" fill="white"/>
                                    <circle cx="17" cy="22" r="2" fill="white"/>
                                </svg>
                            </div>
                            <span class="type-text">公务打车</span>
                        </div>
                        <span class="order-status ${status.class}">${status.text}</span>
                    </div>
                    <div class="order-content">
                        <div class="route-info">
                            <div class="route-item">
                                <div class="dot blue-dot"></div>
                                <span class="location-text">${order.startLocation || '未知起点'}</span>
                            </div>
                            <div class="route-line"></div>
                            <div class="route-item">
                                <div class="dot green-dot"></div>
                                <span class="location-text">${order.endLocation || '未知终点'}</span>
                            </div>
                        </div>
                        <div class="order-subtitle">${order.carType || '未知车型'} · ${order.distance || '0'}公里 · ${order.status === 'completed' ? order.duration : '预计' + order.duration}分钟</div>
                    </div>
                    <div class="order-footer">
                        <span class="order-time">${order.createTime ? formatDateTime(order.createTime) : ''}</span>
                        <div class="order-price">
                            <span class="price-label">${order.status === 'completed' ? '订单金额' : '预估金额'}</span>
                            <span class="price-symbol">¥</span>
                            <span class="price-value">${order.totalPrice || order.estimatedPrice || 0}</span>
                        </div>
                    </div>
                    ${actionsHtml}
                </div>
            `;
        } else {
            // 酒店订单
            return `
                <div class="order-card" data-order-id="${order.id}">
                    <div class="order-header">
                        <div class="order-type">
                            <div class="type-icon hotel">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 2L2 10H4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10H22L12 2Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M8 22V16H16V22" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </div>
                            <span class="type-text">酒店预订</span>
                        </div>
                        <span class="order-status ${status.class}">${status.text}</span>
                    </div>
                    <div class="order-content">
                        <div class="order-main">
                            <div class="hotel-image-small" style="${hotel.image ? `background-image: url(${hotel.image}); background-size: cover; background-position: center;` : 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);'}">
                                ${!hotel.image ? `
                                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style="opacity: 0.5;">
                                        <rect x="4" y="10" width="32" height="26" rx="3" fill="white"/>
                                        <rect x="8" y="4" width="24" height="12" rx="3" fill="white" opacity="0.7"/>
                                    </svg>
                                ` : ''}
                            </div>
                            <div class="hotel-info-small">
                                <div class="hotel-name-small">${hotel.name || '未知酒店'}</div>
                                <div class="hotel-subtitle">${roomType.name || ''} · ${order.checkInDate || ''} 入住 ${order.nights || 1}晚</div>
                            </div>
                        </div>
                    </div>
                    <div class="order-footer">
                        <span class="order-time">${order.createTime ? formatDateTime(order.createTime) : ''}</span>
                        <div class="order-price">
                            <span class="price-label">订单金额</span>
                            <span class="price-symbol">¥</span>
                            <span class="price-value">${order.totalPrice || 0}</span>
                        </div>
                    </div>
                    ${actionsHtml}
                </div>
            `;
        }
    }).join('');
    
    // 绑定订单卡片点击事件
    const orderCards = listEl.querySelectorAll('.order-card');
    orderCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // 不阻止操作按钮的点击
            if (e.target.classList.contains('action-btn') || e.target.closest('.action-btn')) {
                return;
            }
            const orderId = this.dataset.orderId;
            if (orderId) {
                // 查找对应的订单
                const order = filteredOrders.find(o => o.id === orderId);
                if (order && order.type === 'flight') {
                    // 机票订单跳转到机票订单详情页面
                    showFlightOrderDetailPage(orderId);
                } else if (order && order.type === 'taxi' && order.status === 'active') {
                    // 行程中的打车订单跳转到行程跟踪页面
                    showTaxiTrackingPage(order);
                } else {
                    // 其他订单跳转到订单详情页面
                    showOrderDetailPage(orderId);
                }
            }
        });
    });
    
    // 绑定取消订单按钮事件
    const cancelBtns = listEl.querySelectorAll('.action-btn.primary');
    cancelBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const orderId = this.dataset.orderId;
            if (orderId) {
                // 先加载订单详情，然后显示取消弹窗
                loadOrderDetail(orderId);
                showCancelOrderModal();
            }
        });
    });
}

// ==================== 订单操作 ====================

async function submitHotelOrder() {
    const guestName = document.getElementById('confirmGuestName')?.value?.trim();
    const guestPhone = document.getElementById('confirmGuestPhone')?.value?.trim();
    
    if (!guestName) {
        showToast('请输入入住人姓名', 'error');
        return;
    }
    
    if (!guestPhone || guestPhone.length !== 11) {
        showToast('请输入正确的手机号', 'error');
        return;
    }
    
    const hotel = AppState.currentHotel;
    const room = AppState.currentRoomType;
    
    if (!hotel || !room) {
        showToast('订单信息不完整', 'error');
        return;
    }
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const checkInDate = AppState.checkInDate || formatDate(today);
    const checkOutDate = AppState.checkOutDate || formatDate(tomorrow);
    
    try {
        const order = await createOrder({
            hotelId: hotel.id,
            roomTypeId: room.id,
            checkInDate: checkInDate,
            checkOutDate: checkOutDate,
            guestName: guestName,
            guestPhone: guestPhone,
            roomCount: AppState.guestCount || 1
        });
        
        showToast('订单创建成功！');
        
        // 跳转到订单详情
        setTimeout(() => {
            showOrderDetailPage(order.id);
        }, 1000);
        
    } catch (error) {
        console.error('创建订单失败:', error);
        showToast('下单失败，请稍后重试', 'error');
    }
}

function showCancelOrderModal() {
    const modal = document.getElementById('cancel-order-modal');
    if (modal) {
        modal.classList.add('active');
    }
    // 重置选择
    AppState.selectedCancelReason = null;
    const reasonItems = document.querySelectorAll('.cancel-reason-item');
    reasonItems.forEach(item => {
        item.classList.remove('active');
        const radio = item.querySelector('.reason-radio');
        if (radio) radio.classList.remove('checked');
    });
}

function hideCancelOrderModal() {
    const modal = document.getElementById('cancel-order-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

async function confirmCancelOrder() {
    if (!AppState.selectedCancelReason) {
        showToast('请选择取消原因', 'error');
        return;
    }
    
    if (!AppState.currentOrder) {
        showToast('订单信息不完整', 'error');
        return;
    }
    
    try {
        await cancelOrder(AppState.currentOrder.id, AppState.selectedCancelReason);
        
        hideCancelOrderModal();
        showToast('订单已取消');
        
        // 刷新订单详情
        setTimeout(() => {
            loadOrderDetail(AppState.currentOrder.id);
        }, 500);
        
    } catch (error) {
        console.error('取消订单失败:', error);
        showToast('取消失败，请稍后重试', 'error');
    }
}

// ==================== 辅助函数 ====================

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatDisplayDate(dateStr) {
    const today = new Date();
    const date = new Date(dateStr);
    const todayStr = formatDate(today);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = formatDate(tomorrow);
    
    if (dateStr === todayStr) {
        return '今天';
    } else if (dateStr === tomorrowStr) {
        return '明天';
    } else {
        const weeks = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        return `${date.getMonth() + 1}月${date.getDate()}日 ${weeks[date.getDay()]}`;
    }
}

function formatDateTime(dateObj) {
    if (!dateObj) return '';
    const date = new Date(dateObj);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function calculateNights(checkInDate, checkOutDate) {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const diff = checkOut.getTime() - checkIn.getTime();
    const nights = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return Math.max(1, nights);
}

// ==================== 初始化事件监听扩展 ====================

function initHotelBookingEventListeners() {
    // 返回按钮
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', goBack);
    }
    
    // 酒店卡片点击（绑定到已有酒店卡片）
    const hotelCards = document.querySelectorAll('.hotel-card');
    hotelCards.forEach((card, index) => {
        const hotelIds = ['hotel_001', 'hotel_002', 'hotel_003'];
        card.addEventListener('click', function() {
            showHotelDetailPage(hotelIds[index] || 'hotel_001');
        });
    });
    
    // 立即预订按钮（房型详情页）
    const bookRoomBtn = document.getElementById('bookRoomBtn');
    if (bookRoomBtn) {
        bookRoomBtn.addEventListener('click', showOrderConfirmPage);
    }
    
    // 入住人数增减
    const decreaseBtn = document.getElementById('decreaseCount');
    const increaseBtn = document.getElementById('increaseCount');
    const countEl = document.getElementById('guestCount');
    
    if (decreaseBtn && countEl) {
        decreaseBtn.addEventListener('click', function() {
            let count = parseInt(countEl.textContent) || 1;
            if (count > 1) {
                count--;
                countEl.textContent = count;
                AppState.guestCount = count;
                updateOrderConfirmPrice();
            }
        });
    }
    
    if (increaseBtn && countEl) {
        increaseBtn.addEventListener('click', function() {
            let count = parseInt(countEl.textContent) || 1;
            if (count < 5) {
                count++;
                countEl.textContent = count;
                AppState.guestCount = count;
                updateOrderConfirmPrice();
            }
        });
    }
    
    // 提交订单按钮
    const submitOrderBtn = document.getElementById('submitOrderBtn');
    if (submitOrderBtn) {
        submitOrderBtn.addEventListener('click', submitHotelOrder);
    }
    
    // 取消订单相关
    const cancelOrderBtn = document.getElementById('cancelOrderBtn');
    const closeCancelModal = document.getElementById('closeCancelModal');
    const confirmCancelBtn = document.getElementById('confirmCancelBtn');
    const contactServiceBtn = document.getElementById('contactServiceBtn');
    
    if (cancelOrderBtn) {
        cancelOrderBtn.addEventListener('click', showCancelOrderModal);
    }
    
    if (closeCancelModal) {
        closeCancelModal.addEventListener('click', hideCancelOrderModal);
    }
    
    if (confirmCancelBtn) {
        confirmCancelBtn.addEventListener('click', confirmCancelOrder);
    }
    
    if (contactServiceBtn) {
        contactServiceBtn.addEventListener('click', function() {
            showToast('客服功能开发中');
        });
    }
    
    // 取消原因选择
    const reasonItems = document.querySelectorAll('.cancel-reason-item');
    reasonItems.forEach(item => {
        item.addEventListener('click', function() {
            // 移除其他选中状态
            reasonItems.forEach(i => {
                i.classList.remove('active');
                const radio = i.querySelector('.reason-radio');
                if (radio) radio.classList.remove('checked');
            });
            
            // 设置当前选中
            this.classList.add('active');
            const radio = this.querySelector('.reason-radio');
            if (radio) radio.classList.add('checked');
            
            AppState.selectedCancelReason = this.dataset.reason;
        });
    });
    
    // 点击取消弹窗背景关闭
    const cancelModal = document.getElementById('cancel-order-modal');
    if (cancelModal) {
        cancelModal.addEventListener('click', function(e) {
            if (e.target === this) {
                hideCancelOrderModal();
            }
        });
    }
}

function updateOrderConfirmPrice() {
    const room = AppState.currentRoomType;
    if (!room) return;
    
    const count = AppState.guestCount || 1;
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const checkInDate = AppState.checkInDate || formatDate(today);
    const checkOutDate = AppState.checkOutDate || formatDate(tomorrow);
    const nights = calculateNights(checkInDate, checkOutDate);
    
    const totalPrice = (room.price || 0) * nights * count;
    
    const totalPriceEl = document.getElementById('confirmTotalPrice');
    if (totalPriceEl) totalPriceEl.textContent = totalPrice;
    
    const bottomPriceEl = document.getElementById('confirmBottomPrice');
    if (bottomPriceEl) bottomPriceEl.textContent = totalPrice;
}

// 导出供外部使用
window.AppState = AppState;
window.showPage = showPage;
window.showSubPage = showSubPage;
window.showToast = showToast;
window.showHotelDetailPage = showHotelDetailPage;
window.showRoomDetailPage = showRoomDetailPage;
window.showOrderConfirmPage = showOrderConfirmPage;
window.showOrderDetailPage = showOrderDetailPage;
window.goBack = goBack;
window.submitHotelOrder = submitHotelOrder;
