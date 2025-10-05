import { EModelEndpoint, extractEnvVariable } from 'librechat-data-provider';
import type { TCustomEndpoints, TEndpoint, TConfig } from 'librechat-data-provider';
import type { TCustomEndpointsConfig } from '~/types/endpoints';
import { isUserProvided, normalizeEndpointName } from '~/utils';

/**
 * Load config endpoints from the cached configuration object
 * @param customEndpointsConfig - The configuration object
 */
export function loadCustomEndpointsConfig(
  customEndpoints?: TCustomEndpoints,
): TCustomEndpointsConfig | undefined {
  if (!customEndpoints) {
    return;
  }

  const customEndpointsConfig: TCustomEndpointsConfig = {};

  if (Array.isArray(customEndpoints)) {
    const filteredEndpoints = customEndpoints.filter(
      (endpoint) =>
        endpoint.baseURL &&
        endpoint.apiKey &&
        endpoint.name &&
        endpoint.models &&
        (endpoint.models.fetch || endpoint.models.default),
    );

    for (let i = 0; i < filteredEndpoints.length; i++) {
      const endpoint = filteredEndpoints[i] as TEndpoint;
      const {
        baseURL,
        apiKey,
        name: configName,
        iconURL,
        modelDisplayLabel,
        customParams,
      } = endpoint;
      const name = normalizeEndpointName(configName);

      const resolvedApiKey = extractEnvVariable(apiKey ?? '');
      const resolvedBaseURL = extractEnvVariable(baseURL ?? '');

      // aim2balance.ai: Skip custom endpoints without valid API keys
      // Only show endpoints where admin has configured actual API keys
      // This prevents showing endpoints that users cannot use
      const hasValidApiKey = resolvedApiKey && !isUserProvided(resolvedApiKey);
      
      if (!hasValidApiKey) {
        // Commented out for potential reversal: Allow showing user-provided custom endpoints
        // To re-enable user-provided custom endpoints, uncomment the code below:
        // customEndpointsConfig[name] = {
        //   type: EModelEndpoint.custom,
        //   userProvide: isUserProvided(resolvedApiKey),
        //   userProvideURL: isUserProvided(resolvedBaseURL),
        //   customParams: customParams as TConfig['customParams'],
        //   modelDisplayLabel,
        //   iconURL,
        // };
        continue;
      }

      customEndpointsConfig[name] = {
        type: EModelEndpoint.custom,
        userProvide: isUserProvided(resolvedApiKey),
        userProvideURL: isUserProvided(resolvedBaseURL),
        customParams: customParams as TConfig['customParams'],
        modelDisplayLabel,
        iconURL,
      };
    }
  }

  return customEndpointsConfig;
}
