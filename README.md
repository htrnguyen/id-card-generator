# 🆔 ID Card Generator

A Node.js application that generates realistic student ID cards with random information and provides auto-fill scripts for form automation.

## ✨ Features

-   **🎲 Random ID Generation**: Creates ID cards with random student information
-   **🖼️ Realistic Design**: Professional-looking ID cards with photos, barcodes, and student details
-   **📋 Auto-Fill Script**: JavaScript code to automatically fill forms
-   **📥 Download**: Save generated ID cards as PNG images
-   **📱 Responsive**: Works on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites

-   Node.js (v14 or higher)
-   npm or yarn

### Installation

1. **Clone the repository**

    ```bash
    git clone https://github.com/yourusername/id-card-generator.git
    cd id-card-generator
    ```

2. **Install dependencies**

    ```bash
    npm install
    ```

3. **Start the server**

    ```bash
    npm start
    ```

4. **Access the application**
    - Main page: http://localhost:3005/create
    - Test card: http://localhost:3005/test

## 📁 Project Structure

```
id-card-generator/
├── index.js              # Main server file
├── bg2.png              # Background template
├── temp_fonts/          # Font files
│   ├── faustina.fnt
│   └── faustina.png
├── package.json          # Dependencies
├── README.md            # This file
└── .gitignore           # Git ignore rules
```

## 🛠️ Dependencies

-   **Express.js**: Web server framework
-   **Jimp**: Image processing library
-   **@faker-js/faker**: Random data generation
-   **bwip-js**: Barcode generation

## 📋 API Endpoints

| Endpoint  | Description                                 | Response                                         |
| --------- | ------------------------------------------- | ------------------------------------------------ |
| `/create` | Generate random ID card with HTML interface | HTML page with ID card and download/copy buttons |
| `/test`   | Generate test ID card with fixed data       | PNG image                                        |

## 🎯 Usage

1. **Generate ID Card**

    - Visit `http://localhost:3005/create`
    - A random ID card will be generated with fake student information

2. **Download ID Card**

    - Click the "📥 Download" button
    - The ID card will be saved as a PNG file

3. **Copy Auto-Fill Script**
    - Click the "📋 Copy Script" button
    - The JavaScript code will be copied to your clipboard
    - Use this script to auto-fill forms on other websites

## 🔧 Configuration

### Customizing ID Card Template

1. Replace `bg2.png` with your own background template
2. Update font files in `temp_fonts/` directory
3. Modify text positioning in `generateCard()` function

### Changing Student Information

Edit the data generation in the `/create` endpoint:

```javascript
const name = faker.person.firstName()
const lastName = faker.person.lastName()
const fullName = `${name} ${lastName}`
const fatherName = faker.person.fullName()
const phone = faker.phone.number()
const regNumber = `BBDITM/BT-CS/2025/${Math.floor(
    10000 + Math.random() * 90000
)}`
```

## 🎨 Customization

### Styling

The HTML interface uses modern CSS with:

-   Responsive design
-   Clean, minimal UI
-   Hover effects and animations
-   Mobile-friendly layout

### Auto-Fill Script

The generated JavaScript script includes:

-   Form field selection
-   Value setting with proper event dispatching
-   Delay handling for dynamic forms
-   Error handling and logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This tool is for educational and testing purposes only. Please ensure you have proper authorization before using generated IDs for any official purposes.

## 🐛 Troubleshooting

### Common Issues

1. **Font loading error**

    - Ensure font files are in the `temp_fonts/` directory
    - Check file permissions

2. **Image generation fails**

    - Verify `bg2.png` exists in the root directory
    - Check internet connection for avatar generation

3. **Port already in use**
    - Change the port in `index.js` (line 8)
    - Kill existing processes using the port

### Debug Mode

Enable debug logging by adding:

```javascript
console.log('Debug info:', {name, fatherName, phone, regNumber})
```

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/id-card-generator/issues) page
2. Create a new issue with detailed information
3. Include error messages and steps to reproduce

---

**Made with ❤️ for educational purposes**
