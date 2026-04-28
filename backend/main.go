package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"math"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
)

// ==================== 模型定义 ====================

type Hotel struct {
	ID          string   `json:"id"`
	Name        string   `json:"name"`
	Image       string   `json:"image"`
	Images      []string `json:"images"`
	Address     string   `json:"address"`
	Latitude    float64  `json:"latitude"`
	Longitude   float64  `json:"longitude"`
	Rating      float64  `json:"rating"`
	ReviewCount int      `json:"reviewCount"`
	Price       float64  `json:"price"`
	Distance    string   `json:"distance"`
	Tags        []string `json:"tags"`
	Facilities  []string `json:"facilities"`
	Description string   `json:"description"`
}

type RoomType struct {
	ID             string   `json:"id"`
	HotelID        string   `json:"hotelId"`
	Name           string   `json:"name"`
	Image          string   `json:"image"`
	Price          float64  `json:"price"`
	OriginalPrice  float64  `json:"originalPrice"`
	Size           string   `json:"size"`
	BedType        string   `json:"bedType"`
	MaxOccupancy   int      `json:"maxOccupancy"`
	Facilities     []string `json:"facilities"`
	Breakfast      string   `json:"breakfast"`
	CancelPolicy   string   `json:"cancelPolicy"`
	AvailableCount int     `json:"availableCount"`
}

type HotelOrder struct {
	ID            string    `json:"id"`
	OrderNo       string    `json:"orderNo"`
	Status        string    `json:"status"`
	HotelID       string    `json:"-"`
	RoomTypeID    string    `json:"-"`
	CheckInDate   string    `json:"checkInDate"`
	CheckOutDate  string    `json:"checkOutDate"`
	Nights        int       `json:"nights"`
	GuestName     string    `json:"guestName"`
	GuestPhone    string    `json:"guestPhone"`
	TotalPrice    float64   `json:"totalPrice"`
	ActualPrice   float64   `json:"actualPrice"`
	CheckInTime   string    `json:"checkInTime,omitempty"`
	CheckOutTime  string    `json:"checkOutTime,omitempty"`
	CancelReason  string    `json:"cancelReason,omitempty"`
	CancelTime    string    `json:"cancelTime,omitempty"`
	CreatedAt     time.Time `json:"createTime"`
}

type Flight struct {
	ID              string   `json:"id"`
	Airline         string   `json:"airline"`
	FlightNo        string   `json:"flightNo"`
	AircraftType    string   `json:"aircraftType"`
	DepartureCity   string   `json:"departureCity"`
	ArrivalCity     string   `json:"arrivalCity"`
	DepartureAirport string  `json:"departureAirport"`
	ArrivalAirport  string   `json:"arrivalAirport"`
	DepartureTime   string   `json:"departureTime"`
	ArrivalTime     string   `json:"arrivalTime"`
	Duration        string   `json:"duration"`
	IsDirect        bool     `json:"isDirect"`
	StopCities      []string `json:"stopCities"`
	Price           float64  `json:"price"`
	OriginalPrice   float64  `json:"originalPrice"`
	AvailableSeats  int      `json:"availableSeats"`
	CabinClass      string   `json:"cabinClass"`
	Meal            string   `json:"meal"`
	BaggagePolicy   string   `json:"baggagePolicy"`
}

type FlightOrder struct {
	ID            string    `json:"id"`
	OrderNo       string    `json:"orderNo"`
	Status        string    `json:"status"`
	FlightID      string    `json:"-"`
	DepartureDate string    `json:"departureDate"`
	PassengerName string    `json:"passengerName"`
	PassengerID   string    `json:"passengerId"`
	PassengerPhone string   `json:"passengerPhone"`
	CabinClass    string    `json:"cabinClass"`
	SeatCount     int       `json:"seatCount"`
	TotalPrice    float64   `json:"totalPrice"`
	ActualPrice   float64   `json:"actualPrice"`
	Insurance     bool      `json:"insurance"`
	CancelReason  string    `json:"cancelReason,omitempty"`
	CancelTime    string    `json:"cancelTime,omitempty"`
	CreatedAt     time.Time `json:"createTime"`
}

type Train struct {
	ID              string   `json:"id"`
	TrainNo         string   `json:"trainNo"`
	TrainType       string   `json:"trainType"`
	DepartureCity   string   `json:"departureCity"`
	ArrivalCity     string   `json:"arrivalCity"`
	DepartureStation string  `json:"departureStation"`
	ArrivalStation  string   `json:"arrivalStation"`
	DepartureTime   string   `json:"departureTime"`
	ArrivalTime     string   `json:"arrivalTime"`
	Duration        string   `json:"duration"`
	IsThrough       bool     `json:"isThrough"`
	PassStations    []string `json:"passStations"`
	Price           float64  `json:"price"`
	SeatType        string   `json:"seatType"`
	AvailableSeats  int      `json:"availableSeats"`
}

type TrainOrder struct {
	ID            string    `json:"id"`
	OrderNo       string    `json:"orderNo"`
	Status        string    `json:"status"`
	TrainID       string    `json:"-"`
	DepartureDate string    `json:"departureDate"`
	PassengerName string    `json:"passengerName"`
	PassengerID   string    `json:"passengerId"`
	PassengerPhone string   `json:"passengerPhone"`
	SeatType      string    `json:"seatType"`
	SeatCount     int       `json:"seatCount"`
	TotalPrice    float64   `json:"totalPrice"`
	ActualPrice   float64   `json:"actualPrice"`
	Insurance     bool      `json:"insurance"`
	CancelReason  string    `json:"cancelReason,omitempty"`
	CancelTime    string    `json:"cancelTime,omitempty"`
	CreatedAt     time.Time `json:"createTime"`
}

type ApiResponse struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data"`
}

type PageResult struct {
	List       interface{} `json:"list"`
	Total      int64       `json:"total"`
	Page       int         `json:"page"`
	PageSize   int         `json:"pageSize"`
	TotalPages int         `json:"totalPages"`
}

// ==================== 数据存储 ====================

var (
	hotels         = make(map[string]*Hotel)
	roomTypes      = make(map[string]*RoomType)
	orders         = make(map[string]*HotelOrder)
	orderList      []*HotelOrder
	flights        = make(map[string]*Flight)
	flightOrders   = make(map[string]*FlightOrder)
	flightOrderList []*FlightOrder
	trains         = make(map[string]*Train)
	trainOrders    = make(map[string]*TrainOrder)
	trainOrderList []*TrainOrder
	mu             sync.RWMutex
)

// ==================== 初始化数据 ====================

