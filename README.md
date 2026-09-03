# Vote for Luna Love

A mobile-first bilingual guide that helps friends and family cast a legitimate free vote for Luna Love on the official Baby of the Year website. The guide never collects voter information and never submits or automates votes.

## Features

- English and Spanish content with query, cookie, browser-language, and optional country-header detection
- Persistent manual language preference stored in first-party cookies
- Direct Facebook and text-verification paths on the official website
- Accessible step-by-step instructions and troubleshooting
- Optional ICS reminder starting 24 hours after a voting-method click and repeating daily eight times
- Estimated next-vote time clearly labeled as an estimate
- Web Share API with clipboard fallback
- Responsive, keyboard-accessible interface

## Development

Requires Node.js 20 or newer and npm. Install with npm ci, then start the local server with npm run dev. Open http://localhost:3000.

## Verification

Run npm run lint, npm test, and npm run build. Use npm run test:watch during development.

## Language selection

The initial language is selected from an explicit ?lang=en or ?lang=es parameter, a previous manual preference, the request's Accept-Language value, an optional hosting-country header, and finally English. The toggle updates the document language and stores the language and manual-selection flag in first-party cookies. No external location service is used.

## Luna's photo

Place up to four family-owned portrait images at `public/luna/luna-01.jpg` through `public/luna/luna-04.jpg`, ideally 4:5 and at least 1200 pixels wide. The fixed-size carousel advances automatically, supports manual controls, and displays a polished placeholder if no photos can load. Do not hotlink images from the competition website.

## Reminder behavior

Choosing Facebook or text voting opens a reminder sheet. A visitor may create a recurring calendar file, continue without reminders, re-download an active schedule with the same UID, or clear the reminder information stored by this guide.

The first calendar occurrence is exactly 24 hours after the voting-method click. It repeats every 24 hours and ends after eight occurrences. The device still requires the visitor to approve or save the event. The estimated next-vote time is based on the click, not a confirmed vote; this site cannot inspect activity on the official site.

## Privacy and local storage

The guide uses `localStorage` for exactly four values: the voting-method click timestamp, selected method, whether a reminder file was created, and the reminder language. The reminder's first time and stable UID are derived from the timestamp rather than stored. Language-toggle preference is kept separately in first-party cookies. The guide never requests or stores names, phone numbers, passwords, authentication data, confirmation codes, or voting responses.

## Official links

All external destinations are defined in src/config/officialLinks.ts. If the organizer changes a route, update that file, keep only trusted official domains, remove tracking parameters, and test each destination.

## Deployment

Deploy to any platform supporting Next.js 16. On Vercel, import the repository and use the default Next.js build settings. No environment variables, database, or backend service are required.

After deployment, verify both language query parameters, both voting paths, calendar downloads on iOS and Android, and the production URL used by the share feature.
