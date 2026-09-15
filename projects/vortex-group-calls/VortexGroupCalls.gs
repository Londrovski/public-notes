// ============================================================
//  Vortex Group Calls -- Apps Script
//  Two emails, auto-generated from Google Calendar
//
//  SETUP:
//  1. Paste this into script.google.com (New project)
//  2. Run sendLeadsNudge() once manually to authorise permissions
//  3. Add two time-driven triggers (see bottom of file)
// ============================================================

const CALENDAR_ID = "fed0209bc523afd5133c7e7962ece8c3cc18639bdd25ebeaea0113aa1a251ff1@group.calendar.google.com";

const LEADS = [
  "jrmat49@gmail.com",
  "tara.soleimani@hotmail.com",
  "teague.harvey1@gmail.com"
];

const JAMES_EMAIL = "jrmat49@gmail.com";
const GROUP_EMAIL = "vortex-group-calls@googlegroups.com";

const TZ_LEADS = [
  { id: "America/Los_Angeles" },
  { id: "Europe/London"       },
  { id: "Europe/Amsterdam"    }
];

const TZ_GROUP = [
  { id: "America/Los_Angeles" },
  { id: "America/New_York"    },
  { id: "Europe/London"       },
  { id: "Europe/Amsterdam"    },
  { id: "Asia/Kolkata"        }
];

const DST_WINDOWS = getDSTWindows_();

function sendLeadsNudge() {
  const events = getEvents_(10);
  const html   = buildLeadsEmail_(events);
  const subj   = "Vortex Group Calls -- anything missing for the next 10 days?";
  LEADS.forEach(addr => GmailApp.sendEmail(addr, subj, "", { htmlBody: html }));
  Logger.log("Leads nudge sent to " + LEADS.join(", "));
}

function sendGroupEmail() {
  const events = getEvents_(10);
  const html   = buildGroupEmail_(events);
  const subj   = "Vortex Group Calls -- what's coming up this week";
  GmailApp.sendEmail(GROUP_EMAIL, subj, "", { htmlBody: html });
  MailApp.sendEmail({ to: JAMES_EMAIL, subject: subj, htmlBody: html });
  Logger.log("Group email sent to " + GROUP_EMAIL + " and " + JAMES_EMAIL);
}

function getEvents_(days) {
  const cal   = CalendarApp.getCalendarById(CALENDAR_ID);
  const start = new Date();
  const end   = new Date();
  end.setDate(end.getDate() + days);
  return cal.getEvents(start, end).sort((a, b) => a.getStartTime() - b.getStartTime());
}

function getDSTWindows_() {
  const windows = [];
  for (let y = new Date().getFullYear(); y <= new Date().getFullYear() + 1; y++) {
    windows.push(
      { date: nthSundayOf_(y, 2,  2), region: "US",   label: "US clocks spring forward"           },
      { date: lastSundayOf_(y, 9),    region: "UK/EU", label: "UK & European clocks fall back"      },
      { date: lastSundayOf_(y, 2),    region: "UK/EU", label: "UK & European clocks spring forward" },
      { date: nthSundayOf_(y, 10, 1), region: "US",   label: "US clocks fall back"                 }
    );
  }
  return windows;
}

function nthSundayOf_(year, month, n) {
  let d = new Date(year, month, 1);
  while (d.getDay() !== 0) d.setDate(d.getDate() + 1);
  d.setDate(d.getDate() + (n - 1) * 7);
  return d;
}

function lastSundayOf_(year, month) {
  let d = new Date(year, month + 1, 0);
  while (d.getDay() !== 0) d.setDate(d.getDate() - 1);
  return d;
}

function getDSTWarnings_(windowStart, windowEnd) {
  const warnings = [];
  DST_WINDOWS.forEach(w => {
    if (w.date >= windowStart && w.date <= windowEnd) {
      const dateStr = Utilities.formatDate(w.date, "Europe/London", "EEEE d MMMM");
      warnings.push(w.label + " on <b>" + dateStr + "</b>");
    }
  });
  return warnings;
}