func initData() {
	mu.Lock()
	defer mu.Unlock()

	// 酒店数据
	hotelData := []*Hotel{
		{
			ID:          "hotel_001",
			Name:        "北京希尔顿酒店",
			Image:       "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%205-star%20hotel%20exterior%20modern%20architecture%20beijing&image_size=landscape_16_9",
			Images:      []string{"https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%205-star%20hotel%20lobby%20interior%20elegant&image_size=landscape_16_9", "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hotel%20room%20king%20bed%20luxury%20modern%20design&image_size=landscape_16_9"},
			Address:     "北京市朝阳区东三环北路东方路1号",
			Latitude:    39.92,
			Longitude:   116.47,
			Rating:      4.8,
			ReviewCount: 2356,
			Price:       888,
			Distance:    "距您2.5公里",
			Tags:        []string{"五星级", "含早餐", "免费WiFi"},
			Facilities:  []string{"免费WiFi", "停车场", "健身房", "游泳池", "餐厅", "商务中心"},
			Description: "北京希尔顿酒店位于CBD核心区域，毗邻国贸商圈，交通便利，设施完善，是商务出行的理想选择。",
		},
		{
			ID:          "hotel_002",
			Name:        "全季酒店(北京三里屯店)",
			Image:       "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20boutique%20hotel%20exterior%20clean%20minimalist%20design&image_size=landscape_16_9",
			Images:      []string{"https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20hotel%20lobby%20minimalist%20warm%20lighting&image_size=landscape_16_9", "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=comfortable%20hotel%20room%20twin%20beds%20clean%20bright&image_size=landscape_16_9"},
			Address:     "北京市朝阳区工人体育场北路甲6号",
			Latitude:    39.93,
			Longitude:   116.45,
			Rating:      4.6,
			ReviewCount: 1892,
			Price:       458,
			Distance:    "距您1.8公里",
			Tags:        []string{"商务优选", "近地铁", "含早餐"},
			Facilities:  []string{"免费WiFi", "停车场", "餐厅", "商务中心"},
			Description: "全季酒店是华住集团旗下的中高端酒店品牌，以简约舒适的设计风格，为商务旅客提供优质的入住体验。",
		},
		{
			ID:          "hotel_003",
			Name:        "北京国贸大酒店",
			Image:       "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=skyscraper%20luxury%20hotel%20beijing%20skyline%20modern&image_size=landscape_16_9",
			Images:      []string{"https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20hotel%20rooftop%20bar%20city%20view%20night&image_size=landscape_16_9", "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ultra%20luxury%20hotel%20suite%20panoramic%20window&image_size=landscape_16_9"},
			Address:     "北京市朝阳区建国门外大街1号",
			Latitude:    39.90,
			Longitude:   116.46,
			Rating:      4.9,
			ReviewCount: 3567,
			Price:       1588,
			Distance:    "距您0.8公里",
			Tags:        []string{"奢华五星", "CBD核心", "行政酒廊"},
			Facilities:  []string{"免费WiFi", "停车场", "健身房", "游泳池", "多家餐厅", "商务中心", "行政酒廊"},
			Description: "北京国贸大酒店位于中国国际贸易中心，是北京地标性建筑之一，提供无与伦比的奢华体验和城市景观。",
		},
	}

	for _, h := range hotelData {
		hotels[h.ID] = h
	}

	// 房型数据
	roomTypeData := []*RoomType{
		{
			ID:             "room_001",
			HotelID:        "hotel_001",
			Name:           "豪华大床房",
			Image:          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20hotel%20king%20bed%20room%20elegant%20furniture&image_size=landscape_16_9",
			Price:          888,
			OriginalPrice:  1088,
			Size:           "45㎡",
			BedType:        "2.0米大床",
			MaxOccupancy:   2,
			Facilities:     []string{"免费WiFi", "迷你吧", "保险箱", "浴袍拖鞋", "咖啡茶具"},
			Breakfast:      "含双早",
			CancelPolicy:   "入住前1天18:00前可免费取消",
			AvailableCount: 5,
		},
		{
			ID:             "room_002",
			HotelID:        "hotel_001",
			Name:           "行政套房",
			Image:          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=executive%20suite%20hotel%20living%20room%20separate%20bedroom&image_size=landscape_16_9",
			Price:          1688,
			OriginalPrice:  1988,
			Size:           "85㎡",
			BedType:        "2.2米特大床",
			MaxOccupancy:   2,
			Facilities:     []string{"免费WiFi", "迷你吧", "保险箱", "浴袍拖鞋", "咖啡茶具", "独立客厅", "行政酒廊权益"},
			Breakfast:      "含双早",
			CancelPolicy:   "入住前1天18:00前可免费取消",
			AvailableCount: 2,
		},
		{
			ID:             "room_003",
			HotelID:        "hotel_002",
			Name:           "标准双床房",
			Image:          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20hotel%20twin%20beds%20room%20clean%20bright&image_size=landscape_16_9",
			Price:          458,
			OriginalPrice:  558,
			Size:           "28㎡",
			BedType:        "1.2米双床",
			MaxOccupancy:   2,
			Facilities:     []string{"免费WiFi", "电视", "独立卫浴", "热水壶"},
			Breakfast:      "不含早餐",
			CancelPolicy:   "入住当天18:00前可免费取消",
			AvailableCount: 8,
		},
		{
			ID:             "room_004",
			HotelID:        "hotel_002",
			Name:           "商务大床房",
			Image:          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=business%20hotel%20king%20bed%20room%20work%20desk&image_size=landscape_16_9",
			Price:          558,
			OriginalPrice:  658,
			Size:           "32㎡",
			BedType:        "1.8米大床",
			MaxOccupancy:   2,
			Facilities:     []string{"免费WiFi", "电视", "独立卫浴", "热水壶", "办公桌", "商务用品"},
			Breakfast:      "含单早",
			CancelPolicy:   "入住当天18:00前可免费取消",
			AvailableCount: 6,
		},
		{
			ID:             "room_005",
			HotelID:        "hotel_003",
			Name:           "豪华城景房",
			Image:          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20hotel%20room%20panoramic%20city%20view%20beijing&image_size=landscape_16_9",
			Price:          1588,
			OriginalPrice:  1888,
			Size:           "50㎡",
			BedType:        "2.0米大床",
			MaxOccupancy:   2,
			Facilities:     []string{"免费WiFi", "迷你吧", "保险箱", "浴袍拖鞋", "咖啡茶具", "Nespresso咖啡机", "落地窗城景"},
			Breakfast:      "含双早",
			CancelPolicy:   "入住前2天18:00前可免费取消",
			AvailableCount: 3,
		},
		{
			ID:             "room_006",
			HotelID:        "hotel_003",
			Name:           "行政套房",
			Image:          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ultra%20luxury%20executive%20suite%20hotel%20separate%20living%20bedroom&image_size=landscape_16_9",
			Price:          2888,
			OriginalPrice:  3588,
			Size:           "90㎡",
			BedType:        "2.2米特大床",
			MaxOccupancy:   2,
			Facilities:     []string{"免费WiFi", "迷你吧", "保险箱", "浴袍拖鞋", "Nespresso咖啡机", "独立客厅", "行政酒廊权益", "管家服务"},
			Breakfast:      "含双早",
			CancelPolicy:   "入住前2天18:00前可免费取消",
			AvailableCount: 1,
		},
	}

	for _, rt := range roomTypeData {
		roomTypes[rt.ID] = rt
	}

	// 订单数据
	orderData := []*HotelOrder{
		{
			ID:           "hotel_001",
			OrderNo:      "HT202401150001",
			Status:       "confirmed",
			HotelID:      "hotel_001",
			RoomTypeID:   "room_001",
			CheckInDate:  "2024-01-20",
			CheckOutDate: "2024-01-23",
			Nights:       3,
			GuestName:    "张三",
			GuestPhone:   "13800138000",
			TotalPrice:   2664,
			ActualPrice:  2664,
			CreatedAt:    time.Now(),
		},
		{
			ID:           "hotel_002",
			OrderNo:      "HT202401100002",
			Status:       "completed",
			HotelID:      "hotel_002",
			RoomTypeID:   "room_003",
			CheckInDate:  "2024-01-12",
			CheckOutDate: "2024-01-14",
			Nights:       2,
			GuestName:    "张三",
			GuestPhone:   "13800138000",
			TotalPrice:   916,
			ActualPrice:  916,
			CheckInTime:  "2024-01-12 14:30:00",
			CheckOutTime: "2024-01-14 12:00:00",
			CreatedAt:    time.Now(),
		},
	}

	for _, o := range orderData {
		orders[o.ID] = o
		orderList = append(orderList, o)
	}

	// 机票数据
	flightData := []*Flight{
		{
			ID:               "flight_001",
			Airline:          "中国国际航空",
			FlightNo:         "CA1234",
			AircraftType:     "波音737",
			DepartureCity:    "北京",
			ArrivalCity:      "上海",
			DepartureAirport: "北京首都国际机场",
			ArrivalAirport:   "上海浦东国际机场",
			DepartureTime:    "08:30",
			ArrivalTime:      "10:45",
			Duration:         "2小时15分",
			IsDirect:         true,
			StopCities:       []string{},
			Price:            580,
			OriginalPrice:    880,
			AvailableSeats:   25,
			CabinClass:       "经济舱",
			Meal:             "含早餐",
			BaggagePolicy:    "2件23公斤",
		},
		{
			ID:               "flight_002",
			Airline:          "中国东方航空",
			FlightNo:         "MU5678",
			AircraftType:     "空客A320",
			DepartureCity:    "北京",
			ArrivalCity:      "上海",
			DepartureAirport: "北京大兴国际机场",
			ArrivalAirport:   "上海虹桥国际机场",
			DepartureTime:    "12:00",
			ArrivalTime:      "14:15",
			Duration:         "2小时15分",
			IsDirect:         true,
			StopCities:       []string{},
			Price:            480,
			OriginalPrice:    680,
			AvailableSeats:   18,
			CabinClass:       "经济舱",
			Meal:             "含正餐",
			BaggagePolicy:    "1件23公斤",
		},
		{
			ID:               "flight_003",
			Airline:          "中国南方航空",
			FlightNo:         "CZ9012",
			AircraftType:     "波音787",
			DepartureCity:    "北京",
			ArrivalCity:      "广州",
			DepartureAirport: "北京首都国际机场",
			ArrivalAirport:   "广州白云国际机场",
			DepartureTime:    "09:00",
			ArrivalTime:      "12:15",
			Duration:         "3小时15分",
			IsDirect:         true,
			StopCities:       []string{},
			Price:            720,
			OriginalPrice:    1080,
			AvailableSeats:   32,
			CabinClass:       "经济舱",
			Meal:             "含正餐",
			BaggagePolicy:    "2件23公斤",
		},
		{
			ID:               "flight_004",
			Airline:          "海南航空",
			FlightNo:         "HU3456",
			AircraftType:     "空客A330",
			DepartureCity:    "北京",
			ArrivalCity:      "深圳",
			DepartureAirport: "北京首都国际机场",
			ArrivalAirport:   "深圳宝安国际机场",
			DepartureTime:    "14:30",
			ArrivalTime:      "18:00",
			Duration:         "3小时30分",
			IsDirect:         false,
			StopCities:       []string{"厦门"},
			Price:            650,
			OriginalPrice:    980,
			AvailableSeats:   15,
			CabinClass:       "经济舱",
			Meal:             "含正餐",
			BaggagePolicy:    "1件23公斤",
		},
		{
			ID:               "flight_005",
			Airline:          "中国国际航空",
			FlightNo:         "CA8888",
			AircraftType:     "波音747",
			DepartureCity:    "北京",
			ArrivalCity:      "成都",
			DepartureAirport: "北京首都国际机场",
			ArrivalAirport:   "成都天府国际机场",
			DepartureTime:    "16:00",
			ArrivalTime:      "19:30",
			Duration:         "3小时30分",
			IsDirect:         true,
			StopCities:       []string{},
			Price:            580,
			OriginalPrice:    780,
			AvailableSeats:   28,
			CabinClass:       "经济舱",
			Meal:             "含晚餐",
			BaggagePolicy:    "2件23公斤",
		},
	}

	for _, f := range flightData {
		flights[f.ID] = f
	}

	// 火车票数据
	trainData := []*Train{
		{
			ID:              "train_001",
			TrainNo:         "G1",
			TrainType:       "高铁",
			DepartureCity:   "北京",
			ArrivalCity:     "上海",
			DepartureStation: "北京南站",
			ArrivalStation:  "上海虹桥站",
			DepartureTime:   "07:00",
			ArrivalTime:     "11:28",
			Duration:        "4小时28分",
			IsThrough:       true,
			PassStations:    []string{"天津南", "济南西", "徐州东", "南京南"},
			Price:           553,
			SeatType:        "二等座",
			AvailableSeats:  45,
		},
		{
			ID:              "train_002",
			TrainNo:         "G5",
			TrainType:       "高铁",
			DepartureCity:   "北京",
			ArrivalCity:     "上海",
			DepartureStation: "北京南站",
			ArrivalStation:  "上海站",
			DepartureTime:   "10:00",
			ArrivalTime:     "14:38",
			Duration:        "4小时38分",
			IsThrough:       true,
			PassStations:    []string{"德州东", "泰安", "曲阜东", "蚌埠南"},
			Price:           553,
			SeatType:        "二等座",
			AvailableSeats:  38,
		},
		{
			ID:              "train_003",
			TrainNo:         "D701",
			TrainType:       "动车",
			DepartureCity:   "北京",
			ArrivalCity:     "上海",
			DepartureStation: "北京站",
			ArrivalStation:  "上海站",
			DepartureTime:   "19:15",
			ArrivalTime:     "07:38",
			Duration:        "12小时23分",
			IsThrough:       true,
			PassStations:    []string{"天津西", "沧州西", "济南西", "徐州东", "南京南", "苏州"},
			Price:           342,
			SeatType:        "二等座",
			AvailableSeats:  60,
		},
		{
			ID:              "train_004",
			TrainNo:         "G81",
			TrainType:       "高铁",
			DepartureCity:   "北京",
			ArrivalCity:     "广州",
			DepartureStation: "北京西站",
			ArrivalStation:  "广州南站",
			DepartureTime:   "13:00",
			ArrivalTime:     "21:08",
			Duration:        "8小时8分",
			IsThrough:       true,
			PassStations:    []string{"石家庄", "郑州东", "武汉", "长沙南"},
			Price:           862,
			SeatType:        "二等座",
			AvailableSeats:  52,
		},
		{
			ID:              "train_005",
			TrainNo:         "G89",
			TrainType:       "高铁",
			DepartureCity:   "北京",
			ArrivalCity:     "成都",
			DepartureStation: "北京西站",
			ArrivalStation:  "成都东站",
			DepartureTime:   "06:53",
			ArrivalTime:     "14:41",
			Duration:        "7小时48分",
			IsThrough:       true,
			PassStations:    []string{"石家庄", "郑州东", "西安北"},
			Price:           778,
			SeatType:        "二等座",
			AvailableSeats:  48,
		},
	}

	for _, t := range trainData {
		trains[t.ID] = t
	}

	log.Println("Data initialized successfully!")
}

