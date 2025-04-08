import { createAdminApiClient } from '@shopify/admin-api-client';
import type { AdminApiClient, ClientResponse } from '@shopify/admin-api-client';
import { loggerService } from '../logger';
import { sessionStorage } from '~/shopify.server';
import { ApiVersion } from '@shopify/shopify-app-remix/server';
import { SessionCache } from '../cache/session-cache';
import { trace, SpanStatusCode } from "@opentelemetry/api";

interface CachedSession {
  accessToken: string;
  isOnline: boolean;
}

/**
 * Manages Shopify Admin API clients and provides methods for GraphQL operations
 */
export class ShopifyClientManager {
  private static sessionCache = new SessionCache<CachedSession>();
  private static tracer = trace.getTracer('shopify-client');

  private static async getAccessToken(storeDomain: string): Promise<string> {
    return this.tracer.startActiveSpan('shopify.getAccessToken', async (span) => {
      try {
        span.setAttribute('store.domain', storeDomain);
        loggerService.debug('Starting to get access token', { 
          storeDomain,
          timestamp: new Date().toISOString()
        });

        // Try to get from cache first
        const cachedSession = this.sessionCache.get(storeDomain);
        if (cachedSession) {
          span.setAttribute('cache.hit', true);
          loggerService.debug('Using cached session', { 
            storeDomain,
            isOnline: cachedSession.isOnline
          });
          return cachedSession.accessToken;
        }

        span.setAttribute('cache.hit', false);
        loggerService.debug('Fetching sessions from database', { storeDomain });
        const sessions = await sessionStorage.findSessionsByShop(storeDomain);
        
        if (!sessions.length) {
          loggerService.error('No sessions found in database', { storeDomain });
          throw new Error(`No session found for store: ${storeDomain}`);
        }

        const session = sessions[0];
        loggerService.debug('Session found', { 
          storeDomain,
          isOnline: session.isOnline,
          hasAccessToken: !!session.accessToken
        });

        if (!session?.accessToken) {
          loggerService.error('Session found but no access token present', { storeDomain });
          throw new Error(`No session found for store: ${storeDomain}`);
        }

        // Cache the valid session
        this.sessionCache.set(
          storeDomain,
          {
            accessToken: session.accessToken,
            isOnline: session.isOnline
          }
        );

        span.setStatus({ code: SpanStatusCode.OK });
        loggerService.info('Successfully retrieved valid access token', { 
          storeDomain,
          isOnline: session.isOnline
        });

        return session.accessToken;

      } catch (error) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error instanceof Error ? error.message : 'Unknown error'
        });
        span.recordException(error as Error);
        loggerService.error('Failed to get valid session', { 
          error,
          storeDomain,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });
        throw error;
      } finally {
        span.end();
      }
    });
  }

  /**
   * Clear cache for a specific shop
   */
  public static async clearShopCache(shopDomain: string): Promise<void> {
    return this.tracer.startActiveSpan('shopify.clearShopCache', async (span) => {
      try {
        span.setAttribute('store.domain', shopDomain);
        loggerService.info("Starting cache cleanup for shop", { shopDomain });
        
        // Clear memory cache
        const deletedCount = this.sessionCache.deleteByShopDomain(shopDomain);
        
        span.setAttribute('cache.deleted_entries', deletedCount);
        span.setStatus({ code: SpanStatusCode.OK });
        loggerService.info("Completed cache cleanup for shop", {
          shopDomain,
          deletedEntries: deletedCount
        });
      } catch (error) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error instanceof Error ? error.message : 'Unknown error'
        });
        span.recordException(error as Error);
        loggerService.error("Failed to clear shop cache", {
          shopDomain,
          error: error instanceof Error ? error.message : "Unknown error"
        });
        throw error;
      } finally {
        span.end();
      }
    });
  }

  /**
   * Get or create a Shopify admin client for a store
   */
  public static async getClient(storeDomain: string): Promise<AdminApiClient> {
    return this.tracer.startActiveSpan('shopify.getClient', async (span) => {
      try {
        span.setAttribute('store.domain', storeDomain);
        
        if (!storeDomain) {
          loggerService.error('Store domain is required');
          throw new Error('Store domain is required');
        }

        loggerService.info('Creating new Shopify client', { storeDomain });
        
        const accessToken = await this.getAccessToken(storeDomain);
        const client = createAdminApiClient({
          storeDomain,
          apiVersion: process.env.SHOPIFY_API_VERSION as ApiVersion || '2025-01',
          accessToken
        });

        span.setStatus({ code: SpanStatusCode.OK });
        return client;
      } catch (error) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error instanceof Error ? error.message : 'Unknown error'
        });
        span.recordException(error as Error);
        throw error;
      } finally {
        span.end();
      }
    });
  }

  /**
   * Extract operation name from GraphQL query string
   */
  private static extractOperationName(query: string): string {
    // Handle multiline queries and trim whitespace
    const normalizedQuery = query.replace(/\s+/g, ' ').trim();
    const match = normalizedQuery.match(/(?:query|mutation)\s+(\w+)(?:\s*\(|\s*\{)/);
    const operationName = match ? match[1] : 'Unknown';
    
    loggerService.info('Extracted GraphQL operation name', {
      operationName,
      queryPreview: normalizedQuery.substring(0, 100) // First 100 chars
    });
    
    return operationName;
  }

  /**
   * Execute a GraphQL query against the Shopify Admin API
   */
  public static async query<T = any>(
    operation: string,
    storeDomain: string,
    options?: {
      variables?: Record<string, unknown>;
    }
  ): Promise<ClientResponse<T>> {
    const operationName = this.extractOperationName(operation);
    loggerService.info('Starting GraphQL query', {
      storeDomain,
      operationName,
      queryPreview: operation.substring(0, 100) // First 100 chars
    });

    return this.tracer.startActiveSpan('shopify.graphql.query', async (span) => {
      try {
        span.setAttribute('store.domain', storeDomain);
        span.setAttribute('graphql.operation_name', operationName);
        if (options?.variables) {
          span.setAttribute('graphql.variables', JSON.stringify(options.variables));
        }

        const client = await this.getClient(storeDomain);
        const response = await client.request<T>(operation, {
          variables: options?.variables
        });

        span.setAttribute('graphql.has_data', !!response.data);
        span.setAttribute('graphql.has_errors', !!response.errors);
        
        if (response.errors) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: JSON.stringify(response.errors)
          });
        } else {
          span.setStatus({ code: SpanStatusCode.OK });
        }

        loggerService.info('GraphQL query completed', {
          storeDomain,
          operationName,
          hasData: !!response.data,
          dataKeys: response.data ? Object.keys(response.data) : []
        });

        return response;
        
      } catch (error) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error instanceof Error ? error.message : 'Unknown error'
        });
        span.recordException(error as Error);
        loggerService.error('GraphQL query failed', {
          storeDomain,
          error: error instanceof Error ? error.message : 'Unknown error',
          variables: options?.variables
        });
        throw error;
      } finally {
        span.end();
      }
    });
  }

  /**
   * Execute a GraphQL mutation against the Shopify Admin API
   */
  public static async mutation<T = any>(
    operation: string,
    storeDomain: string,
    options?: {
      variables?: Record<string, unknown>;
    }
  ): Promise<ClientResponse<T>> {
    return this.tracer.startActiveSpan('shopify.graphql.mutation', async (span) => {
      try {
        span.setAttribute('store.domain', storeDomain);
        span.setAttribute('graphql.operation_name', this.extractOperationName(operation));
        if (options?.variables) {
          span.setAttribute('graphql.variables', JSON.stringify(options.variables));
        }

        loggerService.debug('Starting GraphQL mutation execution', {
          storeDomain,
          operationName: this.extractOperationName(operation),
          variables: options?.variables
        });

        const client = await this.getClient(storeDomain);
        const response = await client.request<T>(operation, {
          variables: options?.variables
        });

        span.setAttribute('graphql.has_data', !!response.data);
        span.setAttribute('graphql.has_errors', !!response.errors);
        
        if (response.errors) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: JSON.stringify(response.errors)
          });
        } else {
          span.setStatus({ code: SpanStatusCode.OK });
        }

        loggerService.debug('GraphQL mutation completed successfully', {
          storeDomain,
          hasData: !!response.data
        });
        
        return response;
        
      } catch (error) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error instanceof Error ? error.message : 'Unknown error'
        });
        span.recordException(error as Error);
        loggerService.error('GraphQL mutation failed', {
          storeDomain,
          error: error instanceof Error ? error.message : 'Unknown error',
          variables: options?.variables
        });
        throw error;
      } finally {
        span.end();
      }
    });
  }
} 