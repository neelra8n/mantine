import React, { useState } from 'react';
import {
  CartesianGrid,
  Legend,
  ScatterChart as ReChartsScatterChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Box,
  BoxProps,
  createVarsResolver,
  ElementProps,
  factory,
  Factory,
  getThemeColor,
  MantineColor,
  StylesApiProps,
  useMantineTheme,
  useProps,
  useResolvedStylesApi,
  useStyles,
} from '@mantine/core';
import { ChartLegend, ChartLegendStylesNames } from '../ChartLegend';
import { ChartTooltip, ChartTooltipStylesNames } from '../ChartTooltip';
import { BaseChartStylesNames, GridChartBaseProps } from '../types';
import classes from '../grid-chart.module.css';

export interface ScatterChartSeries {
  color: MantineColor;
  name: string;
  data: Record<string, number>[];
}

export type ScatterChartStylesNames =
  | 'scatter'
  | BaseChartStylesNames
  | ChartLegendStylesNames
  | ChartTooltipStylesNames;
export type ScatterChartVariant = string;
export type ScatterChartCssVariables = {
  root: '--chart-text-color' | '--chart-grid-color';
};

export interface ScatterChartProps
  extends Omit<GridChartBaseProps, 'dataKey' | 'data'>,
    BoxProps,
    StylesApiProps<ScatterChartFactory>,
    ElementProps<'div'> {
  dataKey: { x: string; y: string };
  data: ScatterChartSeries[];
  scatterChartProps?: React.ComponentPropsWithoutRef<typeof ReChartsScatterChart>;
}

export type ScatterChartFactory = Factory<{
  props: ScatterChartProps;
  ref: HTMLDivElement;
  stylesNames: ScatterChartStylesNames;
  vars: ScatterChartCssVariables;
  variant: ScatterChartVariant;
}>;

const defaultProps: Partial<ScatterChartProps> = {
  withXAxis: true,
  withYAxis: true,
  withTooltip: true,
  tooltipAnimationDuration: 0,
  tickLine: 'y',
  strokeDasharray: '5 5',
  gridAxis: 'x',
};

const varsResolver = createVarsResolver<ScatterChartFactory>((theme, { textColor, gridColor }) => ({
  root: {
    '--chart-text-color': textColor ? getThemeColor(textColor, theme) : undefined,
    '--chart-grid-color': gridColor ? getThemeColor(gridColor, theme) : undefined,
  },
}));