// ==================== 辅助函数 ====================

func jsonResponse(w http.ResponseWriter, code int, message string, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
	w.WriteHeader(http.StatusOK)

	resp := ApiResponse{
		Code:    code,
		Message: message,
		Data:    data,
	}
	json.NewEncoder(w).Encode(resp)
}

func generateOrderID() string {
	return "hotel_" + uuid.New().String()[:8]
}

func generateFlightOrderID() string {
	return "flight_" + uuid.New().String()[:8]
}

func generateTrainOrderID() string {
	return "train_" + uuid.New().String()[:8]
}

func generateOrderNo(prefix string) string {
	return prefix + time.Now().Format("20060102150405") + fmt.Sprintf("%04d", uuid.New().ID()%10000)
}

// ==================== 处理器 ====================

// 获取机票列表
func getFlightList(w http.ResponseWriter, r *http.Request) {
	if r.Method == "OPTIONS" {
		jsonResponse(w, 200, "ok", nil)
		return
	}

	mu.RLock()
	defer mu.RUnlock()

	// 获取查询参数
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	if page <= 0 {
		page = 1
	}
	pageSize, _ := strconv.Atoi(r.URL.Query().Get("pageSize"))
	if pageSize <= 0 {
		pageSize = 10
	}
	departureCity := r.URL.Query().Get("departureCity")
	arrivalCity := r.URL.Query().Get("arrivalCity")
	priceRange := r.URL.Query().Get("priceRange")
	isDirect := r.URL.Query().Get("isDirect")

	// 过滤机票
	var filteredFlights []*Flight
	for _, f := range flights {
		// 出发城市筛选
		if departureCity != "" && departureCity != "全部" && !strings.Contains(f.DepartureCity, departureCity) {
			continue
		}
		// 到达城市筛选
		if arrivalCity != "" && arrivalCity != "全部" && !strings.Contains(f.ArrivalCity, arrivalCity) {
			continue
		}
		// 直飞筛选
		if isDirect == "true" && !f.IsDirect {
			continue
		}
		// 价格区间筛选
		if priceRange != "" && priceRange != "all" {
			switch priceRange {
			case "low":
				if f.Price >= 300 {
					continue
				}
			case "mid":
				if f.Price < 300 || f.Price >= 800 {
					continue
				}
			case "high":
				if f.Price < 800 || f.Price >= 1500 {
					continue
				}
			case "luxury":
				if f.Price < 1500 {
					continue
				}
			}
		}
		filteredFlights = append(filteredFlights, f)
	}

	// 分页
	total := int64(len(filteredFlights))
	totalPages := int(math.Ceil(float64(total) / float64(pageSize)))
	start := (page - 1) * pageSize
	end := start + pageSize
	if end > len(filteredFlights) {
		end = len(filteredFlights)
	}

	var pagedFlights []*Flight
	if start < len(filteredFlights) {
		pagedFlights = filteredFlights[start:end]
	}

	jsonResponse(w, 200, "success", PageResult{
		List:       pagedFlights,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	})
}

