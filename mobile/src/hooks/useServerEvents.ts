import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import EventSource, { EventSourceListener } from 'react-native-sse';
import { config } from '@/constants/config';
import { tokenStorage } from '@/utils/storage';

export function useServerEvents() {
  const queryClient = useQueryClient();

  useEffect(() => {
    let es: EventSource | null = null;

    const connect = async () => {
      const token = await tokenStorage.getAccessToken();
      if (!token) return;

      es = new EventSource(`${config.api.baseUrl}/events`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const listener: EventSourceListener = (event: any) => {
        if (event.type === 'open') {
          console.log('SSE Connected');
        } else if (event.type === 'message') {
          // Basic keep-alive or generic message
        } else if (event.type === 'error') {
          console.error('SSE Error:', event.message);
        } else {
          // Custom events
          try {
            // Assuming event.data is JSON
            const data = event.data ? JSON.parse(event.data) : {};

            if (event.type === 'stock_update') {
              console.log('Stock Update Received:', data);
              // Smart Revalidation: Invalidate specific product or list
              queryClient.invalidateQueries({ queryKey: ['/products'] });
              if (data.product_id) {
                queryClient.invalidateQueries({
                  queryKey: [`/products/${data.product_id}`],
                });
              }
            }

            if (event.type === 'product_update') {
              console.log('Product Update Received:', data);
              queryClient.invalidateQueries({ queryKey: ['/products'] });
            }
          } catch (e) {
            console.error('Failed to parse SSE data', e);
          }
        }
      };

      es.addEventListener('open', listener);
      es.addEventListener('message', listener);
      es.addEventListener('error', listener);
      es.addEventListener('stock_update' as any, listener);
      es.addEventListener('product_update' as any, listener);
    };

    connect();

    return () => {
      es?.removeAllEventListeners();
      es?.close();
    };
  }, [queryClient]);
}
