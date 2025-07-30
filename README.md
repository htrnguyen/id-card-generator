# ID Card Generator

A Node.js application that generates realistic student ID cards with random information and provides auto-fill scripts for form automation.

## Features

-   Random ID Generation: Creates ID cards with random student information
-   Realistic Design: Professional-looking ID cards with photos, barcodes, and student details
-   Auto-Fill Script: JavaScript code to automatically fill forms
-   Download: Save generated ID cards as PNG images
-   Responsive: Works on desktop and mobile devices

## Quick Start

### Prerequisites

-   Node.js (v14 or higher)
-   npm or yarn

### Installation

1. **Clone the repository**

    ```bash
    git clone https://github.com/htrnguyen/id-card-generator.git
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

## Usage

1. **Generate ID Card**

    - Visit `http://localhost:3005/create`
    - A random ID card will be generated with fake student information

2. **Download ID Card**

    - Click the "Download" button
    - The ID card will be saved as a PNG file

3. **Copy Auto-Fill Script**
    - Click the "Copy Script" button
    - The JavaScript code will be copied to your clipboard
    - Use this script to auto-fill forms on other websites

## Project Structure

```
id-card-generator/
├── index.js              # Main server file
├── bg.png              # Background template
├── temp_fonts/          # Font files
│   ├── faustina.fnt
│   └── faustina.png
├── package.json          # Dependencies
├── README.md            # This file
└── .gitignore           # Git ignore rules
```

## Dependencies

-   Express.js: Web server framework
-   Jimp: Image processing library
-   @faker-js/faker: Random data generation
-   bwip-js: Barcode generation

## API Endpoints

| Endpoint  | Description                                 | Response                                         |
| --------- | ------------------------------------------- | ------------------------------------------------ |
| `/create` | Generate random ID card with HTML interface | HTML page with ID card and download/copy buttons |
| `/test`   | Generate test ID card with fixed data       | PNG image                                        |

## Disclaimer

This tool is for educational and testing purposes only. Please ensure you have proper authorization before using generated IDs for any official purposes.

## License

This project is licensed under the MIT License.
