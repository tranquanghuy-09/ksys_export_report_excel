# Hướng dẫn API Phân việc đi lấy đồ ăn sáng

## Tổng quan

Component BreakfastSchedulePage quản lý lịch phân việc đi lấy đồ ăn sáng cho 21 tuần (10 tuần trước + tuần hiện tại + 10 tuần sau).

## Cấu trúc dữ liệu

### Interface BreakfastDuty

```typescript
interface BreakfastDuty {
  id: string; // ID duy nhất
  ten: string; // Tên người phụ trách
  avatar: string; // URL avatar
  ngayBatDau: string; // Ngày bắt đầu (YYYY-MM-DD)
  ngayKetThuc: string; // Ngày kết thúc (YYYY-MM-DD)
  tuan: number; // Số tuần
  trangThai: "scheduled" | "completed" | "missed"; // Trạng thái
}
```

### Trạng thái (trangThai)

- `scheduled`: Đã lên lịch
- `completed`: Đã hoàn thành
- `missed`: Đã bỏ lỡ

## API Endpoints cần thiết

### 1. GET /api/breakfast-duties

Lấy danh sách tất cả phân việc

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "duty_1",
      "ten": "Nguyễn Văn An",
      "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=An",
      "ngayBatDau": "2024-11-04",
      "ngayKetThuc": "2024-11-08",
      "tuan": 1,
      "trangThai": "completed"
    }
  ]
}
```

### 2. GET /api/breakfast-duties/:id

Lấy thông tin chi tiết một phân việc

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "duty_1",
    "ten": "Nguyễn Văn An",
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=An",
    "ngayBatDau": "2024-11-04",
    "ngayKetThuc": "2024-11-08",
    "tuan": 1,
    "trangThai": "completed"
  }
}
```

### 3. POST /api/breakfast-duties

Tạo phân việc mới

**Request body:**

```json
{
  "ten": "Nguyễn Văn An",
  "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=An",
  "ngayBatDau": "2024-11-04",
  "ngayKetThuc": "2024-11-08",
  "tuan": 1,
  "trangThai": "scheduled"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "duty_22",
    "ten": "Nguyễn Văn An",
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=An",
    "ngayBatDau": "2024-11-04",
    "ngayKetThuc": "2024-11-08",
    "tuan": 1,
    "trangThai": "scheduled"
  },
  "message": "Tạo phân việc thành công"
}
```

### 4. PUT /api/breakfast-duties/:id

Cập nhật phân việc

**Request body:**

```json
{
  "ten": "Nguyễn Văn An",
  "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=An",
  "ngayBatDau": "2024-11-04",
  "ngayKetThuc": "2024-11-08",
  "tuan": 1,
  "trangThai": "completed"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "duty_1",
    "ten": "Nguyễn Văn An",
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=An",
    "ngayBatDau": "2024-11-04",
    "ngayKetThuc": "2024-11-08",
    "tuan": 1,
    "trangThai": "completed"
  },
  "message": "Cập nhật phân việc thành công"
}
```

### 5. DELETE /api/breakfast-duties/:id

Xóa phân việc

**Response:**

```json
{
  "success": true,
  "message": "Xóa phân việc thành công"
}
```

### 6. GET /api/breakfast-duties/week/:weekNumber

Lấy phân việc theo tuần

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "duty_1",
    "ten": "Nguyễn Văn An",
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=An",
    "ngayBatDau": "2024-11-04",
    "ngayKetThuc": "2024-11-08",
    "tuan": 1,
    "trangThai": "completed"
  }
}
```

### 7. GET /api/breakfast-duties/status/:status

Lấy phân việc theo trạng thái

**Params:** status = 'scheduled' | 'completed' | 'missed'

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "duty_1",
      "ten": "Nguyễn Văn An",
      "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=An",
      "ngayBatDau": "2024-11-04",
      "ngayKetThuc": "2024-11-08",
      "tuan": 1,
      "trangThai": "completed"
    }
  ]
}
```

## Tính năng của component

### 1. Hiển thị danh sách

- Bảng hiển thị danh sách phân việc với đầy đủ thông tin
- Phân trang, sắp xếp, lọc theo trạng thái
- Hiển thị avatar và thông tin người phụ trách
- Định dạng ngày tháng tiếng Việt

### 2. Thêm/Sửa phân việc

- Modal form để thêm mới/chỉnh sửa
- Validation đầy đủ
- DatePicker cho chọn ngày
- Select cho trạng thái

### 3. Xuất dữ liệu

- Nút "Xuất JSON" để download dữ liệu
- Format JSON chuẩn để import/export

### 4. Responsive & Theme

- Hỗ trợ dark/light theme
- Responsive trên mobile/desktop
- Animation smooth với Framer Motion

## Ghi chú triển khai

1. **Validation**: Component đã có validation frontend, cần thêm validation backend
2. **Authentication**: Cần thêm middleware xác thực cho các API
3. **Permission**: Có thể thêm phân quyền (admin có thể sửa, user chỉ xem)
4. **Notification**: Tích hợp email/SMS thông báo khi đến lượt
5. **History**: Lưu lịch sử thay đổi phân việc
6. **Auto-schedule**: Tự động tạo lịch cho các tuần tiếp theo

## Database Schema (SQL)

```sql
CREATE TABLE breakfast_duties (
  id VARCHAR(50) PRIMARY KEY,
  ten VARCHAR(100) NOT NULL,
  avatar TEXT,
  ngay_bat_dau DATE NOT NULL,
  ngay_ket_thuc DATE NOT NULL,
  tuan INTEGER NOT NULL,
  trang_thai ENUM('scheduled', 'completed', 'missed') DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Index để tối ưu query
CREATE INDEX idx_tuan ON breakfast_duties(tuan);
CREATE INDEX idx_trang_thai ON breakfast_duties(trang_thai);
CREATE INDEX idx_ngay_bat_dau ON breakfast_duties(ngay_bat_dau);
```
