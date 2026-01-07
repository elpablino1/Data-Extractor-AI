import React, { useRef } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import type { Plugin } from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import { downloadChartAsPNG, getChartCanvas } from '../../../services/chartExport';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

// Plugin to display values on top of bars/points
// Plugin to display values on top of bars/points
const dataLabelsPlugin: Plugin = {
    id: 'dataLabels',
    afterDatasetsDraw(chart) {
        const { ctx } = chart;
        const datasetCount = chart.data.datasets.length;
        const dataPointCount = chart.data.labels?.length || 0;

        // Only show labels if density is manageable
        // If many datasets, threshold is lower. If single dataset, threshold is higher.
        const threshold = datasetCount > 1 ? 12 : 20;

        if (dataPointCount > threshold) return;

        chart.data.datasets.forEach((dataset, datasetIndex) => {
            const meta = chart.getDatasetMeta(datasetIndex);
            if (!meta.hidden) {
                meta.data.forEach((element: any, index) => {
                    const data = dataset.data[index] as number;
                    if (data === undefined || data === null) return;

                    ctx.fillStyle = '#ffffff';
                    ctx.font = '600 11px Inter'; // Smaller, cleaner font
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'bottom';

                    let value = typeof data === 'number' ? data.toLocaleString() : data;

                    // Abbreviate large numbers
                    if (typeof data === 'number') {
                        if (data >= 1000000) value = (data / 1000000).toFixed(1) + 'M';
                        else if (data >= 1000) value = (data / 1000).toFixed(1) + 'k';
                    }

                    const x = element.x;
                    const y = element.y - 6; // Slightly more offset

                    // Add subtle shadow/outline for readability against any background
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
                    ctx.shadowBlur = 4;
                    ctx.fillText(String(value), x, y);
                    ctx.shadowBlur = 0;
                });
            }
        });
    }
};

ChartJS.register(dataLabelsPlugin);

interface ChartSectionProps {
    type: 'bar' | 'line' | 'doughnut';
    title: string;
    description?: string;
    data: any;
}

export const ChartSection: React.FC<ChartSectionProps> = ({ type, title, description, data }) => {
    const chartRef = useRef<any>(null);

    // Defensive data validation
    React.useEffect(() => {
        console.log('📊 ChartSection mounted:', { type, title, hasData: !!data });
        if (data) {
            console.log('  - Labels:', data.labels);
            console.log('  - Datasets:', data.datasets?.length || 0);
        }
    }, [type, title, data]);

    // Early return with error UI if data is invalid
    if (!data || !data.labels || !data.datasets || data.datasets.length === 0) {
        console.error('❌ ChartSection: Invalid data structure', { data });
        return (
            <div className="my-20 p-8 bg-red-500/10 border border-red-500/20 rounded-3xl">
                <h2 className="text-3xl font-bold text-center mb-4 text-white">{title}</h2>
                <p className="text-center text-red-300">Error: Datos de gráfico inválidos</p>
            </div>
        );
    }

    // Presentation color palette based on storytelling example
    const chartColors = [
        { bg: 'rgba(34, 211, 238, 0.2)', border: '#22d3ee' },     // Cyan
        { bg: 'rgba(217, 70, 239, 0.2)', border: '#d946ef' },     // Pink
        { bg: 'rgba(139, 92, 246, 0.2)', border: '#8b5cf6' },     // Purple
        { bg: 'rgba(249, 115, 22, 0.2)', border: '#f97316' },     // Orange
        { bg: 'rgba(253, 224, 71, 0.2)', border: '#fde047' }      // Yellow
    ];

    // Ensure datasets have colors
    const processedData = {
        ...data,
        datasets: data.datasets?.map((dataset: any, idx: number) => {
            const colors = chartColors[idx % chartColors.length];
            return {
                ...dataset,
                backgroundColor: dataset.backgroundColor || colors.bg,
                borderColor: dataset.borderColor || colors.border,
                borderWidth: dataset.borderWidth || 3,
                pointBackgroundColor: colors.border,
                pointBorderColor: '#1a0033',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                ...(type === 'line' && {
                    tension: dataset.tension || 0.4,
                    fill: dataset.fill !== undefined ? dataset.fill : true
                })
            };
        }) || []
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    color: '#ffffff',
                    padding: 20,
                    font: { family: 'Poppins', size: 12, weight: '600' as any },
                    usePointStyle: true,
                    boxWidth: 8
                },
            },
            tooltip: {
                mode: 'index' as const,
                intersect: false,
                backgroundColor: 'rgba(26, 0, 51, 0.9)',
                titleFont: { family: 'Poppins', size: 14, weight: 'bold' as any },
                bodyFont: { family: 'Poppins', size: 13 },
                padding: 12,
                cornerRadius: 8,
            },
            dataLabels: {
                display: false
            }
        },
        scales: type !== 'doughnut' ? {
            y: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
                ticks: {
                    color: '#9ca3af',
                    font: { family: 'Poppins', size: 11 },
                    padding: 10
                },
                beginAtZero: true,
            },
            x: {
                grid: { display: false },
                ticks: {
                    color: '#9ca3af',
                    font: { family: 'Poppins', size: 11 },
                },
            }
        } : undefined,
    };

    const ChartComponent = type === 'line' ? Line : type === 'doughnut' ? Doughnut : Bar;

    const handleDownload = () => {
        const canvas = getChartCanvas(chartRef);
        if (canvas) {
            const fileName = title.toLowerCase().replace(/\s+/g, '-');
            downloadChartAsPNG(canvas, {
                quality: '4k',
                fileName,
                backgroundColor: '#1a0033'
            });
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="my-20"
        >
            <h2
                className="text-3xl md:text-4xl font-bold text-center mb-6 text-white tracking-tight"
                style={{ fontFamily: "'Poppins', sans-serif" }}
            >
                {title}
            </h2>

            {description && (
                <p className="max-w-4xl mx-auto text-center text-gray-400 text-lg mb-10 leading-relaxed font-light">
                    {description}
                </p>
            )}

            <div className="relative group bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl">
                <button
                    onClick={handleDownload}
                    className="absolute top-6 right-6 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-gray-400 hover:text-white transition-all z-20 group-hover:scale-110"
                    title="Descargar Gráfico"
                >
                    <Download className="w-5 h-5" />
                </button>

                <div className="h-[50vh] min-h-[400px] w-full relative">
                    {(() => {
                        try {
                            return <ChartComponent ref={chartRef} options={options} data={processedData} />;
                        } catch (error) {
                            console.error('❌ Error renderizando gráfico:', error);
                            return (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center">
                                        <p className="text-red-300 mb-2">Error al renderizar el gráfico</p>
                                        <p className="text-gray-400 text-sm">Revisa la consola para más detalles</p>
                                    </div>
                                </div>
                            );
                        }
                    })()}
                </div>
            </div>
        </motion.div>
    );
};
