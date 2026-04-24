import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Ticket,
  Search,
  ArrowRight,
  LifeBuoy,
  Send,
  Wrench,
  CheckCircle2,
  Monitor,
  Wifi,
  Mail,
  Printer,
  KeyRound,
  HardDrive,
  Keyboard,
  Landmark,
  HelpCircle,
  ChevronDown,
  Lightbulb,
} from 'lucide-react'
import { fetchPublicCategories } from '../../services/publicTicketService'

const CATEGORY_ICONS = {
  Hardware: HardDrive,
  Software: Monitor,
  Network: Wifi,
  Account: KeyRound,
  Email: Mail,
  Printer: Printer,
  Peripherals: Keyboard,
  CBS: Landmark,
  Other: HelpCircle,
}

const TROUBLESHOOTING = [
  {
    icon: HardDrive,
    title: 'Computer won’t start or is frozen',
    steps: [
      'Check that the power cable and monitor cable are firmly plugged in.',
      'Press and hold the power button for 10 seconds to force a shutdown, then turn it back on.',
      'Try a different power outlet if the PC shows no lights at all.',
      'If frozen on a program, press Ctrl + Alt + Delete and open Task Manager to end it.',
    ],
  },
  {
    icon: Wifi,
    title: 'Internet or WiFi is not working',
    steps: [
      'Check if colleagues nearby are also affected — it may be a branch-wide issue.',
      'Disconnect and reconnect to the WiFi network.',
      'Restart your computer — this fixes most connectivity glitches.',
      'Unplug the LAN cable for 5 seconds and plug it back in.',
    ],
  },
  {
    icon: KeyRound,
    title: 'Cannot log in to a system',
    steps: [
      'Make sure CAPS LOCK is off and you’re typing the correct username.',
      'Type the password slowly — small typos are the #1 cause of lockouts.',
      'Check your keyboard language (EN vs. FIL) at the bottom-right of the screen.',
      'If you mistyped 3+ times, wait 5 minutes before trying again to avoid a lockout.',
    ],
  },
  {
    icon: Printer,
    title: 'Printer problems',
    steps: [
      'Confirm the printer is powered on and the status light is steady (not blinking).',
      'Check paper tray is loaded and no paper is jammed.',
      'Open the print queue — delete any stuck print jobs, then try again.',
      'Power-cycle the printer: turn it off, wait 10 seconds, turn it back on.',
    ],
  },
  {
    icon: Mail,
    title: 'Email issues',
    steps: [
      'Check your internet connection first — email needs the network to work.',
      'Close and reopen Outlook (or your email app).',
      'Look in the Junk / Spam folder if you’re missing a message.',
      'Try accessing webmail in a browser to rule out the desktop client.',
    ],
  },
  {
    icon: Monitor,
    title: 'An app or program is slow or crashing',
    steps: [
      'Close the program fully (File → Exit), then reopen it.',
      'Restart your computer — this clears most memory issues.',
      'Close other apps you aren’t using to free up memory.',
      'Note the exact error message (take a screenshot) so MIS can diagnose faster.',
    ],
  },
  {
    icon: Landmark,
    title: 'CBS (Core Banking) errors',
    steps: [
      'Write down the exact error code or message.',
      'Log out of CBS completely and log back in.',
      'Ask a colleague if they see the same error — it may be a system-wide outage.',
      'Do NOT repeat the transaction if you’re unsure whether it went through.',
    ],
  },
  {
    icon: Keyboard,
    title: 'Keyboard, mouse, or monitor not working',
    steps: [
      'Unplug and firmly re-plug the USB / cable into the computer.',
      'Try a different USB port on the same computer.',
      'If wireless, replace the batteries or check the USB dongle is plugged in.',
      'Restart the computer with the peripheral already connected.',
    ],
  },
]

function normalizeList(raw) {
  if (!raw) return []
  if (Array.isArray(raw?.data?.data)) return raw.data.data
  if (Array.isArray(raw?.data)) return raw.data
  if (Array.isArray(raw)) return raw
  return []
}

