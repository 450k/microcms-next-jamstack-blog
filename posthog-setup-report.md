<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog into the TTC Practice Schedule app. PostHog is now initialized client-side via `instrumentation-client.ts` (the recommended approach for Next.js 15.3+), with a reverse proxy configured in `next.config.ts` to route events through `/ingest` and reduce ad-blocker interference. A server-side PostHog Node.js client was added in `lib/posthog-server.ts` for capturing events in API routes. Environment variables are stored in `.env.local` and referenced via `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST`.

Eight events are now tracked across the core user journeys — registration, push notifications, content filtering, and admin activity. The key conversion path (LINE entry button click → completed registration) is instrumented on both the client and server for full end-to-end visibility.

| Event | Description | File |
|---|---|---|
| `entry_line_login_clicked` | User clicks the LINE entry button — top of the registration funnel | `components/entry-form.tsx` |
| `entry_completed` | Server-side: LINE OAuth callback succeeds and the entry is saved to the database | `app/api/auth/line/callback/route.ts` |
| `push_notification_subscribed` | User subscribes to push notifications | `components/push-subscribe.tsx` |
| `push_notification_unsubscribed` | User unsubscribes from push notifications | `components/push-subscribe.tsx` |
| `category_filter_changed` | User filters the event list by category | `components/eventcard.tsx` |
| `admin_logged_in` | Server-side: Admin successfully logs in | `app/api/admin/login/route.ts` |
| `admin_logged_out` | Admin logs out via the logout button | `components/logout-button.tsx` |

Users are identified via `posthog.identify()` when they click the LINE entry button (using their entered name), and on the server-side when the LINE OAuth callback completes (using their LINE user ID). `posthog.reset()` is called on admin logout.

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics (wizard) — Dashboard](https://us.posthog.com/project/470898/dashboard/1713690)
- [Registration Conversion Funnel](https://us.posthog.com/project/470898/insights/VAbKy1fx)
- [LINE Entry Clicks Over Time](https://us.posthog.com/project/470898/insights/ExBAhReW)
- [Event Entries Over Time](https://us.posthog.com/project/470898/insights/E6OPa9aq)
- [Push Notification Subscriptions](https://us.posthog.com/project/470898/insights/4U4wNTjq)
- [Category Filter Usage](https://us.posthog.com/project/470898/insights/sP34bBHR)

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
