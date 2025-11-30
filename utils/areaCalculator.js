// areaCalculator.js
const { multiply } = require('./mathUtils');

function calculateArea(length, width) {
    if (length <= 0 || width <= 0) {
        throw new Error('Length and width must be positive numbers');
    }
    return multiply(length, width);
}
module.exports = { calculateArea };
