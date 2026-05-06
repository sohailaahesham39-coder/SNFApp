## send-push Edge Function

Sends FCM notifications using HTTP v1 for SNF push event types:

- `health_plan_update`
- `weekly_progress_summary`
- `new_recommendations`
- `streak_achievement`

### Required Secrets

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `FCM_PROJECT_ID`
- `FCM_CLIENT_EMAIL`
- `FCM_PRIVATE_KEY` (service account private key, keep escaped newlines)
- `FCM_TOKEN_URI` (optional, defaults to `https://oauth2.googleapis.com/token`)

### Request Body

```json
{
  "userId": "auth-user-uuid",
  "eventType": "weekly_progress_summary",
  "target": "/(tabs)/profile",
  "streakDays": 7
}
```

### Behavior

- Reads `user_notification_settings` for user token and `push_enabled`.
- Skips send if disabled or token missing.
- Sends templated FCM push message using OAuth2 service account token.

