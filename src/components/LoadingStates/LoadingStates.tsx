import React from 'react';
import { Box, Card, CardContent, Grid, Skeleton } from '@mui/material';

export const NoteCardSkeleton: React.FC = () => {
  return (
    <Grid item xs={12} md={6}>
      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Skeleton variant="rectangular" width="100%" height={56} />
            </Grid>
            <Grid item xs={6}>
              <Skeleton variant="rectangular" width="100%" height={56} />
            </Grid>
            <Grid item xs={12}>
              <Skeleton variant="rectangular" width="100%" height={56} />
            </Grid>
            <Grid item xs={12}>
              <Skeleton variant="rectangular" width="100%" height={80} />
            </Grid>
            <Grid item xs={12}>
              <Skeleton variant="rectangular" width="100%" height={80} />
            </Grid>
            <Grid item xs={12}>
              <Skeleton variant="rectangular" width="100%" height={80} />
            </Grid>
            <Grid item xs={12}>
              <Skeleton variant="rectangular" width="100%" height={120} />
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
            <Skeleton variant="rectangular" width={80} height={32} />
            <Skeleton variant="rectangular" width={100} height={32} />
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );
};

export const FormSkeleton: React.FC = () => {
  return (
    <Grid container spacing={2} direction="column">
      <Grid item>
        <Skeleton variant="rectangular" width="100%" height={56} />
      </Grid>
      <Grid item>
        <Skeleton variant="rectangular" width="100%" height={56} />
      </Grid>
      <Grid item>
        <Skeleton variant="rectangular" width="100%" height={120} />
      </Grid>
      <Grid item>
        <Skeleton variant="rectangular" width={150} height={36} />
      </Grid>
    </Grid>
  );
};

export const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Đang tải...' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 4
      }}
    >
      <Skeleton variant="circular" width={40} height={40} />
      <Skeleton variant="text" width={120} sx={{ marginTop: 1 }}>
        {message}
      </Skeleton>
    </Box>
  );
};

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  children: React.ReactNode;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  message = 'Đang xử lý...',
  children
}) => {
  return (
    <Box sx={{ position: 'relative' }}>
      {children}
      {isLoading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="text" width={120} sx={{ marginTop: 1 }}>
            {message}
          </Skeleton>
        </Box>
      )}
    </Box>
  );
};