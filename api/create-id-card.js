const Jimp = require('jimp')
const {faker} = require('@faker-js/faker/locale/en_IN')
const crypto = require('crypto')
const bwipjs = require('bwip-js')
const https = require('https')
const http = require('http')

// Cấu hình đường dẫn cho Vercel
const BG_PATH = './bg2.png'
const FONT_PATH = './temp_fonts/faustina.fnt'

/**
 * Tạo URL avatar người thật từ This Person Does Not Exist
 */
function getRandomAvatarURL() {
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
            await new Promise((resolve) => setTimeout(resolve, 1000))
        }
    }
}

/**
 * Ghép ảnh và tạo ID card
 */
async function generateCard(avatarUrl, name, fatherName, phone, regNumber) {
    try {
        console.log('Bắt đầu tạo ID card...')

        // Tải các tài nguyên
        console.log('Đang tải background:', BG_PATH)
        const background = await Jimp.read(BG_PATH)

        console.log('Đang tải avatar từ URL:', avatarUrl)
        const avatarBuffer = await downloadImage(avatarUrl)
        const avatar = await Jimp.read(avatarBuffer)

        // Đảm bảo ảnh có chất lượng tốt
        avatar.quality(95)

        console.log('Đang tải font:', FONT_PATH)
        const font = await Jimp.loadFont(FONT_PATH)

        console.log('Đang xử lý avatar...')
        // Ghép avatar vào ảnh nền
        avatar.contain(152, 197)
        avatar.quality(90)
        background.composite(avatar, 560, 160)

        console.log('Đang thêm text...')

        // In thông tin lên ảnh
        background.print(font, 200, 160, regNumber)
        background.print(font, 200, 190, name)
        background.print(font, 200, 251, fatherName)
        background.print(font, 200, 282, phone)

        // Tạo barcode
        const barcodeImage = await new Promise((resolve, reject) => {
            bwipjs.toBuffer(
                {
                    bcid: 'code128',
                    text: regNumber,
                    height: 10,
                    includetext: true,
                    textxalign: 'center',
                    textyoffset: 5,
                    monochrome: true,
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
        background.composite(barcodeJimp, 30, 370)

        // Chuyển ảnh thành buffer
        const imageBuffer = await background.getBufferAsync(Jimp.MIME_PNG)
        return imageBuffer
    } catch (error) {
        console.error('Lỗi khi tạo ID card:', error)
        throw error
    }
}

/**
 * Tạo ID card với thông tin ngẫu nhiên
 */
async function createIdCard() {
    try {
        // Lấy avatar từ API
        const avatarUrl = getRandomAvatarURL()
        console.log('Sử dụng avatar từ URL:', avatarUrl)

        const name = faker.person.fullName()
        const fatherName = faker.person.fullName()
        const phone = faker.phone.number()
        const randomDigits = Math.floor(10000 + Math.random() * 90000)
        const regNumber = `BBDITM/BT-CS/2025/${randomDigits}`

        const imageBuffer = await generateCard(
            avatarUrl,
            name,
            fatherName,
            phone,
            regNumber
        )

        return imageBuffer
    } catch (error) {
        console.error('Lỗi trong quá trình createIdCard:', error)
        throw error
    }
}

// Vercel serverless function handler
module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') {
        res.status(200).end()
        return
    }

    if (req.method !== 'GET') {
        return res.status(405).json({
            success: false,
            message: 'Method not allowed',
        })
    }

    try {
        console.log('Nhận request tạo ID card...')

        const imageBuffer = await createIdCard()

        // Trả về ảnh dưới dạng base64
        const base64Image = imageBuffer.toString('base64')
        const dataUrl = `data:image/png;base64,${base64Image}`

        res.status(200).json({
            success: true,
            imageUrl: dataUrl,
            message: 'ID card đã được tạo thành công',
        })
    } catch (error) {
        console.error('Lỗi khi xử lý request:', error)
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi tạo ID card',
            error: error.message,
        })
    }
}
