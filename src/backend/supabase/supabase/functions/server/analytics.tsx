import * as kv from './kv_store.tsx';

export interface ErrorAnalyticsData {
  id: string;
  timestamp: string;
  error_type: string;
  error_message: string;
  error_code?: string;
  screen: string;
  user_agent: string;
  user_id?: string;
  session_id: string;
  additional_context?: Record<string, any>;
}

export interface ErrorSummary {
  error_type: string;
  count: number;
  latest_occurrence: string;
  common_messages: string[];
}

// Store individual error analytics
export async function handleErrorAnalytics(request: Request): Promise<Response> {
  const headers = { 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': '*'
  };

  try {
    console.log('handleErrorAnalytics: Processing error analytics request');
    
    const errorData: ErrorAnalyticsData = await request.json();
    
    // Validate required fields
    if (!errorData.id || !errorData.timestamp || !errorData.error_type || !errorData.error_message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: id, timestamp, error_type, error_message' }),
        { status: 400, headers }
      );
    }

    // Store the error data with a structured key
    const errorKey = `analytics:error:${errorData.timestamp}:${errorData.id}`;
    await kv.set(errorKey, errorData);

    // Also maintain error type counters for quick summaries
    const counterKey = `analytics:counter:${errorData.error_type}`;
    try {
      const currentCount = await kv.get(counterKey) || 0;
      await kv.set(counterKey, currentCount + 1);
    } catch (counterError) {
      console.warn('Failed to update error counter:', counterError);
      // Don't fail the main operation if counter update fails
    }

    // Store recent errors for quick access (last 100 errors)
    try {
      const recentErrorsKey = 'analytics:recent_errors';
      const recentErrors = await kv.get(recentErrorsKey) || [];
      recentErrors.unshift(errorData);
      
      // Keep only the last 100 errors
      if (recentErrors.length > 100) {
        recentErrors.splice(100);
      }
      
      await kv.set(recentErrorsKey, recentErrors);
    } catch (recentError) {
      console.warn('Failed to update recent errors:', recentError);
    }

    console.log(`handleErrorAnalytics: Successfully stored error ${errorData.id} of type ${errorData.error_type}`);

    return new Response(
      JSON.stringify({ success: true, id: errorData.id }),
      { status: 201, headers }
    );

  } catch (error) {
    console.error('handleErrorAnalytics: Unexpected error:', error);
    
    let errorMessage = 'Internal server error while storing analytics';
    if (error instanceof SyntaxError) {
      errorMessage = 'Invalid JSON in request body';
    } else if (error instanceof TypeError) {
      errorMessage = 'Invalid request format';
    }
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers }
    );
  }
}

// Get error summary for a specific time period
export async function handleErrorSummary(request: Request, days: number = 7): Promise<Response> {
  const headers = { 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',  
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': '*'
  };

  try {
    console.log(`handleErrorSummary: Getting error summary for last ${days} days`);
    
    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffTimestamp = cutoffDate.toISOString();

    // Get all error analytics entries
    const allErrors = await kv.getByPrefix('analytics:error:');
    
    // Filter errors within the time range
    const recentErrors = allErrors.filter((error: ErrorAnalyticsData) => 
      error && error.timestamp && error.timestamp >= cutoffTimestamp
    );

    console.log(`handleErrorSummary: Found ${recentErrors.length} errors in last ${days} days`);

    // Group errors by type
    const errorGroups: Record<string, ErrorSummary> = {};

    recentErrors.forEach((error: ErrorAnalyticsData) => {
      if (!errorGroups[error.error_type]) {
        errorGroups[error.error_type] = {
          error_type: error.error_type,
          count: 0,
          latest_occurrence: error.timestamp,
          common_messages: []
        };
      }

      const group = errorGroups[error.error_type];
      group.count++;
      
      // Update latest occurrence
      if (error.timestamp > group.latest_occurrence) {
        group.latest_occurrence = error.timestamp;
      }

      // Add to common messages if not already present and we have room
      if (!group.common_messages.includes(error.error_message) && group.common_messages.length < 5) {
        group.common_messages.push(error.error_message);
      }
    });

    // Convert to array and sort by count
    const summary = Object.values(errorGroups).sort((a, b) => b.count - a.count);

    console.log(`handleErrorSummary: Returning summary with ${summary.length} error types`);

    return new Response(
      JSON.stringify(summary),
      { status: 200, headers }
    );

  } catch (error) {
    console.error('handleErrorSummary: Unexpected error:', error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error while getting error summary' }),
      { status: 500, headers }
    );
  }
}