function PublicHelpdeskHome() {
  const { data: categoriesRaw } = useQuery({
    queryKey: ['public-helpdesk-categories'],
    queryFn: async () => (await fetchPublicCategories()).data,
    staleTime: 10 * 60 * 1000,
  })

  const categories = normalizeList(categoriesRaw)

  return (
    <div className="space-y-10 sm:space-y-14">
      {/* Hero */}
      <section className="text-center py-6 sm:py-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold mb-4">
          <LifeBuoy className="w-3.5 h-3.5" />
          Employee Self-Service
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
          Having an IT issue?
          <br />
          <span className="text-indigo-600">We're here to help.</span>
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-sm sm:text-base text-slate-600">
          Report a concern, track its progress, or reach out to our MIS team — all in one place.
          No login required.
        </p>

        <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/public-helpdesk/submit"
            className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm transition-colors"
          >
            <Ticket className="w-4 h-4" />
            Submit a Ticket
          </Link>
          <Link
            to="/public-helpdesk/track"
            className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <Search className="w-4 h-4" />
            Track a Ticket
          </Link>
        </div>
      </section>

      {/* Quick-action cards (redundant with hero but useful for scanners) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <Link
          to="/public-helpdesk/submit"
          className="group bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm hover:shadow-lg hover:border-indigo-300 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
            <Ticket className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Submit a Ticket</h3>
          <p className="text-sm text-slate-600 mb-4">
            Report a hardware issue, software problem, network trouble, or any other IT concern.
          </p>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 group-hover:gap-2.5 transition-all">
            Start now <ArrowRight className="w-4 h-4" />
          </span>
        </Link>

        <Link
          to="/public-helpdesk/track"
          className="group bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm hover:shadow-lg hover:border-emerald-300 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Track a Ticket</h3>
          <p className="text-sm text-slate-600 mb-4">
            Enter your ticket number (e.g. <span className="font-mono text-xs">TKT-2026-000001</span>) to see
            status, remarks, and resolution.
          </p>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 group-hover:gap-2.5 transition-all">
            Check status <ArrowRight className="w-4 h-4" />
          </span>
        </Link>
      </section>

      {/* How it works */}
      <section>
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 text-center mb-6">
          How it works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 text-center">
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 mx-auto flex items-center justify-center mb-3">
              <Send className="w-5 h-5" />
            </div>
            <div className="text-xs font-semibold text-indigo-600 mb-1">Step 1</div>
            <h3 className="font-bold text-slate-900 mb-1">Submit your concern</h3>
            <p className="text-sm text-slate-600">
              Pick your name, describe the issue, and save the ticket number you receive.
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 text-center">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 mx-auto flex items-center justify-center mb-3">
              <Wrench className="w-5 h-5" />
            </div>
            <div className="text-xs font-semibold text-amber-600 mb-1">Step 2</div>
            <h3 className="font-bold text-slate-900 mb-1">MIS team takes over</h3>
            <p className="text-sm text-slate-600">
              Our IT staff triages your ticket, assigns it, and works on a fix.
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="text-xs font-semibold text-emerald-600 mb-1">Step 3</div>
            <h3 className="font-bold text-slate-900 mb-1">Track until resolved</h3>
            <p className="text-sm text-slate-600">
              Use your ticket number to watch status updates and see the resolution.
            </p>
          </div>
        </div>
      </section>

      {/* Categories at a glance */}
      {categories.length > 0 && (
        <section>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              What can you report?
            </h2>
            <Link
              to="/public-helpdesk/submit"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Submit now →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {categories.map((c) => {
              const Icon = CATEGORY_ICONS[c.name] || HelpCircle
              return (
                <div
                  key={c.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-3"
                >
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-slate-900">{c.name}</div>
                    {c.description && (
                      <div className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                        {c.description}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Troubleshooting — try these first */}
      <section>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 sm:p-6">
          <div className="flex items-start gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-800 flex items-center justify-center shrink-0">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Try these quick fixes first
              </h2>
              <p className="text-sm text-slate-700 mt-0.5">
                Many common issues can be fixed in under a minute. If one of these works,
                you won't even need to file a ticket.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {TROUBLESHOOTING.map((item, idx) => {
              const Icon = item.icon
              return (
                <details
                  key={idx}
                  className="group bg-white border border-amber-100 rounded-xl overflow-hidden"
                >
                  <summary className="list-none cursor-pointer px-4 py-3 flex items-center justify-between gap-3 hover:bg-amber-50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold text-slate-900 truncate">
                        {item.title}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-500 shrink-0 transition-transform group-open:rotate-180" />
                  </summary>
                  <ol className="list-decimal pl-10 pr-4 pb-4 pt-1 space-y-1.5 text-sm text-slate-700">
                    {item.steps.map((step, sIdx) => (
                      <li key={sIdx}>{step}</li>
                    ))}
                  </ol>
                </details>
              )
            })}
          </div>

          <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
            <p className="text-slate-700">
              <span className="font-semibold">Still stuck?</span> No problem — submit a ticket and
              we'll take it from here.
            </p>
            <Link
              to="/public-helpdesk/submit"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shrink-0"
            >
              <Ticket className="w-3.5 h-3.5" />
              Submit a Ticket
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ / tips */}
      <section>
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4">Tips for a faster fix</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="font-semibold text-slate-900 mb-1">Include your contact number</div>
            <p className="text-slate-600">
              So MIS can reach you quickly if they need more info or when the fix is ready.
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="font-semibold text-slate-900 mb-1">Add your AnyDesk number if available</div>
            <p className="text-slate-600">
              Lets our team provide remote-desktop support without you leaving your seat.
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="font-semibold text-slate-900 mb-1">Attach screenshots when you can</div>
            <p className="text-slate-600">
              A picture of the error message is usually faster than a long description.
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="font-semibold text-slate-900 mb-1">Save your ticket number</div>
            <p className="text-slate-600">
              You'll receive a <span className="font-mono text-xs">TKT-YYYY-NNNNNN</span> number
              after submitting — use it on the Track page to see progress.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom callout */}
      <section className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-center shadow-md">
        <h2 className="text-xl sm:text-2xl font-bold text-white">Ready to get help?</h2>
        <p className="mt-2 text-sm sm:text-base text-indigo-100">
          Submitting a ticket only takes a minute.
        </p>
        <Link
          to="/public-helpdesk/submit"
          className="mt-5 inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-indigo-700 bg-white rounded-xl hover:bg-indigo-50 transition-colors"
        >
          <Ticket className="w-4 h-4" />
          Submit a Ticket
        </Link>
      </section>
    </div>
  )
}

export default PublicHelpdeskHome
