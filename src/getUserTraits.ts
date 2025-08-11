import { GetUserTraitsRequest, GetUserTraitsResponse } from './types/event';
import { getConfig, isSDKInitialized } from './init';
import { getUserTraitsFromAPI } from './api';

export async function getUserTraits(userIds: string | string[]): Promise<GetUserTraitsResponse> {
  // Check if SDK is initialized
  if (!isSDKInitialized()) {
    throw new Error('SDK not initialized. Call init() first.');
  }

  // Validate userIds parameter
  if (!userIds) {
    throw new Error('userIds is required');
  }

  // Convert single userId to array if needed
  const userIdsArray = Array.isArray(userIds) ? userIds : [userIds];
  
  // Validate that we have at least one userId
  if (userIdsArray.length === 0) {
    throw new Error('At least one userId is required');
  }

  // Validate that all userIds are non-empty strings
  for (const userId of userIdsArray) {
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      throw new Error('All userIds must be non-empty strings');
    }
  }

  try {
    // Get config
    const config = getConfig();
    
    // Prepare request payload
    const request: GetUserTraitsRequest = {
      userIds: userIdsArray.map(id => id.trim())
    };

    // Call the API
    const response = await getUserTraitsFromAPI(
      config.clientId,
      config.customerId,
      request
    );

    return response;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get user traits: ${error.message}`);
    }
    throw new Error('Failed to get user traits: Unknown error');
  }
}
