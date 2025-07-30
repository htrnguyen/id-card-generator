const Jimp = require('jimp');
const fs = require('fs').promises;
const path = require('path');
const { faker } = require('@faker-js/faker/locale/en_IN'); // Sử dụng faker với ngôn ngữ Việt Nam
// faker.setLocale('vi'); // Cấu hình faker để tạo tên theo phong cách Việt Nam
const express = require('express');
const crypto = require('crypto');
const bwipjs = require('bwip-js');

const app = express();
app.set('trust proxy', true); // Tin tưởng reverse proxy
const PORT = 3005;

// Cấu hình đường dẫn
const AVATAR_DIR = path.join(__dirname, 'avatar');
const OUTPUT_DIR = path.join(__dirname, 'output');
const BG_PATH = path.join(__dirname, 'bg2.png');
const FONT_PATH = path.join(__dirname, 'temp_fonts', 'faustina.fnt'); // Sử dụng font tùy chỉnh

// Đảm bảo thư mục output tồn tại
fs.mkdir(OUTPUT_DIR, { recursive: true });


/**
 * Xóa các tệp ID card cũ hơn 10 phút trong thư mục output.
 */
async function cleanOldIdCards() {
    const tenMinutesAgo = Date.now() - (2 * 60 * 1000); // 10 phút trước
    try {
        const files = await fs.readdir(OUTPUT_DIR);
        for (const file of files) {
            const filePath = path.join(OUTPUT_DIR, file);
            const stats = await fs.stat(filePath);
            if (stats.isFile() && stats.mtimeMs < tenMinutesAgo) {
                await fs.unlink(filePath);
                console.log(`Đã xóa tệp cũ: ${filePath}`);
            }
        }
    } catch (error) {
        console.error('Lỗi khi xóa tệp ID card cũ:', error);
    }
}

/**
 * Ghép ảnh và tạo ID card
 * @param {string} avatarPath Đường dẫn tới ảnh avatar
 * @param {string} name Tên
 * @param {string} fatherName Tên bố
 * @param {string} phone Số điện thoại
 * @param {string} outputFilename Tên file output
 */
async function generateCard(avatarPath, name, fatherName, phone, regNumber, outputFilename) {
    try {
        // Tải các tài nguyên
        // Tải các tài nguyên tuần tự để dễ debug hơn
        const background = await Jimp.read(BG_PATH);
        const avatar = await Jimp.read(avatarPath);
        const font = await Jimp.loadFont(FONT_PATH); // Sử dụng font tùy chỉnh

        // Ghép avatar vào ảnh nền
        avatar.contain(152, 197); // Thay đổi kích thước avatar để fit vào khung 152x197, giữ nguyên tỷ lệ
        background.composite(avatar, 560, 160); // Vị trí (x: 600, y: 160)

        // In thông tin lên ảnh
        background.print(font, 200, 160, regNumber); // RegNumber
        background.print(font, 200, 190, name); // Tên: (x: 200, y: 50)
        background.print(font, 200, 251, fatherName); // Tên bố: (x: 200, y: 100)
        background.print(font, 200, 282, phone); // SĐT: (x: 200, y: 150)

        // Lưu ảnh
        // Tạo barcode
        const barcodeImage = await new Promise((resolve, reject) => {
            bwipjs.toBuffer({
                bcid: 'code128', // Loại barcode
                text: regNumber, // Dữ liệu barcode
                // scale: 2, // Độ phân giải
                height: 10, // Chiều cao của barcode
                // width: 100, // Chiều rộng của barcode
                includetext: true, // Bao gồm văn bản bên dưới barcode
                textxalign: 'center', // Căn giữa văn bản
                textyoffset: 5, // Dịch chuyển văn bản lên trên một chút
                monochrome: true, // Chỉ sử dụng màu đen và trắng
            }, function (err, png) {
                if (err) {
                    reject(err);
                } else {
                    resolve(png);
                }
            });
        });

        const barcodeJimp = await Jimp.read(barcodeImage);
        background.composite(barcodeJimp, 30, 370); // Vị trí barcode (x, y)

        const outputPath = path.join(OUTPUT_DIR, outputFilename);
        await background.writeAsync(outputPath);
        console.log(`Đã tạo thành công ID card: ${outputPath}`);
        return outputPath;
    } catch (error) {
        console.error('Lỗi khi tạo ID card:', error);
    }
}

