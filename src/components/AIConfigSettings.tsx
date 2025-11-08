// AI Configuration Settings Component
import React from 'react';
import {
  Box,
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  Switch,
  Typography,
  Slider,
  Alert,
  Grid,
} from '@mui/material';
import {
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  TrendingUp as TrendingUpIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useAIConfig } from '../contexts/AIConfigContext';
import { MODEL_COSTS, estimateCost } from '../constants/performance';

export const AIConfigSettings: React.FC = () => {
  const {
    preferredModel,
    setPreferredModel,
    enableCaching,
    setEnableCaching,
    enableStreaming,
    setEnableStreaming,
    useOptimizedPrompts,
    setUseOptimizedPrompts,
    enablePerformanceLogging,
    setEnablePerformanceLogging,
    cacheSettings,
    setCacheSettings,
  } = useAIConfig();

  const handleCacheTTLChange = (value: number) => {
    setCacheSettings({
      ...cacheSettings,
      ttl: value * 3600000, // Convert hours to ms
    });
  };

  const handleCacheMaxSizeChange = (value: number) => {
    setCacheSettings({
      ...cacheSettings,
      maxSize: value,
    });
  };

  const getModelInfo = (model: string) => {
    const costs = MODEL_COSTS[model as keyof typeof MODEL_COSTS];
    if (!costs) return { speed: 'Unknown', cost: 'Unknown', quality: 'Unknown' };

    const avgCost = estimateCost(1000, 1000, model);

    switch (model) {
      case 'gpt-3.5-turbo':
        return { speed: '🚀 Nhanh nhất', cost: `💰 Rẻ nhất ($${avgCost.toFixed(4)})`, quality: '⭐⭐⭐ Tốt' };
      case 'gpt-4o-mini-2024-07-18':
        return { speed: '⚡ Nhanh', cost: `💰 Rẻ ($${avgCost.toFixed(4)})`, quality: '⭐⭐⭐⭐ Rất tốt' };
      case 'gpt-4o':
        return { speed: '🐌 Chậm', cost: `💰 Đắt ($${avgCost.toFixed(4)})`, quality: '⭐⭐⭐⭐⭐ Xuất sắc' };
      default:
        return { speed: 'Tự động', cost: 'Tối ưu', quality: 'Thích hợp' };
    }
  };

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto', padding: 2 }}>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <SettingsIcon />
        Cấu hình AI tối ưu
      </Typography>

      <Grid container spacing={3}>
        {/* Model Selection */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SpeedIcon />
                Lựa chọn Model AI
              </Typography>
              <FormControl component="fieldset">
                <RadioGroup
                  value={preferredModel}
                  onChange={(e) => setPreferredModel(e.target.value as any)}
                >
                  <FormControlLabel
                    value="AUTO"
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="body1">🤖 Tự động (Khuyến nghị)</Typography>
                        <Typography variant="caption" color="textSecondary">
                          Chọn model phù hợp dựa trên độ phức tạp prompt
                        </Typography>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="TURBO"
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="body1">
                          {getModelInfo('gpt-3.5-turbo').speed} GPT-3.5 Turbo
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {getModelInfo('gpt-3.5-turbo').cost} • {getModelInfo('gpt-3.5-turbo').quality}
                        </Typography>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="MINI"
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="body1">
                          {getModelInfo('gpt-4o-mini-2024-07-18').speed} GPT-4o Mini
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {getModelInfo('gpt-4o-mini-2024-07-18').cost} • {getModelInfo('gpt-4o-mini-2024-07-18').quality}
                        </Typography>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="GPT4"
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="body1">
                          {getModelInfo('gpt-4o').speed} GPT-4o
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {getModelInfo('gpt-4o').cost} • {getModelInfo('gpt-4o').quality}
                        </Typography>
                      </Box>
                    }
                  />
                </RadioGroup>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Options */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon />
                Tối ưu hiệu suất
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={enableCaching}
                    onChange={(e) => setEnableCaching(e.target.checked)}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2">💾 Bật Cache</Typography>
                    <Typography variant="caption" color="textSecondary">
                      Lưu kết quả để tái sử dụng (tiết kiệm 30% API calls)
                    </Typography>
                  </Box>
                }
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={enableStreaming}
                    onChange={(e) => setEnableStreaming(e.target.checked)}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2">⚡ Streaming</Typography>
                    <Typography variant="caption" color="textSecondary">
                      Hiển thị kết quả ngay lập tức
                    </Typography>
                  </Box>
                }
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={useOptimizedPrompts}
                    onChange={(e) => setUseOptimizedPrompts(e.target.checked)}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2">✂️ Prompt tối ưu</Typography>
                    <Typography variant="caption" color="textSecondary">
                      Giảm 50% tokens, tăng tốc độ
                    </Typography>
                  </Box>
                }
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={enablePerformanceLogging}
                    onChange={(e) => setEnablePerformanceLogging(e.target.checked)}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2">📊 Performance Log</Typography>
                    <Typography variant="caption" color="textSecondary">
                      Hiển thị metrics trong console
                    </Typography>
                  </Box>
                }
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Cache Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MemoryIcon />
                Cài đặt Cache
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography gutterBottom>
                  Thời gian lưu cache: {Math.round(cacheSettings.ttl / 3600000)} giờ
                </Typography>
                <Slider
                  value={cacheSettings.ttl / 3600000}
                  onChange={(_, value) => handleCacheTTLChange(value as number)}
                  min={0.5}
                  max={24}
                  step={0.5}
                  marks={[
                    { value: 0.5, label: '30p' },
                    { value: 1, label: '1h' },
                    { value: 6, label: '6h' },
                    { value: 24, label: '24h' },
                  ]}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography gutterBottom>
                  Số lượng cache tối đa: {cacheSettings.maxSize}
                </Typography>
                <Slider
                  value={cacheSettings.maxSize}
                  onChange={(_, value) => handleCacheMaxSizeChange(value as number)}
                  min={10}
                  max={500}
                  step={10}
                  marks={[
                    { value: 10, label: '10' },
                    { value: 100, label: '100' },
                    { value: 500, label: '500' },
                  ]}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Tips */}
        <Grid item xs={12}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              💡 Gợi ý tối ưu hóa:
            </Typography>
            <Typography variant="body2" component="div">
              • <strong>Tốc độ cao</strong>: Chọn "Tự động" + Bật tất cả tối ưu hóa
              <br />
              • <strong>Chi phí thấp</strong>: Chọn "GPT-3.5 Turbo" + Bật Cache + Prompt tối ưu
              <br />
              • <strong>Chất lượng cao</strong>: Chọn "GPT-4o" + Tắt Prompt tối ưu
            </Typography>
          </Alert>
        </Grid>
      </Grid>
    </Box>
  );
};