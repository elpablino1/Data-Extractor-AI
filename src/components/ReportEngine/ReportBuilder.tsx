import { Layout2Col } from './components/Layout2Col';
import { DataTable } from './components/DataTable';
import { HeaderSection } from './components/HeaderSection';
import { KPIGrid } from './components/KPIGrid';
import { ChartSection } from './components/ChartSection';
import { AlertList } from './components/AlertList';
import { ProgressBarList } from './components/ProgressBarList';
import { ErrorBoundary } from '../Common/ErrorBoundary';

interface ReportComponent {
    type: string;
    [key: string]: any;
}

interface ReportBuilderProps {
    data: {
        infographic: ReportComponent[];
    };
}

export const ReportBuilder: React.FC<ReportBuilderProps> = ({ data }) => {
    if (!data || !data.infographic) return null;

    console.log('🏗️ ReportBuilder: Rendering', data.infographic.length, 'components');
    console.log('📋 Component types:', data.infographic.map(c => c.type).join(', '));

    const components = Array.isArray(data.infographic) ? data.infographic : [data.infographic];

    return (
        <div className="w-full space-y-12">
            {components.map((component, idx) => {
                const type = component.type?.toLowerCase();

                let content: React.ReactNode = null;
                switch (type) {
                    case 'header':
                        content = <HeaderSection title={component.title} subtitle={component.subtitle} />;
                        break;
                    case 'kpi_grid':
                        content = <KPIGrid items={component.items} />;
                        break;
                    case 'chart':
                        content = (
                            <ChartSection
                                type={component.chartType}
                                title={component.title}
                                description={component.analysisText}
                                data={component.chartData}
                            />
                        );
                        break;
                    case 'alert_list':
                        content = <AlertList title={component.title} items={component.items} />;
                        break;
                    case 'progress_list':
                        content = <ProgressBarList title={component.title} items={component.items} />;
                        break;
                    case 'layout_2_col':
                        content = <Layout2Col children={component.children} />;
                        break;
                    case 'data_table':
                        content = <DataTable title={component.title} headers={component.headers} rows={component.rows} />;
                        break;
                    default:
                        content = null;
                }

                return (
                    <ErrorBoundary key={idx} componentName={type || 'unknown'}>
                        {content}
                    </ErrorBoundary>
                );
            })}
        </div>
    );
};
