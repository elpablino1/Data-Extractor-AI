/**
 * Service for exporting charts as high-quality PNG images
 */

export interface ChartExportOptions {
    quality?: 'hd' | '4k' | '8k';
    fileName?: string;
    backgroundColor?: string;
}

const QUALITY_SETTINGS = {
    hd: { width: 1920, height: 1080, scale: 2 },
    '4k': { width: 3840, height: 2160, scale: 4 },
    '8k': { width: 7680, height: 4320, scale: 8 }
};

/**
 * Downloads a chart as a high-quality PNG
 * @param chartCanvas The canvas element of the chart
 * @param options Export options
 */
export const downloadChartAsPNG = (
    chartCanvas: HTMLCanvasElement,
    options: ChartExportOptions = {}
): void => {
    const {
        quality = '4k',
        fileName = `chart-${Date.now()}.png`,
        backgroundColor = '#ffffff'
    } = options;

    const settings = QUALITY_SETTINGS[quality];

    // Create a high-resolution canvas
    const highResCanvas = document.createElement('canvas');
    highResCanvas.width = settings.width;
    highResCanvas.height = settings.height;

    const ctx = highResCanvas.getContext('2d');
    if (!ctx) {
        console.error('Could not get canvas context');
        return;
    }

    // Fill background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, highResCanvas.width, highResCanvas.height);

    // Draw the chart at high resolution
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(
        chartCanvas,
        0,
        0,
        chartCanvas.width,
        chartCanvas.height,
        0,
        0,
        highResCanvas.width,
        highResCanvas.height
    );

    // Convert to blob and download
    highResCanvas.toBlob(
        (blob) => {
            if (!blob) {
                console.error('Failed to create blob');
                return;
            }

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName.endsWith('.png') ? fileName : `${fileName}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            console.log(`✅ Chart exported as ${quality.toUpperCase()} (${settings.width}x${settings.height})`);
        },
        'image/png',
        1.0 // Maximum quality
    );
};

/**
 * Gets the canvas element from a Chart.js chart instance
 * @param chartRef Reference to the chart element or Chart.js instance
 */
export const getChartCanvas = (chartRef: any): HTMLCanvasElement | null => {
    // If it's already a canvas
    if (chartRef instanceof HTMLCanvasElement) {
        return chartRef;
    }

    // If it's a Chart.js instance
    if (chartRef && chartRef.canvas) {
        return chartRef.canvas;
    }

    // If it's a React ref
    if (chartRef && chartRef.current) {
        if (chartRef.current instanceof HTMLCanvasElement) {
            return chartRef.current;
        }
        if (chartRef.current.canvas) {
            return chartRef.current.canvas;
        }
    }

    console.error('Could not extract canvas from chart reference');
    return null;
};

/**
 * Exports all charts in a report as PNG files
 * @param reportElement The report container element
 * @param options Export options
 */
export const exportAllChartsInReport = (
    reportElement: HTMLElement,
    options: ChartExportOptions = {}
): void => {
    const canvases = reportElement.querySelectorAll('canvas');

    canvases.forEach((canvas, index) => {
        const fileName = options.fileName
            ? `${options.fileName}-chart-${index + 1}`
            : `chart-${index + 1}-${Date.now()}`;

        downloadChartAsPNG(canvas, {
            ...options,
            fileName
        });
    });

    console.log(`✅ Exported ${canvases.length} charts`);
};
