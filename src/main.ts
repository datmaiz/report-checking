import members from '../members.json'
import './style.css'

export function createImagePreviewElement(file: Blob) {
	const image = document.createElement('img')
	const div = document.createElement('div')
	const closeButton = document.createElement('button')

	// Div
	div.className = 'image-preview-container'

	// Show image preview
	image.src = URL.createObjectURL(file)
	image.classList.add('image-preview')

	// Close image preview
	closeButton.textContent = 'X'
	closeButton.classList.add('close-button')

	div.appendChild(image)
	div.appendChild(closeButton)

	return { div, image, closeButton }
}

export const prompt = (result: string) => `PHÂN TÍCH REPORT MICROSOFT TEAMS

						NỘI DUNG TEXT ĐÃ CHUYỂN ĐỔI TỪ ẢNH (CÓ THỂ CÓ LỖI OCR):
						${result}

						DANH SÁCH CÁC NHÓM VÀ THÀNH VIÊN CHUẨN:
						${JSON.stringify(members, null, 2)}

						HƯỚNG DẪN PHÂN TÍCH:
						Trong nội dung text trên (có thể có lỗi OCR tiếng Việt) bao gồm:
						1. Thông báo từ bot có format:
							📒** [Tên Group] - Daily Report**
							🗓️ **Date:** [Ngày]
							**[Tên Mentor]: **[Danh sách mentee]**
							
						2. Các bài report của thành viên có format:
							[Tên người report]
							Hi [Tên mentor], Below is my status today:
							[Nội dung report...]

						LƯU Ý QUAN TRỌNG VỀ OCR:
						- Tên tiếng Việt có thể bị lỗi OCR (ví dụ: ô->o, ă->a, đ->d, etc.)
						- Hãy sử dụng fuzzy matching để so khớp tên
						- Ưu tiên khớp từ danh sách Members CHUẨN thay vì tin tưởng hoàn toàn vào OCR text
						- Tìm các pattern tương tự: "Nguyễn" có thể thành "Nguyen", "Đỗ" thành "Do", etc.
						- Nếu không chắc chắn về tên, hãy chọn tên gần nhất từ danh sách Members

						NHIỆM VỤ:
						- Từ text OCR, xác định nhóm nào đang được report
						- Tìm tất cả tên người đã submit report (dùng fuzzy matching với danh sách Members)
						- So sánh với danh sách thành viên CHUẨN để tìm ai chưa report
						- LUÔN SỬ DỤNG tên CHUẨN từ danh sách Members trong kết quả

						CHỈ TRẢ VỀ JSON THEO FORMAT SAU (SỬ DỤNG TÊN CHUẨN TỪ DANH SÁCH MEMBERS) (KHÔNG CÓ THÔNG TIN KHÁC):
						{
							"thread_name": "<tên nhóm CHUẨN từ danh sách Members>",
							"reported_users": ["<tên CHUẨN từ Members của người đã report>"],
							"not_reported_users": ["<tên CHUẨN từ Members của người chưa report>"],
							"total_members": <tổng số thành viên>,
							"reported_count": <số người đã report>,
							"not_reported_count": <số người chưa report>,
							"ocr_confidence": "<high/medium/low - đánh giá độ tin cậy của việc matching>"
						}`
