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
    
    // 更新当前订单类型过滤状态
    AppState.currentOrderType = type;
    
    // 重新渲染订单列表
    renderOrderList(AppState.orders || []);
    
    const typeNames = {
        'all': '全部',
        'taxi': '打车',
        'hotel': '酒店'
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
    
    // 初始化酒店预订相关事件
    initHotelBookingEventListeners();
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
    orders: []
});

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
    showSubPage('hotel-order-detail');
    
    loadOrderDetail(orderId);
}

function goBack() {
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
    } else if (currentPage === 'hotel-order-detail') {
        // 从订单详情返回订单列表
        showSubPage('orders-index');
        navbarTitle.textContent = '我的订单';
        AppState.currentOrder = null;
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
        const data = await getOrderDetail(orderId);
        AppState.currentOrder = data;
        renderOrderDetail(data);
    } catch (error) {
        console.error('加载订单详情失败:', error);
    }
}

function renderOrderDetail(order) {
    const hotel = order.hotel || {};
    const roomType = order.roomType || {};
    
    // 渲染订单状态
    const statusHeader = document.getElementById('orderStatusHeader');
    const statusText = document.getElementById('orderStatusText');
    const statusDesc = document.getElementById('orderStatusDesc');
    
    const statusMap = {
        'confirmed': { text: '已确认', desc: '订单已确认，请按时入住', color: '#1890FF' },
        'completed': { text: '已完成', desc: '订单已完成，感谢您的使用', color: '#52C41A' },
        'cancelled': { text: '已取消', desc: '订单已取消', color: '#999999' },
        'active': { text: '行程中', desc: '您正在入住中', color: '#FAAD14' }
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
    
    // 渲染酒店图片
    const hotelImageEl = document.getElementById('detailHotelImage');
    if (hotelImageEl && hotel.image) {
        hotelImageEl.style.backgroundImage = `url(${hotel.image})`;
        hotelImageEl.style.backgroundSize = 'cover';
        hotelImageEl.style.backgroundPosition = 'center';
    }
    
    // 渲染酒店名称
    const hotelNameEl = document.getElementById('detailHotelName');
    if (hotelNameEl) hotelNameEl.textContent = hotel.name || '';
    
    // 渲染房型名称
    const roomNameEl = document.getElementById('detailRoomName');
    if (roomNameEl) roomNameEl.textContent = roomType.name || '';
    
    // 渲染日期
    const checkInEl = document.getElementById('detailCheckInDate');
    if (checkInEl) checkInEl.textContent = order.checkInDate || '';
    
    const checkOutEl = document.getElementById('detailCheckOutDate');
    if (checkOutEl) checkOutEl.textContent = order.checkOutDate || '';
    
    const nightsEl = document.getElementById('detailNights');
    if (nightsEl) nightsEl.textContent = order.nights || 0;
    
    // 渲染入住人信息
    const guestNameEl = document.getElementById('detailGuestName');
    if (guestNameEl) guestNameEl.textContent = order.guestName || '';
    
    const guestPhoneEl = document.getElementById('detailGuestPhone');
    if (guestPhoneEl) guestPhoneEl.textContent = order.guestPhone || '';
    
    // 渲染价格
    const roomFeeEl = document.getElementById('detailRoomFee');
    if (roomFeeEl) roomFeeEl.textContent = `¥${order.totalPrice || 0}`;
    
    const totalPriceEl = document.getElementById('detailTotalPrice');
    if (totalPriceEl) totalPriceEl.textContent = order.totalPrice || 0;
    
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
        const data = await getOrders();
        AppState.orders = data.list || [];
        renderOrderList(data.list || []);
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
        // 打车订单：没有 hotel 字段的订单（目前没有数据）
        filteredOrders = filteredOrders.filter(order => !order.hotel);
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
                showOrderDetailPage(orderId);
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