// 获取机票详情
func getFlightDetail(w http.ResponseWriter, r *http.Request) {
	if r.Method == "OPTIONS" {
		jsonResponse(w, 200, "ok", nil)
		return
	}

	path := strings.TrimPrefix(r.URL.Path, "/api/flights/")
	flightID := strings.TrimSuffix(path, "/")
	if flightID == "" {
		jsonResponse(w, 400, "机票ID不能为空", nil)
		return
	}

	mu.RLock()
	defer mu.RUnlock()

	flight, exists := flights[flightID]
	if !exists {
		jsonResponse(w, 404, "机票不存在", nil)
		return
	}

	jsonResponse(w, 200, "success", flight)
}

// 创建机票订单
func createFlightOrder(w http.ResponseWriter, r *http.Request) {
	if r.Method == "OPTIONS" {
		jsonResponse(w, 200, "ok", nil)
		return
	}

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		jsonResponse(w, 400, "读取请求体失败", nil)
		return
	}
	defer r.Body.Close()

	var req struct {
		FlightID      string `json:"flightId"`
		DepartureDate string `json:"departureDate"`
		PassengerName string `json:"passengerName"`
		PassengerID   string `json:"passengerId"`
		PassengerPhone string `json:"passengerPhone"`
		CabinClass    string `json:"cabinClass"`
		SeatCount     int    `json:"seatCount"`
		Insurance     bool   `json:"insurance"`
	}

	if err := json.Unmarshal(body, &req); err != nil {
		jsonResponse(w, 400, "参数解析失败: "+err.Error(), nil)
		return
	}

	// 参数验证
	if req.FlightID == "" || req.DepartureDate == "" || req.PassengerName == "" || req.PassengerID == "" || req.PassengerPhone == "" {
		jsonResponse(w, 400, "参数不完整", nil)
		return
	}

	mu.Lock()
	defer mu.Unlock()

	// 检查机票是否存在
	flight, exists := flights[req.FlightID]
	if !exists {
		jsonResponse(w, 400, "机票不存在", nil)
		return
	}

	// 检查座位是否可用
	seatCount := req.SeatCount
	if seatCount <= 0 {
		seatCount = 1
	}
	if flight.AvailableSeats < seatCount {
		jsonResponse(w, 400, "座位不足", nil)
		return
	}

	// 计算总价
	insurancePrice := 0.0
	if req.Insurance {
		insurancePrice = 30.0 * float64(seatCount)
	}
	totalPrice := flight.Price*float64(seatCount) + insurancePrice

	// 创建订单
	order := &FlightOrder{
		ID:            generateFlightOrderID(),
		OrderNo:       generateOrderNo("FL"),
		Status:        "confirmed",
		FlightID:      req.FlightID,
		DepartureDate: req.DepartureDate,
		PassengerName: req.PassengerName,
		PassengerID:   req.PassengerID,
		PassengerPhone: req.PassengerPhone,
		CabinClass:    req.CabinClass,
		SeatCount:     seatCount,
		TotalPrice:    totalPrice,
		ActualPrice:   totalPrice,
		Insurance:     req.Insurance,
		CreatedAt:     time.Now(),
	}

	// 保存订单
	flightOrders[order.ID] = order
	flightOrderList = append([]*FlightOrder{order}, flightOrderList...) // 插入到开头

	// 减少可用座位数
	flight.AvailableSeats -= seatCount

	// 构建完整响应
	type OrderResponse struct {
		*FlightOrder
		Flight *Flight `json:"flight"`
	}

	resp := OrderResponse{
		FlightOrder: order,
		Flight:      flight,
	}

	jsonResponse(w, 200, "订单创建成功", resp)
}

// 获取机票订单列表
func getFlightOrderList(w http.ResponseWriter, r *http.Request) {
	if r.Method == "OPTIONS" {
		jsonResponse(w, 200, "ok", nil)
		return
	}

	mu.RLock()
	defer mu.RUnlock()

	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	if page <= 0 {
		page = 1
	}
	pageSize, _ := strconv.Atoi(r.URL.Query().Get("pageSize"))
	if pageSize <= 0 {
		pageSize = 10
	}
	status := r.URL.Query().Get("status")

	// 过滤订单
	var filteredOrders []*FlightOrder
	for _, o := range flightOrderList {
		if status != "" && status != "all" && o.Status != status {
			continue
		}
		filteredOrders = append(filteredOrders, o)
	}

	// 构建完整的订单响应（包含机票信息）
	type OrderResponse struct {
		*FlightOrder
		Flight *Flight `json:"flight"`
	}

	var orderResponses []OrderResponse
	for _, o := range filteredOrders {
		orderResponses = append(orderResponses, OrderResponse{
			FlightOrder: o,
			Flight:      flights[o.FlightID],
		})
	}

	// 分页
	total := int64(len(orderResponses))
	totalPages := int(math.Ceil(float64(total) / float64(pageSize)))
	start := (page - 1) * pageSize
	end := start + pageSize
	if end > len(orderResponses) {
		end = len(orderResponses)
	}

	var pagedOrders []OrderResponse
	if start < len(orderResponses) {
		pagedOrders = orderResponses[start:end]
	}

	jsonResponse(w, 200, "success", PageResult{
		List:       pagedOrders,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	})
}

