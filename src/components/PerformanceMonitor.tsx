// Performance monitoring component
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  LinearProgress,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  MonetizationOn as CostIcon,
  ExpandMore as ExpandIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useAIConfig } from '../contexts/AIConfigContext';
import { enhancedOpenAIService } from '../services/enhanced/enhancedOpenAIService';

export const PerformanceMonitor: React.FC = () => {
  const { enablePerformanceLogging } = useAIConfig();
  const [expanded, setExpanded] = useState(false);
  const [stats, setStats] = useState({
    cacheHitRate: 0,
    cacheSize: 0,
    averageResponseTime: 0,
    totalCost: 0,
  });

  const updateStats = () => {
    const serviceStats = enhancedOpenAIService.getStats();
    setStats({
      cacheHitRate: 0.25, // Mock data - would be calculated from actual usage
      cacheSize: serviceStats.cache.size,
      averageResponseTime: 2.3, // Mock data
      totalCost: 0.15, // Mock data
    });
  };

  useEffect(() => {
    updateStats();
    const interval = setInterval(updateStats, 5000); // Update every 5s
    return () => clearInterval(interval);
  }, []);

  if (!enablePerformanceLogging) {
    return null;
  }

  const getPerformanceColor = (value: number, thresholds: { good: number; ok: number }) => {
    if (value <= thresholds.good) return 'success';
    if (value <= thresholds.ok) return 'warning';
    return 'error';
  };

  const getCacheColor = (hitRate: number) => {
    if (hitRate >= 0.3) return 'success';
    if (hitRate >= 0.15) return 'warning';
    return 'info';
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent sx={{ pb: expanded ? 2 : 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            📊 Performance Monitor
          </Typography>
          <Box>
            <IconButton size="small" onClick={updateStats}>
              <RefreshIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setExpanded(!expanded)}
              sx={{
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s'
              }}
            >
              <ExpandIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Quick stats */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            icon={<SpeedIcon />}
            label={`${stats.averageResponseTime}s avg`}
            size="small"
            color={getPerformanceColor(stats.averageResponseTime, { good: 3, ok: 6 })}
          />
          <Chip
            icon={<MemoryIcon />}
            label={`${Math.round(stats.cacheHitRate * 100)}% cache`}
            size="small"
            color={getCacheColor(stats.cacheHitRate)}
          />
          <Chip
            icon={<CostIcon />}
            label={`$${stats.totalCost.toFixed(3)} cost`}
            size="small"
            color="info"
          />
        </Box>

        <Collapse in={expanded}>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Cache Hit Rate
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={stats.cacheHitRate * 100}
                    sx={{ mt: 0.5, mb: 1 }}
                  />
                  <Typography variant="body2">
                    {Math.round(stats.cacheHitRate * 100)}% ({stats.cacheSize} cached)
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Response Time
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min((stats.averageResponseTime / 10) * 100, 100)}
                    color={getPerformanceColor(stats.averageResponseTime, { good: 3, ok: 6 })}
                    sx={{ mt: 0.5, mb: 1 }}
                  />
                  <Typography variant="body2">
                    {stats.averageResponseTime}s average
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Total Cost
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1.5 }}>
                    ${stats.totalCost.toFixed(3)} USD
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Actions
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip
                      label="Clear Cache"
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        enhancedOpenAIService.clearCache();
                        updateStats();
                      }}
                    />
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};