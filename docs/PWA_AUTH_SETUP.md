# PWA Authentication Setup

This document explains how the magic link authentication works with the PWA installation.

## How It Works

The app uses a custom composable `useRedirectUrl()` to dynamically generate redirect URLs for Supabase authentication flows.

### Development vs Production

- **Development**: Uses `window.location.origin` to support both `localhost` and local network IPs (useful for testing on mobile devices)
- **Production**: Uses the configured domain from `nuxt.config.ts` (`elmergerritsma.github.io`)

### Files Updated

The following files use the `useRedirectUrl()` composable:

1. `/app/pages/login.vue` - Magic link login
2. `/app/pages/signup.vue` - Magic link signup
3. `/app/pages/password/reset.vue` - Password reset flow

### Composable Location

`/app/composables/useRedirectUrl.ts`

## Supabase Configuration Required

For magic links to work in production (including PWA), you must configure your Supabase project:

### 1. Navigate to Supabase Dashboard
Go to: Authentication → URL Configuration

### 2. Add Redirect URLs
Add these URLs to the "Redirect URLs" list:

```
https://elmergerritsma.github.io/confirm
https://elmergerritsma.github.io/password/update
```

If using `www` subdomain, also add:
```
https://www.elmergerritsma.github.io/confirm
https://www.elmergerritsma.github.io/password/update
```

### 3. Set Site URL
Set the "Site URL" to:
```
https://elmergerritsma.github.io
```

### 4. Development URLs (Optional)
For local development, you may want to add:
```
http://localhost:3000/confirm
http://localhost:3000/password/update
```

## Testing PWA Authentication

1. Build and deploy your app
2. Install it as a PWA on a device
3. Try the signup/login flow
4. Check your email for the magic link
5. Click the link - it should open in the PWA and complete authentication

## Troubleshooting

### Magic link redirects to browser instead of PWA
- Ensure the domain in the email matches your PWA's start_url
- Check that the Supabase redirect URLs are configured correctly

### "Invalid redirect URL" error
- Verify the URL is added to Supabase's allowed redirect URLs
- Check that the protocol (http/https) matches

### Email links not working
- Check spam folder
- Verify email is sent from Supabase (check Supabase logs)
- Ensure the email template in Supabase uses the correct redirect URL variable

## Environment Variables

If you need to change the production domain, update `nuxt.config.ts`:

```typescript
runtimeConfig: {
  public: {
    workspaceUrl: "your-domain.com"
  }
}
```
