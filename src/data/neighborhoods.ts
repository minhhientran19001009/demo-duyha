import type { Neighborhood } from '../types';

export const NEIGHBORHOODS: Neighborhood[] = [
    // --- HIỆN TRẠNG TỔ DÂN PHỐ (16 TDP TRƯỚC SÁP NHẬP) ---
    { id: 1, name: "Chuồng", type: "old", group_code: "chuong", leader_name: null, leader_phone: null, households: 712, people: 2348, area_ha: 34.20 },
    { id: 2, name: "Động Linh", type: "old", group_code: "dong-linh-trang", leader_name: null, leader_phone: null, households: 318, people: 1096, area_ha: 62.90 },
    { id: 3, name: "Trịnh", type: "old", group_code: "dong-linh-trang", leader_name: null, leader_phone: null, households: 298, people: 1038, area_ha: 21.60 },
    { id: 4, name: "Ninh Lão", type: "old", group_code: "duy-minh", leader_name: null, leader_phone: null, households: 357, people: 1249, area_ha: 42.60 },
    { id: 5, name: "Trung", type: "old", group_code: "duy-minh", leader_name: null, leader_phone: null, households: 203, people: 678, area_ha: 20.40 },
    { id: 6, name: "Tú", type: "old", group_code: "ngoc-tu", leader_name: null, leader_phone: null, households: 327, people: 1158, area_ha: 130.50 },
    { id: 7, name: "Ngọc Thị", type: "old", group_code: "ngoc-tu", leader_name: null, leader_phone: null, households: 403, people: 1355, area_ha: 288.10 },
    { id: 8, name: "Đông Hải", type: "old", group_code: "dong-hai", leader_name: null, leader_phone: null, households: 634, people: 2168, area_ha: 164.60 },
    { id: 9, name: "Hương Cát", type: "old", group_code: "huong-cat", leader_name: null, leader_phone: null, households: 561, people: 2046, area_ha: 187.80 },
    { id: 10, name: "Tứ Giáp", type: "old", group_code: "duy-hai", leader_name: null, leader_phone: null, households: 346, people: 1243, area_ha: 82.50 },
    { id: 11, name: "Tam Giáp", type: "old", group_code: "duy-hai", leader_name: null, leader_phone: null, households: 379, people: 1284, area_ha: 84.60 },
    { id: 12, name: "An Nhân", type: "old", group_code: "hoang-dong", leader_name: null, leader_phone: null, households: 201, people: 669, area_ha: 20.30 },
    { id: 13, name: "Hoàng Thượng", type: "old", group_code: "hoang-dong", leader_name: null, leader_phone: null, households: 326, people: 1174, area_ha: 46.80 },
    { id: 14, name: "Hoàng Hạ", type: "old", group_code: "hoang-dong", leader_name: null, leader_phone: null, households: 243, people: 899, area_ha: 72.50 },
    { id: 15, name: "Bạch Xá", type: "old", group_code: "bach-xa", leader_name: null, leader_phone: null, households: 663, people: 2404, area_ha: 131.40 },
    { id: 16, name: "Ngọc Động", type: "old", group_code: "ngoc-dong", leader_name: null, leader_phone: null, households: 796, people: 2806, area_ha: 155.50 },

    // --- DỰ KIẾN PHƯƠNG ÁN SẮP XẾP (10 TỔ DÂN PHỐ SAU SÁP NHẬP) ---
    { id: 17, name: "Chuồng", type: "new", group_code: "chuong", leader_name: "Đại úy Nguyễn Văn Việt", leader_phone: "0972.280.538", households: 712, people: 2348, area_ha: 65.00 },
    { id: 18, name: "Động Linh Trang", type: "new", group_code: "dong-linh-trang", leader_name: "Thiếu úy Vũ Văn Hào", leader_phone: "0796.191.310", households: 616, people: 2134, area_ha: 84.50 },
    { id: 19, name: "Duy Minh", type: "new", group_code: "duy-minh", leader_name: "Đại úy Trần Hữu Tiến", leader_phone: "0986.361.395", households: 560, people: 1927, area_ha: 63.00 },
    { id: 20, name: "Ngọc Tú", type: "new", group_code: "ngoc-tu", leader_name: "Thiếu tá Nguyễn Minh Tiến", leader_phone: "0359.290.686", households: 730, people: 2513, area_ha: 418.60 },
    { id: 21, name: "Đông Hải", type: "new", group_code: "dong-hai", leader_name: "Thiếu tá Nguyễn Văn Tuân", leader_phone: "0866.697.088", households: 634, people: 2168, area_ha: 135.80 },
    { id: 22, name: "Hương Cát", type: "new", group_code: "huong-cat", leader_name: "Thượng úy Đinh Xuân Trường", leader_phone: "0585.288.686", households: 561, people: 2046, area_ha: 187.80 },
    { id: 23, name: "Duy Hải", type: "new", group_code: "duy-hai", leader_name: "Thượng úy Đinh Xuân Trường", leader_phone: "0585.288.686", households: 725, people: 2527, area_ha: 165.10 },
    { id: 24, name: "Hoàng Đồng", type: "new", group_code: "hoang-dong", leader_name: "Thiếu tá Ngô Vinh Quang", leader_phone: "0977.597.118", households: 770, people: 2742, area_ha: 139.60 },
    { id: 25, name: "Bạch Xá", type: "new", group_code: "bach-xa", leader_name: "Đại úy Đoàn Văn Chương", leader_phone: "0911.940.111", households: 663, people: 2404, area_ha: 131.40 },
    { id: 26, name: "Ngọc Động", type: "new", group_code: "ngoc-dong", leader_name: "Đại úy Vũ Ngọc Quang", leader_phone: "0978.530.570", households: 796, people: 2806, area_ha: 155.50 }
];
