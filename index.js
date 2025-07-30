const Jimp = require('jimp')
const fs = require('fs').promises
const path = require('path')
const {faker} = require('@faker-js/faker/locale/en_IN') // Sử dụng faker với ngôn ngữ Việt Nam
// faker.setLocale('vi'); // Cấu hình faker để tạo tên theo phong cách Việt Nam
const express = require('express')
const crypto = require('crypto')
const bwipjs = require('bwip-js')
const https = require('https')
const http = require('http')

const app = express()
app.set('trust proxy', true) // Tin tưởng reverse proxy
const PORT = 3005

// Cấu hình đường dẫn
const OUTPUT_DIR = path.join(__dirname, 'output')
const BG_PATH = path.join(__dirname, 'bg2.png')
const FONT_PATH = path.join(__dirname, 'temp_fonts', 'faustina.fnt') // Sử dụng font tùy chỉnh

// Đảm bảo thư mục output tồn tại
fs.mkdir(OUTPUT_DIR, {recursive: true})

/**
 * Tạo URL avatar người thật từ This Person Does Not Exist
 */
function getRandomAvatarURL() {
    // Sử dụng This Person Does Not Exist API để lấy ảnh người thật được tạo bởi AI
    // Mỗi lần truy cập sẽ cho một ảnh khác nhau
    return 'https://thispersondoesnotexist.com/'
}

/**
 * Tải ảnh từ URL và trả về buffer với retry mechanism
 */
async function downloadImage(url, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await new Promise((resolve, reject) => {
                const protocol = url.startsWith('https:') ? https : http

                const request = protocol.get(url, (response) => {
                    if (response.statusCode !== 200) {
                        reject(
                            new Error(
                                `HTTP ${response.statusCode}: ${response.statusMessage}`
                            )
                        )
                        return
                    }

                    const chunks = []
                    response.on('data', (chunk) => {
                        chunks.push(chunk)
                    })

                    response.on('end', () => {
                        const buffer = Buffer.concat(chunks)
                        resolve(buffer)
                    })
                })

                request.on('error', (error) => {
                    reject(error)
                })

                request.setTimeout(15000, () => {
                    request.destroy()
                    reject(new Error('Request timeout'))
                })
            })
        } catch (error) {
            console.log(
                `Lần thử ${attempt}/${retries} thất bại cho URL: ${url}`
            )
            if (attempt === retries) {
                throw error
            }
            // Chờ 1 giây trước khi thử lại
            await new Promise((resolve) => setTimeout(resolve, 1000))
        }
    }
}

/**
 * Xóa các tệp ID card cũ hơn 10 phút trong thư mục output.
 */
async function cleanOldIdCards() {
    const tenMinutesAgo = Date.now() - 2 * 60 * 1000 // 10 phút trước
    try {
        const files = await fs.readdir(OUTPUT_DIR)
        for (const file of files) {
            const filePath = path.join(OUTPUT_DIR, file)
            const stats = await fs.stat(filePath)
            if (stats.isFile() && stats.mtimeMs < tenMinutesAgo) {
                await fs.unlink(filePath)
                console.log(`Đã xóa tệp cũ: ${filePath}`)
            }
        }
    } catch (error) {
        console.error('Lỗi khi xóa tệp ID card cũ:', error)
    }
}

/**
 * Ghép ảnh và tạo ID card
 * @param {string} avatarUrl URL của ảnh avatar
 * @param {string} name Tên
 * @param {string} fatherName Tên bố
 * @param {string} phone Số điện thoại
 * @param {string} regNumber Mã đăng ký
 * @param {string} outputFilename Tên file output
 */
