import { motion, AnimatePresence } from 'framer-motion'

export function RemarksSection({ modifiedCount, remarks, setRemarks, transitionMode }) {
  return (
    <AnimatePresence>
      {modifiedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm"
        >
          <label className="block text-sm font-semibold text-slate-900 mb-3">
            Remarks <span className="text-slate-500 font-normal">(Optional)</span>
          </label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Add notes about this transition batch (e.g., 'Q1 2026 Department Restructuring')"
            rows={3}
            className={`w-full px-4 py-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:border-transparent resize-none ${
              transitionMode === 'branch' ? 'focus:ring-teal-500' : 'focus:ring-blue-500'
            }`}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