function fmt_(date, tzId) {
  const time = Utilities.formatDate(date, tzId, "h:mm a").toLowerCase();
  const abbr = Utilities.formatDate(date, tzId, "z");
  return { time, abbr };
}

function dur_(event) {
  const ms  = event.getEndTime() - event.getStartTime();
  const min = ms / 60000;
  if (min === 60)  return "1 hour";
  if (min === 75)  return "1 hour 15 min";
  if (min === 90)  return "1 hour 30 min";
  if (min % 60 === 0) return (min / 60) + " hours";
  return Math.floor(min / 60) + " hr " + (min % 60) + " min";
}

function extractLink_(description) {
  if (!description) return null;
  const plain = description.replace(/<[^>]+>/g, " ");
  const match = plain.match(/https?:\/\/[^\s"<>]+/);
  return match ? match[0].trim() : null;
}

function stripPrefix_(title) {
  return title.replace(/^Vortex Group\s*[-]\s*/i, "").trim();
}

function header_(tagText, subtitle, dateRange) {
  const sub = subtitle
    ? `<div style="margin-top:14px">
         <p style="font-size:21px;font-weight:300;color:#fff;font-style:italic;letter-spacing:-.2px;margin:0 0 3px">${subtitle}</p>
         <p style="font-size:12.5px;color:rgba(255,255,255,.65);margin:0">${dateRange || ""}</p>
       </div>`
    : "";
  return `
  <div style="background:linear-gradient(135deg,#7a2a9e 0%,#1f7fc4 100%);padding:20px 26px">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%">
      <tr>
        <td style="vertical-align:middle">
          <span style="font-size:17px;font-weight:700;color:#fff">Vortex Group Calls</span>
        </td>
        <td style="text-align:right;vertical-align:middle">
          <span style="font-size:10px;color:rgba(255,255,255,.6);font-weight:700;letter-spacing:.6px">${tagText}</span>
        </td>
      </tr>
    </table>
    ${sub}
  </div>`;
}

function footer_(text) {
  return `
  <div style="background:#faf8fd;border-top:1px solid #e7e1f1;padding:13px 26px">
    <p style="margin:0;font-size:10.5px;color:#9a8cb8;line-height:1.6">${text}</p>
  </div>`;
}

function dstBanner_(warnings) {
  if (!warnings.length) return "";
  const items = warnings.map(w => `<li style="margin:3px 0">${w}</li>`).join("");
  return `
  <div style="background:#fff3f3;border:1px solid #f5c0c0;border-radius:11px;padding:13px 16px;margin-bottom:18px">
    <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#c0392b">** Clock changes fall within this 10-day window **</p>
    <ul style="margin:0;padding-left:18px;font-size:12.5px;color:#7a2a2a;line-height:1.6">${items}</ul>
    <p style="margin:6px 0 0;font-size:12px;color:#9a4a4a">Please double-check the times above are correct for your timezone.</p>
  </div>`;
}

function buildLeadsEmail_(events) {
  const windowStart = new Date();
  const windowEnd   = new Date(); windowEnd.setDate(windowEnd.getDate() + 10);
  const warnings    = getDSTWarnings_(windowStart, windowEnd);
  const rows = events.map(ev => {
    const title = stripPrefix_(ev.getTitle());
    const link  = extractLink_(ev.getDescription());
    const tzCols = TZ_LEADS.map(tz => {
      const f = fmt_(ev.getStartTime(), tz.id);
      return `<div style="font-size:11px;color:#4a4460;white-space:nowrap;padding:1px 0;min-width:90px;display:block">${f.time} <b style="color:#7a2a9e">${f.abbr}</b></div>`;
    }).join("");
    return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0"
      style="width:100%;border:1px solid #e7e1f1;border-radius:11px;margin-bottom:9px;overflow:hidden;border-collapse:separate">
      <tr>
        <td style="padding:11px 14px;background:#faf8fd;vertical-align:top">
          <div style="margin-bottom:3px">
            <span style="font-size:12px;font-weight:700;color:#7a2a9e;letter-spacing:.4px">${Utilities.formatDate(ev.getStartTime(), "Europe/London", "EEE").toUpperCase()}</span>
            <span style="font-size:10.5px;color:#b0a8c0;margin-left:5px">${Utilities.formatDate(ev.getStartTime(), "Europe/London", "d MMMM")}</span>
          </div>
          <div style="font-size:13.5px;font-weight:600;color:#241f36;margin-bottom:2px;line-height:1.3">${title}</div>
          <div style="font-size:11px;color:#9a8cb8;margin-bottom:3px">${dur_(ev)}</div>
          ${link ? `<div><a href="${link}" style="font-size:11.5px;color:#1f7fc4;text-decoration:none;font-weight:600">${link}</a></div>` : ""}
        </td>
        <td style="background:#f4eefb;padding:11px 12px;width:130px;border-left:1px solid #e7e1f1;vertical-align:middle;white-space:nowrap">${tzCols}</td>
      </tr>
    </table>`;
  }).join("");
  const noEvents = events.length === 0
    ? `<p style="font-size:13.5px;color:#9a8cb8;font-style:italic">Nothing in the calendar yet for the next 10 days.</p>`
    : "";
  return `
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;max-width:580px;margin:0 auto">
    ${header_("FOR LEADS")}
    <div style="background:#fff;padding:22px 26px 6px">
      <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#9a8cb8;letter-spacing:.5px">SATURDAY NUDGE</p>
      <h1 style="margin:0 0 10px;font-size:19px;font-weight:700;color:#241f36;line-height:1.3">Anything missing for the next 10 days?</h1>
      <p style="margin:0 0 18px;font-size:13.5px;color:#4a4460;line-height:1.6">The group email goes out tomorrow morning. Here's what's in the calendar -- update anything that's changed and add anything that's missing before then.</p>
      ${dstBanner_(warnings)}
      ${rows}${noEvents}
      <div style="background:#f4eefb;border:1px solid #e2d4f2;border-radius:11px;padding:13px 16px;font-size:13px;color:#4a4460;line-height:1.6;margin:12px 0 20px">If anything needs adding or changing, update it in Google Calendar now.</div>
      <div style="margin-bottom:24px">
        <a href="https://calendar.google.com/calendar/r/eventedit?cid=ZmVkMDIwOWJjNTIzYWZkNTEzM2M3ZTc5NjJlY2U4YzNjYzE4NjM5YmRkMjVlYmVhZWEwMTEzYWExYTI1MWZmMUBncm91cC5jYWxlbmRhci5nb29nbGUuY29t"
          style="display:inline-block;padding:10px 18px;border-radius:9px;background:linear-gradient(90deg,#efe0fb,#e4f2fd);border:1px solid #cbb0ec;color:#7a2a9e;font-size:13px;font-weight:700;text-decoration:none">
          Add or edit an event
        </a>
      </div>
    </div>
    ${footer_("You're getting this as a call lead. The group roundup goes out Sunday at 9:00 am UK.")}
  </div>`;
}

function buildGroupEmail_(events) {
  const windowStart = new Date();
  const windowEnd   = new Date(); windowEnd.setDate(windowEnd.getDate() + 10);
  const warnings    = getDSTWarnings_(windowStart, windowEnd);
  const dateRangeStart = Utilities.formatDate(windowStart, "Europe/London", "d MMMM");
  const dateRangeEnd   = Utilities.formatDate(windowEnd,   "Europe/London", "d MMMM yyyy");
  const cards = events.map(ev => {
    const title = stripPrefix_(ev.getTitle());
    const link  = extractLink_(ev.getDescription());
    const tzCols = TZ_GROUP.map(tz => {
      const f = fmt_(ev.getStartTime(), tz.id);
      return `<div style="font-size:12px;color:#4a4460;white-space:nowrap;padding:2px 0;min-width:100px;display:block">${f.time} <b style="color:#7a2a9e">${f.abbr}</b></div>`;
    }).join("");
    return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0"
      style="width:100%;border:1px solid #e7e1f1;border-radius:12px;margin-bottom:10px;overflow:hidden;border-collapse:separate">
      <tr>
        <td style="padding:14px 16px;background:#faf8fd;vertical-align:top">
          <div style="margin-bottom:4px">
            <span style="font-size:12px;font-weight:700;color:#7a2a9e;letter-spacing:.4px">${Utilities.formatDate(ev.getStartTime(), "Europe/London", "EEEE").toUpperCase()}</span>
            <span style="font-size:10.5px;color:#b0a8c0;margin-left:6px">${Utilities.formatDate(ev.getStartTime(), "Europe/London", "d MMMM")}</span>
          </div>
          <div style="font-size:15px;font-weight:700;color:#241f36;margin-bottom:3px;line-height:1.3">${title}</div>
          <div style="font-size:11px;color:#9a8cb8;margin-bottom:5px">${dur_(ev)}</div>
          ${link ? `<div style="font-size:12px;color:#6b6482"><a href="${link}" style="color:#1f7fc4;font-weight:600;text-decoration:none">${link}</a></div>` : ""}
        </td>
        <td style="background:#f4eefb;border-left:1px solid #e7e1f1;padding:14px 12px;width:130px;vertical-align:middle;white-space:nowrap">${tzCols}</td>
      </tr>
    </table>`;
  }).join("");
  const noEvents = events.length === 0
    ? `<p style="font-size:13.5px;color:#9a8cb8;font-style:italic;padding:10px 0">Nothing confirmed for the next 10 days yet -- check back next week.</p>`
    : `<p style="margin:4px 0 22px;font-size:13px;color:#9a8cb8;border-top:1px solid #e7e1f1;padding-top:14px;line-height:1.6">Turn up to whatever calls to you. Nothing to sign up for -- just join the Zoom at the time.</p>`;
  return `
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;max-width:580px;margin:0 auto">
    ${header_("WEEK AHEAD", "Calls for the next 10 days", dateRangeStart + " -- " + dateRangeEnd)}
    <div style="background:#fff;padding:22px 26px 6px">
      <p style="margin:0 0 18px;font-size:13.5px;color:#4a4460;line-height:1.6">Everything coming up. Turn up to whatever calls to you -- nothing to sign up for, just join the Zoom at the time.</p>
      ${dstBanner_(warnings)}
      ${cards}${noEvents}
    </div>
    ${footer_(`You're in the Vortex Group Calls community.<br><br>
      <a href="https://calendar.google.com/calendar/u/0/r?cid=ZmVkMDIwOWJjNTIzYWZkNTEzM2M3ZTc5NjJlY2U4YzNjYzE4NjM5YmRkMjVlYmVhZWEwMTEzYWExYTI1MWZmMUBncm91cC5jYWxlbmRhci5nb29nbGUuY29t"
        style="display:inline-block;padding:9px 16px;border-radius:9px;background:linear-gradient(90deg,#efe0fb,#e4f2fd);border:1px solid #cbb0ec;color:#7a2a9e;font-size:12.5px;font-weight:700;text-decoration:none;margin-right:8px">View the calendar</a>
      <a href="https://calendar.google.com/calendar/u/0?cid=ZmVkMDIwOWJjNTIzYWZkNTEzM2M3ZTc5NjJlY2U4YzNjYzE4NjM5YmRkMjVlYmVhZWEwMTEzYWExYTI1MWZmMUBncm91cC5jYWxlbmRhci5nb29nbGUuY29t"
        style="display:inline-block;padding:9px 16px;border-radius:9px;background:linear-gradient(90deg,#efe0fb,#e4f2fd);border:1px solid #cbb0ec;color:#7a2a9e;font-size:12.5px;font-weight:700;text-decoration:none">Add this calendar to yours</a>
      <br><br>To unsubscribe, leave the group at
      <a href="https://groups.google.com/g/vortex-group-calls" style="color:#9a8cb8">groups.google.com/g/vortex-group-calls</a>`)}
  </div>`;
}

// TRIGGER SETUP
// 1. sendLeadsNudge -- weekly, Saturday, 9-10am
// 2. sendGroupEmail -- weekly, Sunday, 9-10am
