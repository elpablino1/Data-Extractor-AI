export interface ReportValidationError {
    field: string;
    message: string;
    type: 'empty' | 'invalid' | 'missing';
}

export interface ReportValidationResult {
    isValid: boolean;
    errors: ReportValidationError[];
    warnings: string[];
}

/**
 * Validates a report data structure to ensure:
 * 1. No empty fields
 * 2. All required fields present
 * 3. Valid data types
 * 4. Chart data contains values
 */
export const validateReport = (reportData: any): ReportValidationResult => {
    const errors: ReportValidationError[] = [];
    const warnings: string[] = [];

    if (!reportData || !reportData.infographic) {
        errors.push({
            field: 'infographic',
            message: 'El reporte debe tener una estructura infographic',
            type: 'missing'
        });
        return { isValid: false, errors, warnings };
    }

    const components = Array.isArray(reportData.infographic) ? reportData.infographic : [reportData.infographic];

    components.forEach((component: any, idx: number) => {
        // Validate component type
        if (!component.type) {
            errors.push({
                field: `component[${idx}].type`,
                message: 'Cada componente debe tener un tipo',
                type: 'missing'
            });
        }

        // Validate based on component type
        switch (component.type) {
            case 'header':
                if (!component.title || component.title.trim() === '') {
                    errors.push({
                        field: `component[${idx}].title`,
                        message: 'El header debe tener un título',
                        type: 'empty'
                    });
                }
                break;

            case 'kpi_grid':
                if (!component.items || !Array.isArray(component.items) || component.items.length === 0) {
                    errors.push({
                        field: `component[${idx}].items`,
                        message: 'KPI Grid debe tener al menos un item',
                        type: 'empty'
                    });
                } else {
                    component.items.forEach((item: any, itemIdx: number) => {
                        if (!item.label || item.label.trim() === '') {
                            errors.push({
                                field: `component[${idx}].items[${itemIdx}].label`,
                                message: 'Cada KPI debe tener una etiqueta',
                                type: 'empty'
                            });
                        }
                        if (item.value === undefined || item.value === null || item.value === '') {
                            errors.push({
                                field: `component[${idx}].items[${itemIdx}].value`,
                                message: 'Cada KPI debe tener un valor',
                                type: 'empty'
                            });
                        }
                    });
                }
                break;

            case 'chart':
                if (!component.title || component.title.trim() === '') {
                    errors.push({
                        field: `component[${idx}].title`,
                        message: 'El gráfico debe tener un título',
                        type: 'empty'
                    });
                }
                if (!component.chartType) {
                    errors.push({
                        field: `component[${idx}].chartType`,
                        message: 'El gráfico debe especificar un tipo (bar, line, doughnut)',
                        type: 'missing'
                    });
                }
                if (!component.chartData || !component.chartData.labels || component.chartData.labels.length === 0) {
                    errors.push({
                        field: `component[${idx}].chartData.labels`,
                        message: 'El gráfico debe tener etiquetas',
                        type: 'empty'
                    });
                }
                if (!component.chartData || !component.chartData.datasets || component.chartData.datasets.length === 0) {
                    errors.push({
                        field: `component[${idx}].chartData.datasets`,
                        message: 'El gráfico debe tener datasets',
                        type: 'empty'
                    });
                } else {
                    component.chartData.datasets.forEach((dataset: any, datasetIdx: number) => {
                        if (!dataset.data || dataset.data.length === 0) {
                            errors.push({
                                field: `component[${idx}].chartData.datasets[${datasetIdx}].data`,
                                message: 'Cada dataset debe tener datos',
                                type: 'empty'
                            });
                        }
                    });
                }
                break;

            case 'alert_list':
                if (!component.items || !Array.isArray(component.items) || component.items.length === 0) {
                    warnings.push(`Alert list en componente ${idx} está vacío`);
                } else {
                    component.items.forEach((item: any, itemIdx: number) => {
                        // Allow 'text' (from prompt) or 'message' (legacy)
                        if ((!item.text || item.text.trim() === '') && (!item.message || item.message.trim() === '')) {
                            errors.push({
                                field: `component[${idx}].items[${itemIdx}].text`,
                                message: 'Cada alerta debe tener un mensaje (text)',
                                type: 'empty'
                            });
                        }
                    });
                }
                break;

            case 'progress_list':
                if (!component.items || !Array.isArray(component.items) || component.items.length === 0) {
                    warnings.push(`Progress list en componente ${idx} está vacío`);
                } else {
                    component.items.forEach((item: any, itemIdx: number) => {
                        if (!item.label || item.label.trim() === '') {
                            errors.push({
                                field: `component[${idx}].items[${itemIdx}].label`,
                                message: 'Cada progreso debe tener una etiqueta',
                                type: 'empty'
                            });
                        }
                        if (item.value === undefined || item.value === null) {
                            errors.push({
                                field: `component[${idx}].items[${itemIdx}].value`,
                                message: 'Cada progreso debe tener un valor',
                                type: 'empty'
                            });
                        }
                    });
                }
                break;
        }
    });

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
};

/**
 * Attempts to fix common issues in report data
 */
export const fixReportData = (reportData: any): any => {
    if (!reportData || !reportData.infographic) return reportData;

    const components = Array.isArray(reportData.infographic) ? reportData.infographic : [reportData.infographic];

    const fixedComponents = components.map((component: any) => {
        const fixed = { ...component };

        // Normalize field names from common AI variations
        if (fixed.chart_type && !fixed.chartType) fixed.chartType = fixed.chart_type;
        if (fixed.chart_data && !fixed.chartData) fixed.chartData = fixed.chart_data;

        // Handle case where AI puts datasets directly under chartData as 'data'
        if (fixed.chartData && !fixed.chartData.datasets && fixed.chartData.data) {
            fixed.chartData.datasets = Array.isArray(fixed.chartData.data) && typeof fixed.chartData.data[0] === 'object'
                ? fixed.chartData.data
                : [{ label: fixed.title || 'Datos', data: fixed.chartData.data }];
        }

        switch (component.type) {
            case 'header':
                if (!fixed.title || fixed.title.trim() === '') {
                    fixed.title = 'Reporte de Análisis';
                }
                if (!fixed.subtitle) {
                    fixed.subtitle = 'Análisis generado automáticamente';
                }
                break;

            case 'kpi_grid':
                if (fixed.items && Array.isArray(fixed.items)) {
                    fixed.items = fixed.items.filter((item: any) =>
                        item.label && item.label.trim() !== '' &&
                        item.value !== undefined && item.value !== null && item.value !== ''
                    );
                }
                break;

            case 'alert_list':
                if (fixed.items && Array.isArray(fixed.items)) {
                    fixed.items = fixed.items.map((item: any) => {
                        // Map message to text if needed
                        if (!item.text && item.message) {
                            return { ...item, text: item.message };
                        }
                        return item;
                    }).filter((item: any) => item.text && item.text.trim() !== '');
                }
                break;

            case 'chart':
                if (!fixed.title || fixed.title.trim() === '') {
                    fixed.title = 'Gráfico';
                }
                break;
        }

        return fixed;
    });

    return {
        ...reportData,
        infographic: fixedComponents
    };
};