/**
 * Tạo ID card với thông tin ngẫu nhiên
 */
async function createIdCard() {
    try {
        await cleanOldIdCards(); // Xóa tệp cũ trước khi tạo mới

        const avatarFiles = await fs.readdir(AVATAR_DIR);
        if (avatarFiles.length === 0) {
            console.error("Thư mục 'avatar' đang trống. Bỏ qua việc tạo card tự động khi khởi động.");
            return;
        }
        const randNum = Math.floor(Math.random() * avatarFiles.length);
        console.log(`Chọn ảnh avatar thứ ${randNum + 1} trong tổng số ${avatarFiles.length} ảnh.`);
        const randomAvatar = avatarFiles[randNum];
        const avatarPath = path.join(AVATAR_DIR, randomAvatar);

        const name = faker.person.fullName();
        const fatherName = faker.person.fullName();
        const phone = faker.phone.number();
        const randomDigits = Math.floor(10000 + Math.random() * 90000); // 5 chữ số ngẫu nhiên
        const regNumber = `BBDITM/BT-CS/2025/${randomDigits}`;
        const randomId = crypto.randomBytes(4).toString('hex');
        const outputFilename = `id_card_${randomId}.png`;

        const outputPath = await generateCard(avatarPath, name, fatherName, phone, regNumber, outputFilename);
        return outputPath; // Trả về đường dẫn của ảnh đã tạo
    } catch (error) {
        console.error('Lỗi trong quá trình createIdCard:', error);
        throw error;
    }
}

/**
 * Hàm test: tạo ID card với dữ liệu cố định
 */
async function testCreateIdCard() {
    try {
        const avatarFiles = await fs.readdir(AVATAR_DIR);
        if (avatarFiles.length === 0) {
            return console.error("Vui lòng thêm ít nhất một ảnh vào thư mục 'avatar' để test.");
        }
        const testAvatarPath = path.join(AVATAR_DIR, avatarFiles[0]); // Lấy ảnh đầu tiên để test
        const outputFilename = 'id_card_test.png';
        const imagePath = await generateCard(
            testAvatarPath,
            'Nguyen Van A',
            'Nguyen Van B',
            '0123456789',
            'BBDITM/BT-CS/2025/12345', // Test regNumber
            outputFilename
        );
        return imagePath; // Trả về đường dẫn để server sử dụng
    } catch (error) {
        console.error('Lỗi khi chạy testCreateIdCard:', error);
    }
}

// Cung cấp các file tĩnh từ thư mục output
app.use('/genidcard', express.static(OUTPUT_DIR));

// Route để test
app.get('/genidcard/test', async (req, res) => {
    await testCreateIdCard();
    // Gửi file test.html, file này sẽ tự động load ảnh id_card_test.png
    res.sendFile(path.join(__dirname, 'views', 'test.html'));
});


// Route để tạo card mới theo yêu cầu
app.get('/genidcard/api/create', async (req, res) => {
    try {
        const imagePath = await createIdCard();
        if (imagePath) {
            const filename = path.basename(imagePath);
            const htmlPath = path.join(__dirname, 'views', 'create_result.html');
            let htmlContent = await fs.readFile(htmlPath, 'utf8');
            htmlContent = htmlContent.replace('{{filename}}', filename);
            res.send(htmlContent);
        } else {
            res.status(500).send('Lỗi: Không thể tạo ID card.');
        }
    } catch (error) {
        res.status(500).send({ message: 'Lỗi khi tạo ID card.', error: error.message });
    }
});

// Route chính
app.get('/genidcard', (req, res) => {
    res.send('Server API đang chạy. Truy cập /genidcard/test để kiểm tra kết quả. Dùng /genidcard/api/create để tạo card mới.');
});

// Khởi động server
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
    console.log(`- Truy cập http://localhost:${PORT}/genidcard/test để kiểm tra kết quả.`);
    console.log(`- Gửi request GET đến http://localhost:${PORT}/genidcard/api/create để tạo một ID card mới.`);
});