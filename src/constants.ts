export const API_KEY = import.meta.env.VITE_API_KEY

export const prompt = (result: string, members: unknown) =>
	`PHÂN TÍCH REPORT MICROSOFT TEAMS
  Bạn là một CHUYÊN GIA phân tích report.
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
    [Tên thread]
    I.Finished
    [Nội dung đã finished]
    II.IN-PROGRESS
    [Estimate plan]
    [Repo]
    III.ISSUES:
    [Danh sách các issues hoặc]
    IV.NEXT PLAN:
    [Nội dung next plan] (buộc có)
  NHIỆM VỤ:
  - Tìm tất cả tên người đã submit report (dùng fuzzy matching với danh sách Members)
  - So sánh với danh sách thành viên CHUẨN để tìm ai chưa report
  - LUÔN SỬ DỤNG tên CHUẨN từ danh sách Members trong kết quả
  - Report PHẢI theo format đã đưa, nếu sai thì cảnh báo
  - Các tiêu đề như "Finshed", "IN-PROGRESS",... có thể khác đối với mỗi report nhưng nhìn chung vẫn đúng về nghĩa, không bắt buộc match 100% (FINISHED, In Progress, ...)
  - Trong phần II CHỈ QUAN TÂM là cần có 1 trong 2 cái là estimation plan và repo.NẾU KHÔNG thì cảnh báo, KHÔNG QUAN TÂM các nội dung khác trong phần II cho dù là 'None' hay bất cứ cái gì
  - Trong phần II phụ thụôc vào cách viết mỗi người, có thể là "estimate", "estimate plan", "estimation", "repository"... miễn đúng ý nghĩa thì vẫn được xem là hợp lệ. Warning message trong trường hợp này là: "missing estimation plan or repository link"
  - Một người có thể có NHIỀU reports, chỉ cần 1 TRONG NHỮNG reports của người đó đạt yêu cầu thì không cần warning
  - Tất cả các warnings sẽ trả về JSON bên dưới
  CHỈ TRẢ VỀ JSON THEO FORMAT SAU (SỬ DỤNG TÊN CHUẨN TỪ DANH SÁCH MEMBERS) (KHÔNG CÓ THÔNG TIN KHÁC):
  {
    "thread_name": "<tên nhóm CHUẨN từ danh sách Members>",
    "reported_users": ["<tên CHUẨN từ Members của người đã report>"],
    "not_reported_users": ["<tên CHUẨN từ Members của người chưa report>"],
    "total_members": <tổng số thành viên>,
    "reported_count": <số người đã report>,
    "not_reported_count": <số người chưa report>,
    "warnings": [{
      "member": <tên của member bị warning>
      "warning_message": <message của warning)>
      "reason" <reason of warning>
    }, ...]
  }`

export const promptForChunking = (data: string) =>
	`
    TÁCH NHỎ CÁC REPORT MICROSOFT TEAM
    Một report sẽ có format như sau:
    [Tên người report]
    Hi [Tên mentor], Below is my status today:
    [Tên thread]
    I.Finished
    [Nội dung]
    II.IN-PROGRESS
    [Nội dung]
    III.ISSUES:
    [Nội dung]
    IV.NEXT PLAN:
    [Nội dung]

    Đây là các reports: ${data}
    Hãy tách thành các report 
`
