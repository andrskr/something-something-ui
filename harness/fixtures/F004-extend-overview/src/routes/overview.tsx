import { Card } from '@astryxdesign/core/Card';
import { Divider } from '@astryxdesign/core/Divider';
import { Grid } from '@astryxdesign/core/Grid';
import { Icon } from '@astryxdesign/core/Icon';
import { HStack, VStack } from '@astryxdesign/core/Layout';
import { StatusDot } from '@astryxdesign/core/StatusDot';
import { pixel, proportional, Table } from '@astryxdesign/core/Table';
import type { TableColumn } from '@astryxdesign/core/Table';
import { Heading, Text } from '@astryxdesign/core/Text';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/overview')({ component: Overview });

// ============= DATA =============

interface Metric {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
}

const metrics: Metric[] = [
  { label: 'Weekly revenue', value: '$284,300', change: '+4.2% vs last week', isPositive: true },
  { label: 'Transactions', value: '18,240', change: '-1.8% vs last week', isPositive: false },
  { label: 'Avg. basket size', value: '$15.60', change: '+2.1% vs last week', isPositive: true },
  { label: 'Sites below target', value: '3 of 12', change: '+1 vs last week', isPositive: false },
];

const trendData = [
  { day: 'Mon', thisWeek: 38_200, lastWeek: 36_400 },
  { day: 'Tue', thisWeek: 36_900, lastWeek: 35_800 },
  { day: 'Wed', thisWeek: 39_500, lastWeek: 37_100 },
  { day: 'Thu', thisWeek: 41_200, lastWeek: 38_900 },
  { day: 'Fri', thisWeek: 45_800, lastWeek: 44_300 },
  { day: 'Sat', thisWeek: 48_600, lastWeek: 47_500 },
  { day: 'Sun', thisWeek: 34_100, lastWeek: 32_800 },
];

const trendColors = {
  thisWeek: 'var(--color-data-categorical-blue, #0171E3)',
  lastWeek: 'var(--color-data-neutral, #8494A3)',
};

interface SiteRow extends Record<string, unknown> {
  id: string;
  site: string;
  region: string;
  revenue: string;
  vsTarget: string;
  change: string;
  status: 'error' | 'warning';
  statusLabel: string;
}

const sitesNeedingAttention: SiteRow[] = [
  {
    id: '1',
    site: 'Tacoma Mall',
    region: 'South Sound',
    revenue: '$14,200',
    vsTarget: '-22.4%',
    change: '-9.1% WoW',
    status: 'error',
    statusLabel: 'Needs attention',
  },
  {
    id: '2',
    site: 'Spokane Valley',
    region: 'Inland',
    revenue: '$16,850',
    vsTarget: '-15.6%',
    change: '-5.4% WoW',
    status: 'error',
    statusLabel: 'Needs attention',
  },
  {
    id: '3',
    site: 'Everett Riverfront',
    region: 'North Sound',
    revenue: '$19,400',
    vsTarget: '-8.2%',
    change: '-2.0% WoW',
    status: 'warning',
    statusLabel: 'Watch',
  },
];

const siteColumns: TableColumn<SiteRow>[] = [
  { key: 'site', header: 'Site', width: proportional(1) },
  { key: 'region', header: 'Region', width: pixel(140) },
  { key: 'revenue', header: 'Weekly revenue', width: pixel(140) },
  { key: 'vsTarget', header: 'vs. target', width: pixel(110) },
  { key: 'change', header: 'Change', width: pixel(120) },
  {
    key: 'status',
    header: 'Status',
    width: pixel(160),
    renderCell: (item: SiteRow) => (
      <HStack gap={2} vAlign="center">
        <StatusDot variant={item.status} label={item.statusLabel} />
        <Text type="body">{item.statusLabel}</Text>
      </HStack>
    ),
  },
];

// ============= COMPONENTS =============

function MetricCard({ label, value, change, isPositive }: Metric) {
  return (
    <Card>
      <VStack gap={2}>
        <Text type="supporting" color="secondary">
          {label}
        </Text>
        <Heading level={2}>{value}</Heading>
        <HStack gap={1} vAlign="center">
          <Icon
            icon={isPositive ? 'arrowUp' : 'arrowDown'}
            size="xsm"
            color={isPositive ? 'success' : 'error'}
          />
          <Text type="supporting" color="secondary">
            {change}
          </Text>
        </HStack>
      </VStack>
    </Card>
  );
}

const CHART_WIDTH = 700;
const CHART_HEIGHT = 220;
const CHART_PADDING_Y = 12;

function pointsFor(values: number[], min: number, max: number) {
  const range = max - min || 1;
  const step = CHART_WIDTH / (values.length - 1);
  return values
    .map((value, index) => {
      const x = index * step;
      const y =
        CHART_HEIGHT -
        CHART_PADDING_Y -
        ((value - min) / range) * (CHART_HEIGHT - CHART_PADDING_Y * 2);
      return `${x},${y}`;
    })
    .join(' ');
}

function WeeklyTrendChart() {
  const allValues = trendData.flatMap((point) => [point.thisWeek, point.lastWeek]);
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);

  return (
    <VStack gap={3}>
      <svg
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        aria-labelledby="weekly-trend-title"
        style={{ width: '100%', height: 220 }}
      >
        <title id="weekly-trend-title">Daily revenue this week compared with last week</title>
        <polyline
          points={pointsFor(
            trendData.map((point) => point.lastWeek),
            min,
            max,
          )}
          fill="none"
          strokeWidth={2}
          strokeDasharray="5 5"
          style={{ stroke: trendColors.lastWeek }}
        />
        <polyline
          points={pointsFor(
            trendData.map((point) => point.thisWeek),
            min,
            max,
          )}
          fill="none"
          strokeWidth={2}
          style={{ stroke: trendColors.thisWeek }}
        />
      </svg>
      <HStack hAlign="between">
        {trendData.map((point) => (
          <Text key={point.day} type="supporting" color="secondary">
            {point.day}
          </Text>
        ))}
      </HStack>
      <HStack gap={6} vAlign="center">
        <HStack gap={2} vAlign="center">
          <Icon icon="stop" size="xsm" style={{ color: trendColors.thisWeek }} />
          <Text type="supporting" color="secondary">
            This week
          </Text>
        </HStack>
        <HStack gap={2} vAlign="center">
          <Icon icon="stop" size="xsm" style={{ color: trendColors.lastWeek }} />
          <Text type="supporting" color="secondary">
            Last week
          </Text>
        </HStack>
      </HStack>
    </VStack>
  );
}

// ============= PAGE =============

function Overview() {
  return (
    <VStack gap={6}>
      <VStack gap={1}>
        <Heading level={1}>Overview</Heading>
        <Text type="body" color="secondary">
          Week of Aug 18 to Aug 24, 2026
        </Text>
      </VStack>

      <Grid columns={{ minWidth: 240, repeat: 'fit' }} gap={4}>
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </Grid>

      <Divider />

      <VStack gap={4}>
        <Heading level={3}>Weekly trend</Heading>
        <WeeklyTrendChart />
      </VStack>

      <Divider />

      <VStack gap={4}>
        <Heading level={3}>Sites needing attention</Heading>
        <Table<SiteRow>
          data={sitesNeedingAttention}
          columns={siteColumns}
          idKey="id"
          density="compact"
          dividers="rows"
          hasHover
        />
      </VStack>
    </VStack>
  );
}
