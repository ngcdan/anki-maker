// Danh sách các prompt mẫu cho việc tự động tạo thẻ Anki
export const samplePrompts = [
  // Tình huống hàng ngày
  "Tôi muốn đi mua sắm ở siêu thị",
  "Tôi cần đặt bàn ở nhà hàng",
  "Tôi muốn hỏi đường đến bưu điện",
  "Tôi cần gọi taxi về nhà",
  "Tôi muốn mua vé xem phim",

  // Công việc và học tập
  "Tôi cần hoàn thành dự án này trước thứ Sáu",
  "Tôi muốn xin nghỉ phép một ngày",
  "Tôi cần gặp sếp để thảo luận về lương",
  "Tôi muốn đăng ký khóa học tiếng Anh",
  "Tôi cần chuẩn bị cho cuộc họp sáng mai",

  // Sức khỏe và thể thao
  "Tôi cần đi khám bác sĩ vì bị đau đầu",
  "Tôi muốn đăng ký tập gym",
  "Tôi cần mua thuốc ở hiệu thuốc",
  "Tôi muốn đi chạy bộ ở công viên",
  "Tôi cần nghỉ ngơi vì cảm thấy mệt",

  // Gia đình và bạn bè
  "Tôi muốn mời bạn đến nhà ăn tối",
  "Tôi cần gọi điện cho bố mẹ",
  "Tôi muốn tổ chức sinh nhật cho con",
  "Tôi cần giúp đỡ hàng xóm chuyển nhà",
  "Tôi muốn đi du lịch cùng gia đình",

  // Du lịch và giải trí
  "Tôi muốn đặt phòng khách sạn ở Đà Nẵng",
  "Tôi cần mua vé máy bay đi Hà Nội",
  "Tôi muốn tìm hiểu về văn hóa địa phương",
  "Tôi cần hỏi về thời gian tour du lịch",
  "Tôi muốn thử món ăn đặc sản của vùng này",

  // Mua sắm và dịch vụ
  "Tôi cần sửa chữa điện thoại bị hỏng",
  "Tôi muốn đổi tiền ở ngân hàng",
  "Tôi cần cắt tóc ở tiệm gần đây",
  "Tôi muốn mua quà sinh nhật cho bạn",
  "Tôi cần gửi thư đến Mỹ",

  // Tình cảm và quan hệ
  "Tôi muốn cảm ơn bạn vì đã giúp đỡ",
  "Tôi cần xin lỗi vì đến muộn",
  "Tôi muốn chúc mừng sinh nhật bạn",
  "Tôi cần an ủi bạn khi buồn",
  "Tôi muốn bày tỏ tình cảm với người yêu",

  // Thời tiết và môi trường
  "Hôm nay trời mưa to quá",
  "Tôi thích thời tiết mát mẻ của mùa thu",
  "Trời nắng nóng làm tôi khó chịu",
  "Tôi muốn đi dạo khi trời đẹp",
  "Tối nay có thể sẽ có bão",

  // Thói quen và sở thích
  "Tôi thường đọc sách trước khi ngủ",
  "Tôi thích nghe nhạc khi làm việc",
  "Tôi có thói quen dậy sớm tập thể dục",
  "Tôi thường xem phim vào cuối tuần",
  "Tôi thích nấu ăn cho gia đình",

  // Công nghệ và internet
  "Tôi cần học cách sử dụng ứng dụng mới",
  "Tôi muốn mua laptop mới cho việc học",
  "Tôi cần sửa wifi bị chậm",
  "Tôi muốn học lập trình",
  "Tôi cần backup dữ liệu quan trọng"
];

/**
 * Lấy một prompt ngẫu nhiên từ danh sách mẫu
 */
export const getRandomPrompt = (): string => {
  const randomIndex = Math.floor(Math.random() * samplePrompts.length);
  return samplePrompts[randomIndex];
};

/**
 * Lấy nhiều prompt ngẫu nhiên không trùng lặp
 */
export const getRandomPrompts = (count: number): string[] => {
  const shuffled = [...samplePrompts].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, samplePrompts.length));
};