// 获取机票订单详情
func getFlightOrderDetail(w http.ResponseWriter, r *http.Request) {
	if r.Method == "OPTIONS" {
		jsonResponse(w, 200, "ok", nil)
		return
	}

	path := strings.TrimPrefix(r.URL.Path, "/api/flight-orders/")
	path = strings.TrimSuffix(path, "/cancel")
	orderID := strings.TrimSuffix(path, "/")
	if orderID == "" {
		jsonResponse(w, 400, "订单ID不能为空", nil)
		return
	}

	mu.RLock()
	defer mu.RUnlock()

	order, exists := flightOrders[orderID]
	if !exists {
		// 尝试按订单号查找
		for _, o := range flightOrders {
			if o.OrderNo == orderID {
				order = o
				exists = true
				break
			}
		}
		if !exists {
			jsonResponse(w, 404, "订单不存在", nil)
			return
		}
	}

	// 构建完整响应
	type OrderResponse struct {
		*FlightOrder
		Flight *Flight `json:"flight"`
	}

	resp := OrderResponse{
		FlightOrder: order,
		Flight:      flights[order.FlightID],
	}

	jsonResponse(w, 200, "success", resp)
}

// 取消机票订单
func cancelFlightOrder(w http.ResponseWriter, r *http.Request) {
	if r.Method == "OPTIONS" {
		jsonResponse(w, 200, "ok", nil)
		return
	}

	path := strings.TrimPrefix(r.URL.Path, "/api/flight-orders/")
	path = strings.TrimSuffix(path, "/cancel")
	orderID := strings.TrimSuffix(path, "/")
	if orderID == "" {
		jsonResponse(w, 400, "订单ID不能为空", nil)
		return
	}

	// 读取取消原因
	var req struct {
		CancelReason string `json:"cancelReason"`
	}
	body, _ := ioutil.ReadAll(r.Body)
	json.Unmarshal(body, &req)
	defer r.Body.Close()

	mu.Lock()
	defer mu.Unlock()

	order, exists := flightOrders[orderID]
	if !exists {
		// 尝试按订单号查找
		for _, o := range flightOrders {
			if o.OrderNo == orderID {
				order = o
				exists = true
				break
			}
		}
		if !exists {
			jsonResponse(w, 404, "订单不存在", nil)
			return
		}
	}

	// 检查订单状态
	if order.Status == "cancelled" {
		jsonResponse(w, 400, "订单已取消", nil)
		return
	}
	if order.Status == "completed" {
		jsonResponse(w, 400, "已完成订单不能取消", nil)
		return
	}

	// 更新订单状态
	order.Status = "cancelled"
	order.CancelReason = req.CancelReason
	order.CancelTime = time.Now().Format("2006-01-02 15:04:05")

	// 恢复可用座位数
	flight := flights[order.FlightID]
	if flight != nil {
		flight.AvailableSeats += order.SeatCount
	}

	// 构建完整响应
	type OrderResponse struct {
		*FlightOrder
		Flight *Flight `json:"flight"`
	}

	resp := OrderResponse{
		FlightOrder: order,
		Flight:      flight,
	}

	jsonResponse(w, 200, "订单取消成功", resp)
}

// 获取火车票列表
func getTrainList(w http.ResponseWriter, r *http.Request) {
	if r.Method == "OPTIONS" {
		jsonResponse(w, 200, "ok", nil)
		return
	}

	mu.RLock()
	defer mu.RUnlock()

	// 获取查询参数
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	if page <= 0 {
		page = 1
	}
	pageSize, _ := strconv.Atoi(r.URL.Query().Get("pageSize"))
	if pageSize <= 0 {
		pageSize = 10
	}
	departureCity := r.URL.Query().Get("departureCity")
	arrivalCity := r.URL.Query().Get("arrivalCity")
	trainType := r.URL.Query().Get("trainType")

	// 过滤火车票
	var filteredTrains []*Train
	for _, t := range trains {
		// 出发城市筛选
		if departureCity != "" && departureCity != "全部" && !strings.Contains(t.DepartureCity, departureCity) {
			continue
		}
		// 到达城市筛选
		if arrivalCity != "" && arrivalCity != "全部" && !strings.Contains(t.ArrivalCity, arrivalCity) {
			continue
		}
		// 车次类型筛选
		if trainType != "" && trainType != "all" && t.TrainType != trainType {
			continue
		}
		filteredTrains = append(filteredTrains, t)
	}

	// 分页
	total := int64(len(filteredTrains))
	totalPages := int(math.Ceil(float64(total) / float64(pageSize)))
	start := (page - 1) * pageSize
	end := start + pageSize
	if end > len(filteredTrains) {
		end = len(filteredTrains)
	}

	var pagedTrains []*Train
	if start < len(filteredTrains) {
		pagedTrains = filteredTrains[start:end]
	}

	jsonResponse(w, 200, "success", PageResult{
		List:       pagedTrains,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	})
}

// 获取火车票详情
func getTrainDetail(w http.ResponseWriter, r *http.Request) {
	if r.Method == "OPTIONS" {
		jsonResponse(w, 200, "ok", nil)
		return
	}

	path := strings.TrimPrefix(r.URL.Path, "/api/trains/")
	trainID := strings.TrimSuffix(path, "/")
	if trainID == "" {
		jsonResponse(w, 400, "火车票ID不能为空", nil)
		return
	}

	mu.RLock()
	defer mu.RUnlock()

	train, exists := trains[trainID]
	if !exists {
		jsonResponse(w, 404, "火车票不存在", nil)
		return
	}

	jsonResponse(w, 200, "success", train)
}

// 创建火车票订单
func createTrainOrder(w http.ResponseWriter, r *http.Request) {
	if r.Method == "OPTIONS" {
		jsonResponse(w, 200, "ok", nil)
		return
	}

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		jsonResponse(w, 400, "读取请求体失败", nil)
		return
	}
	defer r.Body.Close()

	var req struct {
		TrainID       string `json:"trainId"`
		DepartureDate string `json:"departureDate"`
		PassengerName string `json:"passengerName"`
		PassengerID   string `json:"passengerId"`
		PassengerPhone string `json:"passengerPhone"`
		SeatType      string `json:"seatType"`
		SeatCount     int    `json:"seatCount"`
		Insurance     bool   `json:"insurance"`
	}

	if err := json.Unmarshal(body, &req); err != nil {
		jsonResponse(w, 400, "参数解析失败: "+err.Error(), nil)
		return
	}

	// 参数验证
	if req.TrainID == "" || req.DepartureDate == "" || req.PassengerName == "" || req.PassengerID == "" || req.PassengerPhone == "" {
		jsonResponse(w, 400, "参数不完整", nil)
		return
	}

	mu.Lock()
	defer mu.Unlock()

	// 检查火车票是否存在
	train, exists := trains[req.TrainID]
	if !exists {
		jsonResponse(w, 400, "火车票不存在", nil)
		return
	}

	// 检查座位是否可用
	seatCount := req.SeatCount
	if seatCount <= 0 {
		seatCount = 1
	}
	if train.AvailableSeats < seatCount {
		jsonResponse(w, 400, "座位不足", nil)
		return
	}

	// 计算总价
	insurancePrice := 0.0
	if req.Insurance {
		insurancePrice = 20.0 * float64(seatCount)
	}
	totalPrice := train.Price*float64(seatCount) + insurancePrice

	// 创建订单
	order := &TrainOrder{
		ID:            generateTrainOrderID(),
		OrderNo:       generateOrderNo("TR"),
		Status:        "confirmed",
		TrainID:       req.TrainID,
		DepartureDate: req.DepartureDate,
		PassengerName: req.PassengerName,
		PassengerID:   req.PassengerID,
		PassengerPhone: req.PassengerPhone,
		SeatType:      req.SeatType,
		SeatCount:     seatCount,
		TotalPrice:    totalPrice,
		ActualPrice:   totalPrice,
		Insurance:     req.Insurance,
		CreatedAt:     time.Now(),
	}

	// 保存订单
	trainOrders[order.ID] = order
	trainOrderList = append([]*TrainOrder{order}, trainOrderList...) // 插入到开头

	// 减少可用座位数
	train.AvailableSeats -= seatCount

	// 构建完整响应
	type OrderResponse struct {
		*TrainOrder
		Train *Train `json:"train"`
	}

	resp := OrderResponse{
		TrainOrder: order,
		Train:      train,
	}

	jsonResponse(w, 200, "订单创建成功", resp)
}

