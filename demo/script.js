// 应用状态管理
const AppState = {
    currentPage: 'login',
    currentSubPage: 'taxi-index',
    selectedStartLocation: null,
    selectedEndLocation: null,
    selectedCarType: 'comfort',
    addressSelectType: null
};

// DOM 元素
const loginPage = document.getElementById('login-page');
const mainApp = document.getElementById('main-app');
const navbar = document.getElementById('navbar');
const navbarTitle = document.getElementById('navbarTitle');
const contentArea = document.getElementById('contentArea');
const tabbar = document.getElementById('tabbar');
const addressModal = document.getElementById('address-modal');
const addressModalTitle = document.getElementById('addressModalTitle');
const toast = document.getElementById('toast');
const toastText = document.getElementById('toastText');

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
    AppState.addressSelectType = type;
    addressModalTitle.textContent = type === 'start' ? '选择出发地点' : '选择目的地';
    addressModal.classList.add('active');
}

// 隐藏地址选择弹窗
function hideAddressModal() {
    addressModal.classList.remove('active');
    AppState.addressSelectType = null;
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
    
    setTimeout(() => {
        showPage('main');
        showSubPage('taxi-index');
    }, 500);
}

// 退出登录
function handleLogout() {
    showToast('已退出登录');
    
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
    
    showToast('已切换到' + (type === 'all' ? '全部' : type === 'taxi' ? '打车' : '酒店') + '订单');
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
                showSubPage(page);
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
    
    // 酒店卡片点击
    const hotelCards = document.querySelectorAll('.hotel-card');
    hotelCards.forEach((card, index) => {
        card.addEventListener('click', function() {
            const hotelNames = ['北京希尔顿酒店', '全季酒店(北京三里屯店)', '北京国贸大酒店'];
            showToast('正在查看: ' + hotelNames[index]);
        });
    });
    
    // 订单卡片点击
    const orderCards = document.querySelectorAll('.order-card');
    orderCards.forEach((card, index) => {
        card.addEventListener('click', function(e) {
            // 不阻止操作按钮的点击
            if (e.target.classList.contains('action-btn') || 
                e.target.closest('.action-btn')) {
                return;
            }
            showToast('正在查看订单详情');
        });
    });
    
    // 操作按钮点击
    const actionBtns = document.querySelectorAll('.action-btn');
    actionBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const text = this.textContent.trim();
            
            if (text === '联系客服') {
                showToast('客服功能开发中');
            } else if (text === '取消订单') {
                showToast('订单已取消');
            } else if (text === '查看行程') {
                showToast('正在查看行程');
            }
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
            } else {
                showToast(menuTitles[index] + '功能开发中');
            }
        });
    });
    
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
    
    // 初始化事件监听
    initEventListeners();
    
    // 更新日期显示
    updateDates();
    
    // 显示登录页面
    showPage('login');
});

// 导出供外部使用
window.AppState = AppState;
window.showPage = showPage;
window.showSubPage = showSubPage;
window.showToast = showToast;
