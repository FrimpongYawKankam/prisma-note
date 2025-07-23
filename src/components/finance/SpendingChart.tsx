import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Svg, { Circle, G, Path, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Spacing, Typography } from '../../styles/tokens';
import { CategoryBudget, Expense } from '../../types/finance';
import { ModernCard } from '../ui/ModernCard';

interface SpendingChartProps {
  expenses: Expense[];
  categories: CategoryBudget[];
  chartType?: 'pie' | 'bar' | 'line';
  period?: 'week' | 'month' | 'year';
  height?: number;
}

interface ChartData {
  id: string;
  name: string;
  value: number;
  color: string;
  percentage: number;
}

const { width: screenWidth } = Dimensions.get('window');

export function SpendingChart({
  expenses,
  categories,
  chartType = 'pie',
  period = 'month',
  height = 250,
}: SpendingChartProps) {
  const { colors } = useTheme();
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [animationProgress] = useState(new Animated.Value(0));

  // Process data for charts
  const chartData: ChartData[] = React.useMemo(() => {
    const categoryTotals = new Map<string, number>();
    
    // Calculate totals per category
    expenses.forEach(expense => {
      const current = categoryTotals.get(expense.category) || 0;
      categoryTotals.set(expense.category, current + expense.amount);
    });

    const total = Array.from(categoryTotals.values()).reduce((sum, val) => sum + val, 0);

    // Create chart data
    return Array.from(categoryTotals.entries()).map(([categoryId, amount]) => {
      const category = categories.find(cat => cat.id === categoryId);
      return {
        id: categoryId,
        name: category?.name || 'Unknown',
        value: amount,
        color: category?.color || '#666',
        percentage: total > 0 ? (amount / total) * 100 : 0,
      };
    }).sort((a, b) => b.value - a.value);
  }, [expenses, categories]);

  useEffect(() => {
    // Animate chart on load
    Animated.timing(animationProgress, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  }, [chartData]);

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const PieChart = () => {
    const size = 200;
    const strokeWidth = 30;
    const radius = (size - strokeWidth) / 2;
    const centerX = size / 2;
    const centerY = size / 2;

    let cumulativePercentage = 0;

    const createArc = (percentage: number, startAngle: number) => {
      const angle = (percentage / 100) * 360;
      const endAngle = startAngle + angle;
      
      const startAngleRad = (startAngle * Math.PI) / 180;
      const endAngleRad = (endAngle * Math.PI) / 180;

      const largeArcFlag = angle > 180 ? 1 : 0;

      const x1 = centerX + radius * Math.cos(startAngleRad);
      const y1 = centerY + radius * Math.sin(startAngleRad);
      const x2 = centerX + radius * Math.cos(endAngleRad);
      const y2 = centerY + radius * Math.sin(endAngleRad);

      return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
    };

    return (
      <View style={styles.pieContainer}>
        <Svg width={size} height={size}>
          {chartData.map((item, index) => {
            const startAngle = cumulativePercentage * 3.6 - 90; // Start from top
            const path = createArc(item.percentage, startAngle);
            cumulativePercentage += item.percentage;

            return (
              <G key={item.id}>
                <Animated.View>
                  <Path
                    d={path}
                    fill={item.color}
                    opacity={selectedSegment === item.id ? 1 : selectedSegment ? 0.3 : 0.8}
                    onPress={() => setSelectedSegment(selectedSegment === item.id ? null : item.id)}
                  />
                </Animated.View>
              </G>
            );
          })}
          
          {/* Center circle */}
          <Circle
            cx={centerX}
            cy={centerY}
            r={radius - strokeWidth}
            fill={colors.background}
          />
          
          {/* Center text */}
          <SvgText
            x={centerX}
            y={centerY - 5}
            textAnchor="middle"
            fontSize="14"
            fontWeight="600"
            fill={colors.text}
          >
            Total
          </SvgText>
          <SvgText
            x={centerX}
            y={centerY + 15}
            textAnchor="middle"
            fontSize="18"
            fontWeight="700"
            fill={colors.text}
          >
            {formatCurrency(chartData.reduce((sum, item) => sum + item.value, 0))}
          </SvgText>
        </Svg>
      </View>
    );
  };

  const BarChart = () => {
    const chartHeight = 150;
    const maxValue = Math.max(...chartData.map(item => item.value));
    const barWidth = (screenWidth - 80) / chartData.length - 10;

    return (
      <View style={styles.barContainer}>
        <View style={[styles.barChart, { height: chartHeight }]}>
          {chartData.map((item, index) => {
            const barHeight = (item.value / maxValue) * chartHeight;
            
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.barItem}
                onPress={() => setSelectedSegment(selectedSegment === item.id ? null : item.id)}
              >
                <View style={styles.barColumn}>
                  <Text style={[styles.barValue, { color: colors.text }]}>
                    {formatCurrency(item.value)}
                  </Text>
                  <Animated.View
                    style={[
                      styles.bar,
                      {
                        height: animationProgress.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, barHeight],
                        }),
                        backgroundColor: item.color,
                        width: barWidth,
                        opacity: selectedSegment === item.id ? 1 : selectedSegment ? 0.3 : 0.8,
                      }
                    ]}
                  />
                  <Text style={[styles.barLabel, { color: colors.textSecondary }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const LineChart = () => {
    // Simplified line chart for spending over time
    const chartHeight = 150;
    const chartWidth = screenWidth - 80;
    
    // Group expenses by day for the period
    const dailySpending = React.useMemo(() => {
      const days = new Map<string, number>();
      const now = new Date();
      const daysToShow = period === 'week' ? 7 : period === 'month' ? 30 : 365;
      
      // Initialize days with 0
      for (let i = daysToShow - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const key = date.toISOString().split('T')[0];
        days.set(key, 0);
      }
      
      // Add actual spending
      expenses.forEach(expense => {
        const key = expense.date.toISOString().split('T')[0];
        if (days.has(key)) {
          days.set(key, (days.get(key) || 0) + expense.amount);
        }
      });
      
      return Array.from(days.entries()).map(([date, amount]) => ({
        date,
        amount,
      }));
    }, [expenses, period]);

    const maxAmount = Math.max(...dailySpending.map(d => d.amount), 1);
    const points = dailySpending.map((data, index) => {
      const x = (index / (dailySpending.length - 1)) * chartWidth;
      const y = chartHeight - (data.amount / maxAmount) * chartHeight;
      return { x, y, amount: data.amount };
    });

    const pathData = points.reduce((path, point, index) => {
      const command = index === 0 ? 'M' : 'L';
      return `${path} ${command} ${point.x} ${point.y}`;
    }, '');

    return (
      <View style={styles.lineContainer}>
        <Svg width={chartWidth} height={chartHeight} style={styles.lineChart}>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
            <Path
              key={ratio}
              d={`M 0 ${chartHeight * ratio} L ${chartWidth} ${chartHeight * ratio}`}
              stroke={colors.border}
              strokeWidth={0.5}
              opacity={0.3}
            />
          ))}
          
          {/* Line */}
          <Path
            d={pathData}
            stroke={colors.primary}
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Data points */}
          {points.map((point, index) => (
            <Circle
              key={index}
              cx={point.x}
              cy={point.y}
              r={4}
              fill={colors.primary}
            />
          ))}
        </Svg>
        
        <View style={styles.lineLabels}>
          <Text style={[styles.lineLabel, { color: colors.textSecondary }]}>
            {period === 'week' ? '7 days ago' : period === 'month' ? '30 days ago' : '1 year ago'}
          </Text>
          <Text style={[styles.lineLabel, { color: colors.textSecondary }]}>
            Today
          </Text>
        </View>
      </View>
    );
  };

  const Legend = () => (
    <View style={styles.legend}>
      {chartData.map(item => (
        <TouchableOpacity
          key={item.id}
          style={[
            styles.legendItem,
            { opacity: selectedSegment === item.id ? 1 : selectedSegment ? 0.3 : 1 }
          ]}
          onPress={() => setSelectedSegment(selectedSegment === item.id ? null : item.id)}
        >
          <View style={[styles.legendColor, { backgroundColor: item.color }]} />
          <View style={styles.legendText}>
            <Text style={[styles.legendName, { color: colors.text }]}>
              {item.name}
            </Text>
            <Text style={[styles.legendValue, { color: colors.textSecondary }]}>
              {formatCurrency(item.value)} ({item.percentage.toFixed(1)}%)
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return <BarChart />;
      case 'line':
        return <LineChart />;
      case 'pie':
      default:
        return <PieChart />;
    }
  };

  return (
    <ModernCard style={[styles.container, { backgroundColor: colors.surface, height }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Spending {chartType === 'line' ? 'Trends' : 'Breakdown'}
        </Text>
        <View style={styles.chartTypes}>
          {['pie', 'bar', 'line'].map(type => (
            <TouchableOpacity
              key={type}
              style={[
                styles.chartTypeButton,
                {
                  backgroundColor: chartType === type ? colors.primary + '20' : 'transparent',
                }
              ]}
              onPress={() => {
                // This would typically be handled by parent component
                console.log('Switch to', type);
              }}
            >
              <Ionicons
                name={
                  type === 'pie' ? 'pie-chart-outline' :
                  type === 'bar' ? 'bar-chart-outline' :
                  'trending-up-outline'
                }
                size={16}
                color={chartType === type ? colors.primary : colors.textSecondary}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.content}>
        {chartData.length > 0 ? (
          <>
            {renderChart()}
            {chartType !== 'line' && <Legend />}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="analytics-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No spending data available
            </Text>
          </View>
        )}
      </View>
    </ModernCard>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
  },
  chartTypes: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  chartTypeButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  pieContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  barContainer: {
    marginBottom: Spacing.lg,
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.base,
  },
  barItem: {
    alignItems: 'center',
  },
  barColumn: {
    alignItems: 'center',
  },
  barValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  bar: {
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xs,
  },
  barLabel: {
    fontSize: Typography.fontSize.xs,
    textAlign: 'center',
    maxWidth: 60,
  },
  lineContainer: {
    marginBottom: Spacing.lg,
  },
  lineChart: {
    marginHorizontal: Spacing.base,
  },
  lineLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    marginTop: Spacing.sm,
  },
  lineLabel: {
    fontSize: Typography.fontSize.xs,
  },
  legend: {
    gap: Spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.sm,
  },
  legendText: {
    flex: 1,
  },
  legendName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
  },
  legendValue: {
    fontSize: Typography.fontSize.xs,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    marginTop: Spacing.base,
  },
});