async function generateCard(
    avatarUrl,
    name,
    fatherName,
    phone,
    regNumber,
    outputFilename
) {
    try {
        console.log('Bắt đầu tạo ID card...')
        // Tải các tài nguyên
        // Tải các tài nguyên tuần tự để dễ debug hơn
        console.log('Đang tải background:', BG_PATH)
        const background = await Jimp.read(BG_PATH)
        console.log('Đang tải avatar từ URL:', avatarUrl)
        const avatarBuffer = await downloadImage(avatarUrl)
        const avatar = await Jimp.read(avatarBuffer)

        // Đảm bảo ảnh có chất lượng tốt
        avatar.quality(95)

        console.log('Đang tải font:', FONT_PATH)
        const font = await Jimp.loadFont(FONT_PATH) // Sử dụng font tùy chỉnh

        console.log('Đang xử lý avatar...')
        // Ghép avatar vào ảnh nền
        avatar.contain(152, 197) // Thay đổi kích thước avatar để fit vào khung 152x197, giữ nguyên tỷ lệ
        avatar.quality(90) // Đảm bảo chất lượng ảnh cao
        background.composite(avatar, 560, 160) // Vị trí (x: 560, y: 160)

        console.log('Đang thêm text...')

        // In thông tin lên ảnh
        background.print(font, 200, 160, regNumber) // RegNumber
        background.print(font, 200, 190, name) // Tên: (x: 200, y: 50)
        background.print(font, 200, 251, fatherName) // Tên bố: (x: 200, y: 100)
        background.print(font, 200, 282, phone) // SĐT: (x: 200, y: 150)

        // Lưu ảnh
        // Tạo barcode
        const barcodeImage = await new Promise((resolve, reject) => {
            bwipjs.toBuffer(
                {
                    bcid: 'code128', // Loại barcode
                    text: regNumber, // Dữ liệu barcode
                    // scale: 2, // Độ phân giải
                    height: 10, // Chiều cao của barcode
                    // width: 100, // Chiều rộng của barcode
                    includetext: true, // Bao gồm văn bản bên dưới barcode
                    textxalign: 'center', // Căn giữa văn bản
                    textyoffset: 5, // Dịch chuyển văn bản lên trên một chút
                    monochrome: true, // Chỉ sử dụng màu đen và trắng
                },
                function (err, png) {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(png)
                    }
                }
            )
        })

        const barcodeJimp = await Jimp.read(barcodeImage)
        background.composite(barcodeJimp, 30, 370) // Vị trí barcode (x, y)

        const outputPath = path.join(OUTPUT_DIR, outputFilename)
        await background.writeAsync(outputPath)
        console.log(`Đã tạo thành công ID card: ${outputPath}`)
        return outputPath
    } catch (error) {
        console.error('Lỗi khi tạo ID card:', error)
    }
}

/**
 * Tạo ID card với thông tin ngẫu nhiên
 */
async function createIdCard() {
    try {
        await cleanOldIdCards() // Xóa tệp cũ trước khi tạo mới

        // Lấy avatar từ API thay vì từ folder
        const avatarUrl = getRandomAvatarURL()
        console.log('Sử dụng avatar từ URL:', avatarUrl)

        const name = faker.person.fullName()
        const fatherName = faker.person.fullName()
        const phone = faker.phone.number()
        const randomDigits = Math.floor(10000 + Math.random() * 90000) // 5 chữ số ngẫu nhiên
        const regNumber = `BBDITM/BT-CS/2025/${randomDigits}`
        const randomId = crypto.randomBytes(4).toString('hex')
        const outputFilename = `id_card_${randomId}.png`

        const outputPath = await generateCard(
            avatarUrl,
            name,
            fatherName,
            phone,
            regNumber,
            outputFilename
        )
        return outputPath // Trả về đường dẫn của ảnh đã tạo
    } catch (error) {
        console.error('Lỗi trong quá trình createIdCard:', error)
        throw error
    }
}

/**
 * Hàm test: tạo ID card với dữ liệu cố định
 */
async function testCreateIdCard() {
    try {
        // Sử dụng avatar từ API thay vì từ folder
        const testAvatarUrl = getRandomAvatarURL()
        console.log('Sử dụng avatar test từ URL:', testAvatarUrl)

        const outputFilename = 'id_card_test.png'
        const imagePath = await generateCard(
            testAvatarUrl,
            'Nguyen Van A',
            'Nguyen Van B',
            '0123456789',
            'BBDITM/BT-CS/2025/12345', // Test regNumber
            outputFilename
        )
        return imagePath // Trả về đường dẫn để server sử dụng
    } catch (error) {
        console.error('Lỗi khi chạy testCreateIdCard:', error)
    }
}

// Cung cấp các file tĩnh từ thư mục output
app.use('/genidcard', express.static(OUTPUT_DIR))

// Route để test
app.get('/genidcard/test', async (req, res) => {
    await testCreateIdCard()
    // Gửi file test.html, file này sẽ tự động load ảnh id_card_test.png
    res.sendFile(path.join(__dirname, 'views', 'test.html'))
})

// Route để tạo card mới theo yêu cầu
app.get('/genidcard/api/create', async (req, res) => {
    try {
        const imagePath = await createIdCard()
        if (imagePath) {
            const filename = path.basename(imagePath)
            const htmlPath = path.join(__dirname, 'views', 'create_result.html')
            let htmlContent = await fs.readFile(htmlPath, 'utf8')
            htmlContent = htmlContent.replace('{{filename}}', filename)
            res.send(htmlContent)
        } else {
            res.status(500).send('Lỗi: Không thể tạo ID card.')
        }
    } catch (error) {
        res.status(500).send({
            message: 'Lỗi khi tạo ID card.',
            error: error.message,
        })
    }
})

// Route chính
app.get('/genidcard', (req, res) => {
    res.send(
        'Server API đang chạy. Truy cập /genidcard/test để kiểm tra kết quả. Dùng /genidcard/api/create để tạo card mới.'
    )
})

// Khởi động server
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`)
    console.log(
        `- Truy cập http://localhost:${PORT}/genidcard/test để kiểm tra kết quả.`
    )
    console.log(
        `- Gửi request GET đến http://localhost:${PORT}/genidcard/api/create để tạo một ID card mới.`
    )
})