// 获取火车票订单列表
func getTrainOrderList(w http.ResponseWriter, r *http.Request) {
	if r.Method == "OPTIONS" {
		jsonResponse(w, 200, "ok", nil)
		return
	}

	mu.RLock()
	defer mu.RUnlock()

	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	if page <= 0 {
		page = 1
	}
	pageSize, _ := strconv.Atoi(r.URL.Query().Get("pageSize"))
	if pageSize <= 0 {
		pageSize = 10
	}
	status := r.URL.Query().Get("status")

	// 过滤订单
	var filteredOrders []*TrainOrder
	for _, o := range trainOrderList {
		if status != "" && status != "all" && o.Status != status {
			continue
		}
		filteredOrders = append(filteredOrders, o)
	}

	// 构建完整的订单响应（包含火车票信息）
	type OrderResponse struct {
		*TrainOrder
		Train *Train `json:"train"`
	}

	var orderResponses []OrderResponse
	for _, o := range filteredOrders {
		orderResponses = append(orderResponses, OrderResponse{
			TrainOrder: o,
			Train:      trains[o.TrainID],
		})
	}

	// 分页
	total := int64(len(orderResponses))
	totalPages := int(math.Ceil(float64(total) / float64(pageSize)))
	start := (page - 1) * pageSize
	end := start + pageSize
	if end > len(orderResponses) {
		end = len(orderResponses)
	}

	var pagedOrders []OrderResponse
	if start < len(orderResponses) {
		pagedOrders = orderResponses[start:end]
	}

	jsonResponse(w, 200, "success", PageResult{
		List:       pagedOrders,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	})
}

// 获取火车票订单详情
func getTrainOrderDetail(w http.ResponseWriter, r *http.Request) {
	if r.Method == "OPTIONS" {
		jsonResponse(w, 200, "ok", nil)
		return
	}

	path := strings.TrimPrefix(r.URL.Path, "/api/train-orders/")
	path = strings.TrimSuffix(path, "/cancel")
	orderID := strings.TrimSuffix(path, "/")
	if orderID == "" {
		jsonResponse(w, 400, "订单ID不能为空", nil)
		return
	}

	mu.RLock()
	defer mu.RUnlock()

	order, exists := trainOrders[orderID]
	if !exists {
		// 尝试按订单号查找
		for _, o := range trainOrders {
			if o.OrderNo == orderID {
				order = o
				exists = true
				break
			}
		}
		if !exists {
			jsonResponse(w, 404, "订单不存在", nil)
			return
		}
	}

	// 构建完整响应
	type OrderResponse struct {
		*TrainOrder
		Train *Train `json:"train"`
	}

	resp := OrderResponse{
		TrainOrder: order,
		Train:      trains[order.TrainID],
	}

	jsonResponse(w, 200, "success", resp)
}

// 取消火车票订单
func cancelTrainOrder(w http.ResponseWriter, r *http.Request) {
	if r.Method == "OPTIONS" {
		jsonResponse(w, 200, "ok", nil)
		return
	}

	path := strings.TrimPrefix(r.URL.Path, "/api/train-orders/")
	path = strings.TrimSuffix(path, "/cancel")
	orderID := strings.TrimSuffix(path, "/")
	if orderID == "" {
		jsonResponse(w, 400, "订单ID不能为空", nil)
		return
	}

	// 读取取消原因
	var req struct {
		CancelReason string `json:"cancelReason"`
	}
	body, _ := ioutil.ReadAll(r.Body)
	json.Unmarshal(body, &req)
	defer r.Body.Close()

	mu.Lock()
	defer mu.Unlock()

	order, exists := trainOrders[orderID]
	if !exists {
		// 尝试按订单号查找
		for _, o := range trainOrders {
			if o.OrderNo == orderID {
				order = o
				exists = true
				break
			}
		}
		if !exists {
			jsonResponse(w, 404, "订单不存在", nil)
			return
		}
	}

	// 检查订单状态
	if order.Status == "cancelled" {
		jsonResponse(w, 400, "订单已取消", nil)
		return
	}
	if order.Status == "completed" {
		jsonResponse(w, 400, "已完成订单不能取消", nil)
		return
	}

	// 更新订单状态
	order.Status = "cancelled"
	order.CancelReason = req.CancelReason
	order.CancelTime = time.Now().Format("2006-01-02 15:04:05")

	// 恢复可用座位数
	train := trains[order.TrainID]
	if train != nil {
		train.AvailableSeats += order.SeatCount
	}

	// 构建完整响应
	type OrderResponse struct {
		*TrainOrder
		Train *Train `json:"train"`
	}

	resp := OrderResponse{
		TrainOrder: order,
		Train:      train,
	}

	jsonResponse(w, 200, "订单取消成功", resp)
}

// 获取酒店列表
func getHotelList(w http.ResponseWriter, r *http.Request) {
	if r.Method == "OPTIONS" {
		jsonResponse(w, 200, "ok", nil)
		return
	}

	mu.RLock()
	defer mu.RUnlock()

	// 获取查询参数
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	if page <= 0 {
		page = 1
	}
	pageSize, _ := strconv.Atoi(r.URL.Query().Get("pageSize"))
	if pageSize <= 0 {
		pageSize = 10
	}
	city := r.URL.Query().Get("city")
	priceRange := r.URL.Query().Get("priceRange")
	star := r.URL.Query().Get("star")
	keyword := r.URL.Query().Get("keyword")

	// 过滤酒店
	var filteredHotels []*Hotel
	for _, h := range hotels {
		// 城市筛选
		if city != "" && city != "全部" && !strings.Contains(h.Address, city) {
			continue
		}
		// 关键词搜索
		if keyword != "" {
			if !strings.Contains(h.Name, keyword) && !strings.Contains(h.Address, keyword) && !strings.Contains(h.Description, keyword) {
				continue
			}
		}
		// 价格区间筛选
		if priceRange != "" && priceRange != "all" {
			switch priceRange {
			case "low":
				if h.Price >= 300 {
					continue
				}
			case "mid":
				if h.Price < 300 || h.Price >= 600 {
					continue
				}
			case "high":
				if h.Price < 600 || h.Price >= 1000 {
					continue
				}
			case "luxury":
				if h.Price < 1000 {
					continue
				}
			}
		}
		// 星级筛选（根据标签）
		if star != "" && star != "all" {
			found := false
			for _, tag := range h.Tags {
				switch star {
				case "economy":
					if strings.Contains(tag, "经济型") {
						found = true
					}
				case "three":
					if strings.Contains(tag, "三星") {
						found = true
					}
				case "four":
					if strings.Contains(tag, "四星") {
						found = true
					}
				case "five":
					if strings.Contains(tag, "五星") {
						found = true
					}
				}
			}
			if !found && star != "all" {
				continue
			}
		}
		filteredHotels = append(filteredHotels, h)
	}

	// 分页
	total := int64(len(filteredHotels))
	totalPages := int(math.Ceil(float64(total) / float64(pageSize)))
	start := (page - 1) * pageSize
	end := start + pageSize
	if end > len(filteredHotels) {
		end = len(filteredHotels)
	}

	var pagedHotels []*Hotel
	if start < len(filteredHotels) {
		pagedHotels = filteredHotels[start:end]
	}

	jsonResponse(w, 200, "success", PageResult{
		List:       pagedHotels,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	})
}

