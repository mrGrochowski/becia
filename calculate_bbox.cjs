const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const svgContent = fs.readFileSync('app/assets/icons/logo.svg', 'utf8');

  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <body style="margin: 0; padding: 0;">
        ${svgContent}
      </body>
    </html>
  `);

  const bbox = await page.evaluate(() => {
    // Get the primary group element that holds the paths and has the transform
    const group = document.querySelector('svg > g');
    // Using getBoundingClientRect() on the SVG gives us the final rendered box of the paths
    // BUT we want the viewBox of the SVG. Wait, getBBox() gives the box in local coordinates.
    // If the SVG is `<svg viewBox="0 0 2480 3360"><g transform="..."></g></svg>`,
    // getBBox() on the SVG element returns the bounding box of all content in user space.

    // Actually, setting the SVG to have no viewBox initially helps calculate its native size
    const svg = document.querySelector('svg');
    svg.removeAttribute('viewBox');
    svg.removeAttribute('width');
    svg.removeAttribute('height');

    // getBBox() gets the exact bounding box of all paths after transforms are applied internally
    const box = svg.getBBox();
    return { x: box.x, y: box.y, width: box.width, height: box.height };
  });

  console.log('BBox:', bbox);

  const newSvg = svgContent.replace(/viewBox="[^"]+"/, `viewBox="${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}"`);
  fs.writeFileSync('app/assets/icons/logo.svg', newSvg, 'utf8');

  console.log('Updated logo.svg');
  await browser.close();
})();
