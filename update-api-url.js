#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

/**
 * Script để cập nhật URL API trong file index.html
 * Sử dụng: node update-api-url.js <vercel-url>
 * Ví dụ: node update-api-url.js https://my-project.vercel.app
 */

function updateApiUrl(vercelUrl) {
    const indexPath = path.join(__dirname, 'index.html')

    if (!fs.existsSync(indexPath)) {
        console.error('❌ Không tìm thấy file index.html')
        process.exit(1)
    }

    let content = fs.readFileSync(indexPath, 'utf8')

    // Tạo URL API mới
    const apiUrl = `${vercelUrl}/api/create-id-card`

    // Thay thế URL API cũ
    const oldUrlPattern =
        /https:\/\/your-backend-api\.vercel\.app\/api\/create-id-card/g
    const newContent = content.replace(oldUrlPattern, apiUrl)

    if (content === newContent) {
        console.log(
            '⚠️  URL API không thay đổi hoặc không tìm thấy pattern cần thay thế'
        )
        console.log('📝 Vui lòng cập nhật thủ công trong file index.html:')
        console.log(
            `   Thay thế: https://your-backend-api.vercel.app/api/create-id-card`
        )
        console.log(`   Thành: ${apiUrl}`)
        return
    }

    // Ghi file
    fs.writeFileSync(indexPath, newContent, 'utf8')

    console.log('✅ Đã cập nhật URL API thành công!')
    console.log(`📡 API URL mới: ${apiUrl}`)
    console.log(
        '🚀 Bạn có thể commit và push code lên GitHub để deploy GitHub Pages'
    )
}

// Kiểm tra tham số
const vercelUrl = process.argv[2]

if (!vercelUrl) {
    console.log('📖 Cách sử dụng:')
    console.log('   node update-api-url.js <vercel-url>')
    console.log('')
    console.log('📝 Ví dụ:')
    console.log('   node update-api-url.js https://my-project.vercel.app')
    console.log('')
    console.log('💡 Lưu ý:')
    console.log('   - Đảm bảo đã deploy backend lên Vercel trước')
    console.log('   - URL phải bắt đầu bằng https://')
    process.exit(1)
}

// Kiểm tra format URL
if (!vercelUrl.startsWith('https://')) {
    console.error('❌ URL phải bắt đầu bằng https://')
    process.exit(1)
}

updateApiUrl(vercelUrl)
