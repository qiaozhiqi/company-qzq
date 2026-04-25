# 图标资源说明

此目录用于存放 TabBar 和页面使用的图标。

## 图标列表

### TabBar 图标 (81x81px, 建议使用 PNG 格式)

| 图标名称 | 用途 | 状态 |
|---------|------|------|
| taxi.png | 公务打车 - 默认 | 灰色 #999999 |
| taxi-active.png | 公务打车 - 选中 | 主题色 #1890FF |
| hotel.png | 酒店预订 - 默认 | 灰色 #999999 |
| hotel-active.png | 酒店预订 - 选中 | 主题色 #1890FF |
| order.png | 我的订单 - 默认 | 灰色 #999999 |
| order-active.png | 我的订单 - 选中 | 主题色 #1890FF |
| profile.png | 我的 - 默认 | 灰色 #999999 |
| profile-active.png | 我的 - 选中 | 主题色 #1890FF |

### Logo 图标 (建议尺寸: 200x200px)

- logo.png - 应用 Logo，用于登录页和启动页

## 图标规范

1. **尺寸要求**:
   - TabBar 图标: 建议 81x81px (iOS) 或 48x48px (Android)
   - 为了适配不同屏幕，建议提供 2x 和 3x 图

2. **颜色规范**:
   - 默认状态: 灰色 #999999
   - 选中状态: 主题色 #1890FF

3. **格式建议**:
   - 优先使用 PNG 格式（支持透明背景）
   - 可使用 SVG 格式（需要 Uni-app 插件支持）

## 临时方案

在实际图标资源准备好之前，可以使用以下方案:

1. **使用 uView UI 的图标组件**:
   ```vue
   <u-icon name="car" size="40" color="#999999"></u-icon>
   ```

2. **使用字体图标**:
   项目已集成 uView UI，内置了丰富的图标库

3. **使用网络图片**:
   可以临时使用 CDN 上的图标资源

## 图标资源获取建议

1. **阿里巴巴矢量图标库**: https://www.iconfont.cn/
2. **IconPark**: https://iconpark.oceanengine.com/
3. **Remix Icon**: https://remixicon.com/
4. **Heroicons**: https://heroicons.com/