// 获取酒店详情
func getHotelDetail(w http.ResponseWriter, r *http.Request) {
	if r.Method == "OPTIONS" {
		jsonResponse(w, 200, "ok", nil)
		return
	}

	// 从 URL 路径中获取 ID
	path := strings.TrimPrefix(r.URL.Path, "/api/hotels/")
	hotelID := strings.TrimSuffix(path, "/")
	if hotelID == "" {
		jsonResponse(w, 400, "酒店ID不能为空", nil)
		return
	}

	mu.RLock()
	defer mu.RUnlock()

	hotel, exists := hotels[hotelID]
	if !exists {
		jsonResponse(w, 404, "酒店不存在", nil)
		return
	}

	// 获取房型
	var hotelRoomTypes []*RoomType
	for _, rt := range roomTypes {
		if rt.HotelID == hotelID {
			hotelRoomTypes = append(hotelRoomTypes, rt)
		}
	}

	// 构建响应
	type HotelDetailResponse struct {
		*Hotel
		RoomTypes []*RoomType `json:"roomTypes"`
	}

	resp := HotelDetailResponse{
		Hotel:     hotel,
		RoomTypes: hotelRoomTypes,
	}

	jsonResponse(w, 200, "success", resp)
}

// 获取房型详情
func getRoomTypeDetail(w http.ResponseWriter, r *http.Request) {
	if r.Method == "OPTIONS" {
		jsonResponse(w, 200, "ok", nil)
		return
	}

	path := strings.TrimPrefix(r.URL.Path, "/api/room-types/")
	roomTypeID := strings.TrimSuffix(path, "/")
	if roomTypeID == "" {
		jsonResponse(w, 400, "房型ID不能为空", nil)
		return
	}

	mu.RLock()
	defer mu.RUnlock()

	roomType, exists := roomTypes[roomTypeID]
	if !exists {
		jsonResponse(w, 404, "房型不存在", nil)
		return
	}

	// 获取关联酒店
	hotel := hotels[roomType.HotelID]

	jsonResponse(w, 200, "success", map[string]interface{}{
		"roomType": roomType,
		"hotel":    hotel,
	})
}

// 获取订单列表
func getOrderList(w http.ResponseWriter, r *http.Request) {
	if r.Method == "OPTIONS" {
		jsonResponse(w, 200, "ok", nil)
		return
	}

	mu.RLock()
	defer mu.RUnlock()

	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	if page <= 0 {
		page = 1
	}
	pageSize, _ := strconv.Atoi(r.URL.Query().Get("pageSize"))
	if pageSize <= 0 {
		pageSize = 10
	}
	status := r.URL.Query().Get("status")

	// 过滤订单
	var filteredOrders []*HotelOrder
	for _, o := range orderList {
		if status != "" && status != "all" && o.Status != status {
			continue
		}
		filteredOrders = append(filteredOrders, o)
	}

	// 构建完整的订单响应（包含酒店和房型信息）
	type OrderResponse struct {
		*HotelOrder
		Hotel    *Hotel    `json:"hotel"`
		RoomType *RoomType `json:"roomType"`
	}

	var orderResponses []OrderResponse
	for _, o := range filteredOrders {
		orderResponses = append(orderResponses, OrderResponse{
			HotelOrder: o,
			Hotel:      hotels[o.HotelID],
			RoomType:   roomTypes[o.RoomTypeID],
		})
	}

	// 分页
	total := int64(len(orderResponses))
	totalPages := int(math.Ceil(float64(total) / float64(pageSize)))
	start := (page - 1) * pageSize
	end := start + pageSize
	if end > len(orderResponses) {
		end = len(orderResponses)
	}

	var pagedOrders []OrderResponse
	if start < len(orderResponses) {
		pagedOrders = orderResponses[start:end]
	}

	jsonResponse(w, 200, "success", PageResult{
		List:       pagedOrders,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	})
}

// 获取订单详情
func getOrderDetail(w http.ResponseWriter, r *http.Request) {
	if r.Method == "OPTIONS" {
		jsonResponse(w, 200, "ok", nil)
		return
	}

	path := strings.TrimPrefix(r.URL.Path, "/api/hotel-orders/")
	path = strings.TrimSuffix(path, "/cancel")
	orderID := strings.TrimSuffix(path, "/")
	if orderID == "" {
		jsonResponse(w, 400, "订单ID不能为空", nil)
		return
	}

	mu.RLock()
	defer mu.RUnlock()

	order, exists := orders[orderID]
	if !exists {
		// 尝试按订单号查找
		for _, o := range orders {
			if o.OrderNo == orderID {
				order = o
				exists = true
				break
			}
		}
		if !exists {
			jsonResponse(w, 404, "订单不存在", nil)
			return
		}
	}

	// 构建完整响应
	type OrderResponse struct {
		*HotelOrder
		Hotel    *Hotel    `json:"hotel"`
		RoomType *RoomType `json:"roomType"`
	}

	resp := OrderResponse{
		HotelOrder: order,
		Hotel:      hotels[order.HotelID],
		RoomType:   roomTypes[order.RoomTypeID],
	}

	jsonResponse(w, 200, "success", resp)
}

