# Magdee Supabase Edge Functions

Serverless edge functions for authentication, user preferences, and real-time features.

## Tech Stack

- **Supabase Edge Functions** - Serverless functions on Deno runtime
- **Hono** - Fast web framework for edge
- **TypeScript** - Type safety

## Structure

```
functions/
└── server/
    ├── index.tsx           # Main server entry point
    ├── auth.tsx            # Authentication logic
    ├── books.tsx           # Book management
    ├── preferences.tsx     # User preferences
    ├── profile.tsx         # User profile
    ├── progress.tsx        # Reading progress
    ├── analytics.tsx       # Analytics tracking
    ├── notifications.tsx   # Notification system
    ├── seed.tsx           # Data seeding
    └── kv_store.tsx       # Key-value storage utilities
```

## Development

### Prerequisites

- Supabase CLI installed: `npm install -g supabase`
- Supabase project created

### Setup

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Set up local development
supabase start
```

### Local Development

```bash
# Serve functions locally
supabase functions serve

# Or serve specific function
supabase functions serve server
```

The functions will be available at:
`http://localhost:54321/functions/v1/make-server-989ff5a9/`

### Testing

```bash
# Test a function locally
curl -i --location --request POST \
  'http://localhost:54321/functions/v1/make-server-989ff5a9/test' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json'
```

## Deployment

### Deploy All Functions

```bash
supabase functions deploy
```

### Deploy Specific Function

```bash
supabase functions deploy server
```

### Environment Variables

Set secrets via Supabase CLI:

```bash
# Set environment variables
supabase secrets set SUPABASE_URL=your-url
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-key
supabase secrets set SUPABASE_ANON_KEY=your-anon-key
```

## API Routes

All routes are prefixed with `/make-server-989ff5a9/`

### Authentication
- `POST /signup` - User registration
- `POST /signin` - User login

### User Profile
- `GET /profile/:userId` - Get user profile
- `PUT /profile/:userId` - Update profile
- `POST /profile/:userId/avatar` - Upload avatar

### Books
- `GET /books/:userId` - Get user's books
- `POST /books/:userId` - Add new book
- `DELETE /books/:userId/:bookId` - Delete book
- `GET /books/:userId/:bookId/progress` - Get reading progress
- `PUT /books/:userId/:bookId/progress` - Update progress

### Preferences
- `GET /preferences/:userId` - Get user preferences
- `PUT /preferences/:userId` - Update preferences
- `PUT /audio-settings/:userId` - Update audio settings

### Analytics
- `GET /analytics/:userId` - Get user analytics
- `PUT /analytics/:userId` - Update analytics

### Notifications
- `GET /notifications/:userId` - Get notifications
- `POST /notifications/:userId` - Create notification
- `PUT /notifications/:userId/:notificationId` - Mark as read
- `DELETE /notifications/:userId/:notificationId` - Delete notification

### Development
- `POST /seed-data` - Seed sample data
- `GET /health` - Health check

## Key Features

### KV Store
Utility functions for interacting with the key-value store:

```typescript
import * as kv from './kv_store.tsx';

// Get value
const value = await kv.get('user:123');

// Set value
await kv.set('user:123', { name: 'John' });

// Delete value
await kv.del('user:123');

// Get multiple values
const values = await kv.mget(['key1', 'key2']);

// Get by prefix
const results = await kv.getByPrefix('user:');
```

### CORS
All routes respond with open CORS headers for development.

### Error Handling
Comprehensive error logging with contextual information.

### Authentication
Routes can require authentication by checking the Authorization header:

```typescript
const accessToken = request.headers.get('Authorization')?.split(' ')[1];
const { data: { user }, error } = await supabase.auth.getUser(accessToken);
```

## Monitoring

### Logs
View function logs:

```bash
supabase functions logs server
```

### Metrics
View metrics in Supabase Dashboard:
- Function invocations
- Response times
- Error rates

## Best Practices

1. **Keep functions small** - Single responsibility
2. **Use async/await** - For all I/O operations
3. **Handle errors** - Return detailed error messages
4. **Log important events** - Use console.log for debugging
5. **Validate input** - Check request data before processing
6. **Use TypeScript** - For type safety

## Troubleshooting

### Function not responding
- Check function logs: `supabase functions logs server`
- Verify environment variables are set
- Check CORS configuration

### Database connection issues
- Verify Supabase URL and keys are correct
- Check if the kv_store table exists
- Ensure service role key has proper permissions

### Authentication errors
- Verify JWT token is valid
- Check user exists in auth.users table
- Ensure service role key is used for admin operations

## Local Testing Tips

```bash
# Get your local project's anon key
supabase status

# Use it in requests
export ANON_KEY="your-anon-key"

# Test endpoint
curl -i --location 'http://localhost:54321/functions/v1/make-server-989ff5a9/health' \
  --header "Authorization: Bearer $ANON_KEY"
```

## Contributing

See the main project CONTRIBUTING.md for guidelines.

## License

See LICENSE file in the root directory.
