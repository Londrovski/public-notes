# Vortex Group Calls

Weekly call scheduling and email notification system for the Vortex Year Group healing practice community.

## What this project is

Replaces WhatsApp-only coordination. Google Calendar is the source of truth. Google Groups is the mailing list. A Google Apps Script sends two automated emails each week.

## Where things live

| Thing | Location |
|---|---|
| Script | script.google.com -> jrmat49@gmail.com -> "Vortex Group Calls" |
| Script file | VortexGroupCalls.gs (also in outputs of Jewel Portal Claude project) |
| Google Calendar ID | fed0209bc523afd5133c7e7962ece8c3cc18639bdd25ebeaea0113aa1a251ff1@group.calendar.google.com |
| Google Group | vortex-group-calls@googlegroups.com |
| Group join link | https://groups.google.com/g/vortex-group-calls |
| Public calendar (Google) | https://calendar.google.com/calendar/u/0?cid=ZmVkMDIwOWJjNTIzYWZkNTEzM2M3ZTc5NjJlY2U4YzNjYzE4NjM5YmRkMjVlYmVhZWEwMTEzYWExYTI1MWZmMUBncm91cC5jYWxlbmRhci5nb29nbGUuY29t |
| Public calendar (ICS) | https://calendar.google.com/calendar/ical/fed0209bc523afd5133c7e7962ece8c3cc18639bdd25ebeaea0113aa1a251ff1%40group.calendar.google.com/public/basic.ics |

## Call leads (calendar editors)

- James Morris — jrmat49@gmail.com — Europe/London
- Tara Soleimani — tara.soleimani@hotmail.com — Europe/Amsterdam
- Teague Harvey — teague.harvey1@gmail.com — America/Los_Angeles

## Email schedule

- **Saturday 9am UK** -> leads nudge -> all three leads
- **Sunday 9am UK** -> group roundup -> vortex-group-calls@googlegroups.com + jrmat49@gmail.com (separate MailApp send, not CC, to bypass Gmail self-delivery suppression)

## Apps Script triggers

Set in script.google.com -> Triggers (clock icon):
- `sendLeadsNudge` — weekly, Saturday, 9-10am
- `sendGroupEmail` — weekly, Sunday, 9-10am

## Calendar event naming convention

```
Vortex Group - Name - Topic
```

Examples: `Vortex Group - Tara - POK`, `Vortex Group - James - Embodiment Part 3`

Zoom link goes in the event description — the script extracts the first URL it finds. Meeting ID and passcode can follow on separate lines.

## Zoom links in use

- Merlin's Zoom Room: https://tiny.cc/Merlins_Zoom_Room (ID: 892 4638 5285, Passcode: MERLIN)
- POK room: https://tiny.cc/POK-Vortex-Group

## Timezone handling

All conversions use Utilities.formatDate with IANA timezone IDs — never manual offsets. Abbreviations (BST, PDT, CEST etc.) are computed live at send time so DST changes automatically.

A red warning banner appears in both emails during any week where a DST transition falls within the 10-day window, naming the region and exact date.

## DST transition weeks

- Last Sunday March — UK & EU spring forward
- 2nd Sunday March — US spring forward
- Last Sunday October — UK & EU fall back
- 1st Sunday November — US fall back

## WhatsApp join message

For sharing with the wider group:

```
Vortex Group Calls — how to stay in the loop

We have a shared calendar with all our upcoming calls and a weekly
email that goes out every Sunday morning with what's coming up.

To get the weekly email:
Join our Google Group here:
https://groups.google.com/g/vortex-group-calls

One click to join — that's it. You'll get a summary every Sunday
morning with all the calls for the week ahead, including times in
your timezone.

To add the calendar to yours:

Google Calendar — click this link and hit Add:
https://calendar.google.com/calendar/u/0?cid=ZmVkMDIwOWJjNTIzYWZkNTEzM2M3ZTc5NjJlY2U4YzNjYzE4NjM5YmRkMjVlYmVhZWEwMTEzYWExYTI1MWZmMUBncm91cC5jYWxlbmRhci5nb29nbGUuY29t

Apple Calendar / Outlook / anything else — go to your calendar
app, add a calendar by URL, and paste this:
https://calendar.google.com/calendar/ical/fed0209bc523afd5133c7e7962ece8c3cc18639bdd25ebeaea0113aa1a251ff1%40group.calendar.google.com/public/basic.ics

Once added, every call appears automatically in your own calendar
in your own timezone.
```