// 创建订单
func createOrder(w http.ResponseWriter, r *http.Request) {
	if r.Method == "OPTIONS" {
		jsonResponse(w, 200, "ok", nil)
		return
	}

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		jsonResponse(w, 400, "读取请求体失败", nil)
		return
	}
	defer r.Body.Close()

	var req struct {
		HotelID      string `json:"hotelId"`
		RoomTypeID   string `json:"roomTypeId"`
		CheckInDate  string `json:"checkInDate"`
		CheckOutDate string `json:"checkOutDate"`
		GuestName    string `json:"guestName"`
		GuestPhone   string `json:"guestPhone"`
		RoomCount    int    `json:"roomCount"`
	}

	if err := json.Unmarshal(body, &req); err != nil {
		jsonResponse(w, 400, "参数解析失败: "+err.Error(), nil)
		return
	}

	// 参数验证
	if req.HotelID == "" || req.RoomTypeID == "" || req.CheckInDate == "" || req.CheckOutDate == "" || req.GuestName == "" || req.GuestPhone == "" {
		jsonResponse(w, 400, "参数不完整", nil)
		return
	}

	mu.Lock()
	defer mu.Unlock()

	// 检查酒店是否存在
	hotel, exists := hotels[req.HotelID]
	if !exists {
		jsonResponse(w, 400, "酒店不存在", nil)
		return
	}

	// 检查房型是否存在
	roomType, exists := roomTypes[req.RoomTypeID]
	if !exists || roomType.HotelID != req.HotelID {
		jsonResponse(w, 400, "房型不存在", nil)
		return
	}

	// 检查房型是否可用
	if roomType.AvailableCount <= 0 {
		jsonResponse(w, 400, "该房型暂无可用房间", nil)
		return
	}

	// 计算入住天数
	checkIn, err := time.Parse("2006-01-02", req.CheckInDate)
	if err != nil {
		jsonResponse(w, 400, "入住日期格式错误", nil)
		return
	}
	checkOut, err := time.Parse("2006-01-02", req.CheckOutDate)
	if err != nil {
		jsonResponse(w, 400, "离店日期格式错误", nil)
		return
	}

	nights := int(checkOut.Sub(checkIn).Hours() / 24)
	if nights <= 0 {
		nights = 1
	}

	// 计算总价
	roomCount := req.RoomCount
	if roomCount <= 0 {
		roomCount = 1
	}
	totalPrice := roomType.Price * float64(nights) * float64(roomCount)

	// 创建订单
	order := &HotelOrder{
		ID:            generateOrderID(),
		OrderNo:       generateOrderNo("HT"),
		Status:        "confirmed",
		HotelID:       req.HotelID,
		RoomTypeID:    req.RoomTypeID,
		CheckInDate:   req.CheckInDate,
		CheckOutDate:  req.CheckOutDate,
		Nights:        nights,
		GuestName:     req.GuestName,
		GuestPhone:    req.GuestPhone,
		TotalPrice:    totalPrice,
		ActualPrice:   totalPrice,
		CreatedAt:     time.Now(),
	}

	// 保存订单
	orders[order.ID] = order
	orderList = append([]*HotelOrder{order}, orderList...) // 插入到开头

	// 减少可用房间数
	roomType.AvailableCount--

	// 构建完整响应
	type OrderResponse struct {
		*HotelOrder
		Hotel    *Hotel    `json:"hotel"`
		RoomType *RoomType `json:"roomType"`
	}

	resp := OrderResponse{
		HotelOrder: order,
		Hotel:      hotel,
		RoomType:   roomType,
	}

	jsonResponse(w, 200, "订单创建成功", resp)
}

// 取消订单
func cancelOrder(w http.ResponseWriter, r *http.Request) {
	if r.Method == "OPTIONS" {
		jsonResponse(w, 200, "ok", nil)
		return
	}

	path := strings.TrimPrefix(r.URL.Path, "/api/hotel-orders/")
	path = strings.TrimSuffix(path, "/cancel")
	orderID := strings.TrimSuffix(path, "/")
	if orderID == "" {
		jsonResponse(w, 400, "订单ID不能为空", nil)
		return
	}

	// 读取取消原因
	var req struct {
		CancelReason string `json:"cancelReason"`
	}
	body, _ := ioutil.ReadAll(r.Body)
	json.Unmarshal(body, &req)
	defer r.Body.Close()

	mu.Lock()
	defer mu.Unlock()

	order, exists := orders[orderID]
	if !exists {
		// 尝试按订单号查找
		for _, o := range orders {
			if o.OrderNo == orderID {
				order = o
				exists = true
				break
			}
		}
		if !exists {
			jsonResponse(w, 404, "订单不存在", nil)
			return
		}
	}

	// 检查订单状态
	if order.Status == "cancelled" {
		jsonResponse(w, 400, "订单已取消", nil)
		return
	}
	if order.Status == "completed" {
		jsonResponse(w, 400, "已完成订单不能取消", nil)
		return
	}

	// 更新订单状态
	order.Status = "cancelled"
	order.CancelReason = req.CancelReason
	order.CancelTime = time.Now().Format("2006-01-02 15:04:05")

	// 恢复可用房间数
	roomType := roomTypes[order.RoomTypeID]
	if roomType != nil {
		roomType.AvailableCount++
	}

	// 构建完整响应
	type OrderResponse struct {
		*HotelOrder
		Hotel    *Hotel    `json:"hotel"`
		RoomType *RoomType `json:"roomType"`
	}

	resp := OrderResponse{
		HotelOrder: order,
		Hotel:      hotels[order.HotelID],
		RoomType:   roomType,
	}

	jsonResponse(w, 200, "订单取消成功", resp)
}

// 健康检查
func healthCheck(w http.ResponseWriter, r *http.Request) {
	jsonResponse(w, 200, "ok", nil)
}

// ==================== 主函数 ====================

func main() {
	// 初始化数据
	initData()

	// 创建路由
	mux := http.NewServeMux()

	// 健康检查
	mux.HandleFunc("/api/health", healthCheck)

	// 酒店相关
	mux.HandleFunc("/api/hotels", getHotelList)
	mux.HandleFunc("/api/hotels/", getHotelDetail)

	// 房型相关
	mux.HandleFunc("/api/room-types/", getRoomTypeDetail)

	// 订单相关
	mux.HandleFunc("/api/hotel-orders", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "POST" {
			createOrder(w, r)
		} else {
			getOrderList(w, r)
		}
	})
	mux.HandleFunc("/api/hotel-orders/", func(w http.ResponseWriter, r *http.Request) {
		// 检查是否是取消订单请求
		if strings.HasSuffix(r.URL.Path, "/cancel") {
			cancelOrder(w, r)
		} else {
			getOrderDetail(w, r)
		}
	})

	// 机票相关
	mux.HandleFunc("/api/flights", getFlightList)
	mux.HandleFunc("/api/flights/", getFlightDetail)

	// 机票订单相关
	mux.HandleFunc("/api/flight-orders", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "POST" {
			createFlightOrder(w, r)
		} else {
			getFlightOrderList(w, r)
		}
	})
	mux.HandleFunc("/api/flight-orders/", func(w http.ResponseWriter, r *http.Request) {
		// 检查是否是取消订单请求
		if strings.HasSuffix(r.URL.Path, "/cancel") {
			cancelFlightOrder(w, r)
		} else {
			getFlightOrderDetail(w, r)
		}
	})

	// 火车票相关
	mux.HandleFunc("/api/trains", getTrainList)
	mux.HandleFunc("/api/trains/", getTrainDetail)

	// 火车票订单相关
	mux.HandleFunc("/api/train-orders", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "POST" {
			createTrainOrder(w, r)
		} else {
			getTrainOrderList(w, r)
		}
	})
	mux.HandleFunc("/api/train-orders/", func(w http.ResponseWriter, r *http.Request) {
		// 检查是否是取消订单请求
		if strings.HasSuffix(r.URL.Path, "/cancel") {
			cancelTrainOrder(w, r)
		} else {
			getTrainOrderDetail(w, r)
		}
	})

	log.Println("Server starting on :8080...")
	log.Println("API endpoints:")
	log.Println("  GET  /api/health")
	log.Println("  GET  /api/hotels")
	log.Println("  GET  /api/hotels/{id}")
	log.Println("  GET  /api/room-types/{id}")
	log.Println("  GET  /api/hotel-orders")
	log.Println("  POST /api/hotel-orders")
	log.Println("  GET  /api/hotel-orders/{id}")
	log.Println("  POST /api/hotel-orders/{id}/cancel")
	log.Println("  GET  /api/flights")
	log.Println("  GET  /api/flights/{id}")
	log.Println("  GET  /api/flight-orders")
	log.Println("  POST /api/flight-orders")
	log.Println("  GET  /api/flight-orders/{id}")
	log.Println("  POST /api/flight-orders/{id}/cancel")
	log.Println("  GET  /api/trains")
	log.Println("  GET  /api/trains/{id}")
	log.Println("  GET  /api/train-orders")
	log.Println("  POST /api/train-orders")
	log.Println("  GET  /api/train-orders/{id}")
	log.Println("  POST /api/train-orders/{id}/cancel")

	if err := http.ListenAndServe(":8080", mux); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