export const ScatterChart = factory<ScatterChartFactory>((_props, ref) => {
  const props = useProps('ScatterChart', defaultProps, _props);
  const {
    classNames,
    className,
    style,
    styles,
    unstyled,
    vars,
    referenceLines,
    dir,
    withLegend,
    withTooltip,
    withXAxis,
    withYAxis,
    xAxisProps,
    yAxisProps,
    orientation,
    scatterChartProps,
    legendProps,
    data,
    gridAxis,
    tickLine,
    strokeDasharray,
    gridProps,
    tooltipAnimationDuration,
    tooltipProps,
    children,
    onMouseLeave,
    dataKey,
    textColor,
    gridColor,
    ...others
  } = props;

  const theme = useMantineTheme();

  const mappedData = data.map((item) => ({
    ...item,
    data: item.data.map((point) => ({ ...point, name: item.name })),
  }));

  const { resolvedClassNames, resolvedStyles } = useResolvedStylesApi<ScatterChartFactory>({
    classNames,
    styles,
    props,
  });

  const getStyles = useStyles<ScatterChartFactory>({
    name: 'ScatterChart',
    classes,
    props,
    className,
    style,
    classNames,
    styles,
    unstyled,
    vars,
    varsResolver,
  });

  const withXTickLine = gridAxis !== 'none' && (tickLine === 'x' || tickLine === 'xy');
  const withYTickLine = gridAxis !== 'none' && (tickLine === 'y' || tickLine === 'xy');
  const [highlightedArea, setHighlightedArea] = useState<string | null>(null);
  const shouldHighlight = highlightedArea !== null;
  const handleMouseLeave = (event: React.MouseEvent<HTMLDivElement>) => {
    setHighlightedArea(null);
    onMouseLeave?.(event);
  };

  const referenceLinesItems = referenceLines?.map((line, index) => {
    const color = getThemeColor(line.color, theme);
    return (
      <ReferenceLine
        key={index}
        stroke={line.color ? color : 'var(--chart-grid-color)'}
        strokeWidth={1}
        {...line}
        label={{
          value: line.label,
          fill: line.color ? color : 'currentColor',
          fontSize: 12,
          position: line.labelPosition ?? 'insideBottomLeft',
        }}
        {...getStyles('referenceLine')}
      />
    );
  });

  const scatters = mappedData.map((item, index) => {
    const dimmed = shouldHighlight && highlightedArea !== item.name;
    return (
      <Scatter
        data={item.data}
        fill={getThemeColor(item.color, theme)}
        key={index}
        isAnimationActive={false}
        fillOpacity={dimmed ? 0.1 : 1}
      />
    );
  });

  return (
    <Box
      ref={ref}
      {...getStyles('root')}
      onMouseLeave={handleMouseLeave}
      dir={dir || 'ltr'}
      {...others}
    >
      <ResponsiveContainer {...getStyles('container')}>
        <ReChartsScatterChart>
          <CartesianGrid
            strokeDasharray={strokeDasharray}
            vertical={gridAxis === 'y' || gridAxis === 'xy'}
            horizontal={gridAxis === 'x' || gridAxis === 'xy'}
            {...getStyles('grid')}
            {...gridProps}
          />
          <XAxis
            type="number"
            hide={!withXAxis}
            dataKey={dataKey.x}
            tick={{ transform: 'translate(0, 10)', fontSize: 12, fill: 'currentColor' }}
            stroke=""
            interval="preserveStartEnd"
            tickLine={withXTickLine ? { stroke: 'currentColor' } : false}
            minTickGap={5}
            {...getStyles('axis')}
            {...xAxisProps}
          />
          <YAxis
            type="number"
            hide={!withYAxis}
            axisLine={false}
            dataKey={dataKey.y}
            tickLine={withYTickLine ? { stroke: 'currentColor' } : false}
            tick={{ transform: 'translate(-10, 0)', fontSize: 12, fill: 'currentColor' }}
            allowDecimals
            {...getStyles('axis')}
            {...yAxisProps}
          />

          {withTooltip && (
            <Tooltip
              animationDuration={tooltipAnimationDuration}
              isAnimationActive={tooltipAnimationDuration !== 0}
              position={{ y: 0 }}
              cursor={{
                stroke: 'var(--chart-grid-color)',
                strokeWidth: 1,
                strokeDasharray,
              }}
              content={({ label, payload }) => (
                <ChartTooltip
                  type="scatter"
                  label={label}
                  payload={payload}
                  classNames={resolvedClassNames}
                  styles={resolvedStyles}
                  series={data}
                />
              )}
              {...tooltipProps}
            />
          )}

          {withLegend && (
            <Legend
              verticalAlign="top"
              content={(payload) => (
                <ChartLegend
                  payload={payload.payload?.map((item, index) => ({
                    ...item,
                    dataKey: data[index].name,
                  }))}
                  onHighlight={setHighlightedArea}
                  legendPosition={legendProps?.verticalAlign || 'top'}
                  classNames={resolvedClassNames}
                  styles={resolvedStyles}
                  series={data}
                />
              )}
              height={44}
              {...legendProps}
            />
          )}

          {referenceLinesItems}
          {scatters}
        </ReChartsScatterChart>
      </ResponsiveContainer>
    </Box>
  );
});

ScatterChart.displayName = '@mantine/charts/ScatterChart';
ScatterChart.classes = classes;