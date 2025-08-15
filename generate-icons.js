const fs = require('fs');
const PNG = require('pngjs').PNG;
const path = require('path');

// Create directory if it doesn't exist
const dir = './images';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

// Function to create a simple icon
function createIcon(size) {
    const png = new PNG({
        width: size,
        height: size
    });

    // Fill background with blue
    for (let y = 0; y < png.height; y++) {
        for (let x = 0; x < png.width; x++) {
            const idx = (png.width * y + x) << 2;
            
            // Blue background
            png.data[idx] = 66;     // R
            png.data[idx+1] = 133;  // G
            png.data[idx+2] = 244;  // B
            png.data[idx+3] = 255;  // Alpha
        }
    }

    // Draw a white envelope shape
    const margin = Math.floor(size * 0.15);
    const width = size - 2 * margin;
    const height = Math.floor(size * 0.5);
    const topY = margin;
    const bottomY = topY + height;
    const leftX = margin;
    const rightX = leftX + width;
    const centerX = size / 2;
    const centerY = topY + Math.floor(height * 0.4);

    // Draw envelope triangle
    for (let y = topY; y < centerY; y++) {
        for (let x = leftX; x < rightX; x++) {
            // Triangle from top-left to center to top-right
            const leftLine = topY + (centerY - topY) * (x - leftX) / (centerX - leftX);
            const rightLine = topY + (centerY - topY) * (rightX - x) / (rightX - centerX);
            
            if (y > leftLine && y > rightLine) {
                const idx = (png.width * y + x) << 2;
                png.data[idx] = 255;     // R
                png.data[idx+1] = 255;   // G
                png.data[idx+2] = 255;   // B
                png.data[idx+3] = 255;   // Alpha
            }
        }
    }

    // Draw bottom rectangle
    const rectHeight = Math.floor(size * 0.2);
    for (let y = bottomY - rectHeight; y < bottomY; y++) {
        for (let x = leftX; x < rightX; x++) {
            const idx = (png.width * y + x) << 2;
            png.data[idx] = 255;     // R
            png.data[idx+1] = 255;   // G
            png.data[idx+2] = 255;   // B
            png.data[idx+3] = 255;   // Alpha
        }
    }

    // Save the icon
    png.pack().pipe(fs.createWriteStream(`./images/icon${size}.png`));
}

// Create icons in different sizes
createIcon(16);
createIcon(32);
createIcon(48);
createIcon(128);

console.log('Icons generated successfully!');