// Handle batch error upload (for syncing local errors)
export async function handleErrorBatch(request: Request): Promise<Response> {
  const headers = { 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': '*'
  };

  try {
    console.log('handleErrorBatch: Processing batch error upload');
    
    const { errors } = await request.json();
    
    if (!Array.isArray(errors)) {
      return new Response(
        JSON.stringify({ error: 'Errors must be an array' }),
        { status: 400, headers }
      );
    }

    console.log(`handleErrorBatch: Processing ${errors.length} errors`);

    let successCount = 0;
    let failureCount = 0;

    // Process each error
    for (const errorData of errors) {
      try {
        // Validate required fields
        if (!errorData.id || !errorData.timestamp || !errorData.error_type) {
          failureCount++;
          continue;
        }

        // Store the error data
        const errorKey = `analytics:error:${errorData.timestamp}:${errorData.id}`;
        await kv.set(errorKey, errorData);
        
        // Update counter
        const counterKey = `analytics:counter:${errorData.error_type}`;
        try {
          const currentCount = await kv.get(counterKey) || 0;
          await kv.set(counterKey, currentCount + 1);
        } catch (counterError) {
          console.warn('Failed to update counter for batch error:', counterError);
        }

        successCount++;
      } catch (storeError) {
        console.error('Failed to store batch error:', storeError);
        failureCount++;
      }
    }

    console.log(`handleErrorBatch: Successfully processed ${successCount} errors, ${failureCount} failures`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: successCount, 
        failed: failureCount 
      }),
      { status: 200, headers }
    );

  } catch (error) {
    console.error('handleErrorBatch: Unexpected error:', error);
    
    let errorMessage = 'Internal server error while processing error batch';
    if (error instanceof SyntaxError) {
      errorMessage = 'Invalid JSON in request body';
    }
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers }
    );
  }
}

// Get error patterns for a specific user
export async function handleUserErrors(request: Request, userId: string): Promise<Response> {
  const headers = { 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': '*'
  };

  try {
    console.log(`handleUserErrors: Getting error patterns for user ${userId}`);
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers }
      );
    }

    // Get all error analytics entries
    const allErrors = await kv.getByPrefix('analytics:error:');
    
    // Filter errors for this specific user
    const userErrors = allErrors.filter((error: ErrorAnalyticsData) => 
      error && error.user_id === userId
    );

    console.log(`handleUserErrors: Found ${userErrors.length} errors for user ${userId}`);

    // Group by error type
    const errorGroups: Record<string, ErrorSummary> = {};

    userErrors.forEach((error: ErrorAnalyticsData) => {
      if (!errorGroups[error.error_type]) {
        errorGroups[error.error_type] = {
          error_type: error.error_type,
          count: 0,
          latest_occurrence: error.timestamp,
          common_messages: []
        };
      }

      const group = errorGroups[error.error_type];
      group.count++;
      
      if (error.timestamp > group.latest_occurrence) {
        group.latest_occurrence = error.timestamp;
      }

      if (!group.common_messages.includes(error.error_message) && group.common_messages.length < 3) {
        group.common_messages.push(error.error_message);
      }
    });

    const patterns = Object.values(errorGroups).sort((a, b) => b.count - a.count);

    return new Response(
      JSON.stringify(patterns),
      { status: 200, headers }
    );

  } catch (error) {
    console.error('handleUserErrors: Unexpected error:', error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error while getting user error patterns' }),
      { status: 500, headers }
    );
  }
}