const express = require('express')
const path = require('path')
const {faker} = require('@faker-js/faker/locale/en_IN')
const Jimp = require('jimp').default
const bwipjs = require('bwip-js')
const https = require('https')

const app = express()
const PORT = 3005

let font, background

async function preloadResources() {
    background = await Jimp.read(path.join(__dirname, 'bg.png'))
    font = await Jimp.loadFont(
        path.join(__dirname, 'temp_fonts', 'faustina.fnt')
    )
}

function downloadImage(url) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, (res) => {
            const chunks = []
            res.on('data', (chunk) => chunks.push(chunk))
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(Buffer.concat(chunks))
                } else {
                    reject(
                        new Error(
                            `Failed to load image. Status: ${res.statusCode}`
                        )
                    )
                }
            })
        })
        req.on('error', reject)
    })
}

async function generateCard({name, fatherName, phone, regNumber}) {
    const [bg, avatarBuf] = await Promise.all([
        background.clone(),
        downloadImage('https://thispersondoesnotexist.com/'),
    ])

    const avatar = await Jimp.read(avatarBuf)
    avatar.contain(152, 197)
    bg.composite(avatar, 560, 160)

    bg.print(font, 200, 160, regNumber)
    bg.print(font, 200, 190, name)
    bg.print(font, 200, 251, fatherName)
    bg.print(font, 200, 282, phone)

    const barcode = await new Promise((resolve, reject) => {
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
            (err, png) => (err ? reject(err) : resolve(png))
        )
    })

    const barcodeImg = await Jimp.read(barcode)
    bg.composite(barcodeImg, 30, 370)

    return await bg.getBufferAsync(Jimp.MIME_PNG)
}

// Test: ảnh cố định
app.get('/test', async (req, res) => {
    try {
        const buffer = await generateCard({
            name: 'Nguyen Van A',
            fatherName: 'Nguyen Van B',
            phone: '0123456789',
            regNumber: 'BBDITM/BT-CS/2025/12345',
        })
        res.set('Content-Type', 'image/png').send(buffer)
    } catch (e) {
        res.status(500).send('Lỗi tạo ID card test')
    }
})

// Tạo ID card ngẫu nhiên + render HTML
app.get('/create', async (req, res) => {
    try {
        const name = faker.person.firstName()
        const lastName = faker.person.lastName()
        const fullName = `${name} ${lastName}`
        const fatherName = faker.person.fullName()
        const phone = faker.phone.number()
        const regNumber = `BBDITM/BT-CS/2025/${Math.floor(
            10000 + Math.random() * 90000
        )}`

        // Random birthday (2005-2007)
        const year = faker.number.int({min: 2005, max: 2007})
        const month = faker.date.month({abbreviated: true}) // e.g. Jan
        const day = faker.number.int({min: 1, max: 28})

        const email = `${name.toLowerCase()}.${lastName.toLowerCase()}@student.edu`

        const buffer = await generateCard({
            name: fullName,
            fatherName,
            phone,
            regNumber,
        })

        const base64Image = buffer.toString('base64')

        const jsScript = `
(async () => {
  const delay = ms => new Promise(r => setTimeout(r, ms));
  const set = async (sel, val) => {
    const el = document.querySelector(sel);
    if (!el) return;
    const setVal = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    setVal.call(el, val);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    el.dispatchEvent(new Event("blur", { bubbles: true }));
    await delay(150);
  };

  const pasteSchool = async (val) => {
    const el = document.querySelector('#sid-college-name');
    if (!el) return;
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, val);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    await delay(2000);
    document.querySelector('#sid-college-name-menu [role="option"]')?.click();
  };

  const selectJanuary = async () => {
    const el = document.querySelector('#sid-birthdate__month');
    if (!el) return;
    el.focus(); el.click();
    await delay(400);
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await delay(400);
    [...document.querySelectorAll('#sid-birthdate__month-menu [role="option"]')]
      .find(o => o.innerText.toLowerCase().startsWith("${month.toLowerCase()}"))?.click();
  };

  await pasteSchool("Babu Banarasi Das National Institute Of Technology And Management");
  await selectJanuary();

  const fields = [
    ['#sid-first-name', '${name}'],
    ['#sid-last-name', '${lastName}'],
    ['#sid-birthdate-day', '${String(day).padStart(2, '0')}'],
    ['#sid-birthdate-year', '${year}'],
    ['#sid-email', '${email}']
  ];

  for (const [sel, val] of fields) await set(sel, val);
  for (const [sel, val] of fields) if (!document.querySelector(sel)?.value) await set(sel, val);

  console.log("✅ Form đã được điền đầy đủ (chưa submit)");
})();`.trim()

        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ID Card Generator</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f5f5;
      min-height: 100vh;
      padding: 20px;
      color: #333;
    }

    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .header {
      background: #4a90e2;
      color: white;
      padding: 30px;
      text-align: center;
    }

    .header h1 {
      font-size: 2rem;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .header p {
      font-size: 1rem;
      opacity: 0.9;
    }

    .content {
      padding: 40px;
      text-align: center;
    }

    .id-card {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      margin-bottom: 30px;
    }

    .buttons {
      display: flex;
      gap: 15px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: #4a90e2;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;
    }

    .btn:hover {
      background: #357abd;
      transform: translateY(-1px);
    }

    .btn:active {
      transform: translateY(0);
    }

    .copy-btn {
      background: #28a745;
    }

    .copy-btn:hover {
      background: #218838;
    }

    @media (max-width: 600px) {
      .content {
        padding: 20px;
      }
      
      .buttons {
        flex-direction: column;
        align-items: center;
      }
      
      .btn {
        width: 100%;
        max-width: 250px;
        justify-content: center;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ ID Card Generated Successfully</h1>
      <p>Your ID card is ready to use</p>
    </div>

    <div class="content">
      <img id="idcard" class="id-card" src="data:image/png;base64,${base64Image}" alt="ID Card">
      
      <div class="buttons">
        <button class="btn" onclick="download()">
          📥 Download
        </button>
        <button class="btn copy-btn" onclick="copy()">
          📋 Copy Script
        </button>
      </div>
    </div>
  </div>

  <script>
    function copy() {
      const script = \`${jsScript}\`;
      navigator.clipboard.writeText(script).then(() => {
        const btn = document.querySelector('.copy-btn');
        const originalText = btn.textContent;
        btn.textContent = '✅ Copied!';
        
        setTimeout(() => {
          btn.textContent = originalText;
        }, 2000);
      });
    }

    function download() {
      const img = document.querySelector('#idcard');
      const a = document.createElement('a');
      a.href = img.src;
      a.download = 'id_card_${regNumber.replace(/\//g, '_')}.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      const btn = document.querySelector('.btn');
      const originalText = btn.textContent;
      btn.textContent = '✅ Downloaded!';
      
      setTimeout(() => {
        btn.textContent = originalText;
      }, 2000);
    }
  </script>
</body>
</html>`

        res.send(html)
    } catch (e) {
        console.error('❌ Lỗi tạo ID card:', e)
        res.status(500).send('Lỗi tạo ID card')
    }
})

preloadResources()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`✅ Server running: http://localhost:${PORT}`)
            console.log(`🧪 Test card:     http://localhost:${PORT}/test`)
            console.log(`🎲 Random card:  http://localhost:${PORT}/create`)
        })
    })
    .catch((err) => {
        console.error('🚫 Lỗi khởi tạo font hoặc background:', err)
    })
