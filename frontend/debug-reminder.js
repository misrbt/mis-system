// DEBUG SCRIPT - Run this in browser console (F12)
// This will help diagnose why the reminder popup isn't showing

console.log('🔍 REPAIR REMINDER DEBUG SCRIPT')
console.log('================================\n')

// 1. Check localStorage
console.log('1️⃣ CHECKING LOCALSTORAGE:')
const isDismissed = localStorage.getItem('repair_reminders_dismissed')
const dismissedExpiry = localStorage.getItem('repair_reminders_dismissed_expiry')

console.log('   Dismissed:', isDismissed)
console.log('   Expiry:', dismissedExpiry)

if (isDismissed === 'true' && dismissedExpiry) {
    const expiryDate = new Date(dismissedExpiry)
    const now = new Date()
    console.log(`   ⏰ Dismissed until: ${expiryDate.toLocaleString()}`)
    console.log(`   ⏰ Current time: ${now.toLocaleString()}`)
    console.log(`   ⏰ Still dismissed: ${now < expiryDate}`)
}

// 2. Clear localStorage
console.log('\n2️⃣ CLEARING LOCALSTORAGE:')
localStorage.removeItem('repair_reminders_dismissed')
localStorage.removeItem('repair_reminders_dismissed_expiry')
console.log('   ✅ Cleared dismissal status')

// 3. Test API endpoint
console.log('\n3️⃣ TESTING API:')
fetch('http://localhost:8000/api/repairs/reminders?days=4')
    .then(res => res.json())
    .then(data => {
        console.log('   ✅ API Response:', data)

        if (data.success) {
            console.log('\n4️⃣ REMINDER DATA:')
            console.log('   Has reminders:', data.data.has_reminders)
            console.log('   Overdue count:', data.data.overdue.count)
            console.log('   Due soon count:', data.data.due_soon.count)

            if (data.data.overdue.count > 0) {
                console.log('\n   📋 Overdue repairs:')
                data.data.overdue.repairs.forEach(repair => {
                    console.log(`      - ${repair.asset_name} (${repair.days_overdue}d overdue)`)
                })
            }

            if (data.data.due_soon.count > 0) {
                console.log('\n   📋 Due soon repairs:')
                data.data.due_soon.repairs.forEach(repair => {
                    console.log(`      - ${repair.asset_name} (${repair.days_until_due}d left)`)
                })
            }

            if (!data.data.has_reminders) {
                console.log('\n   ⚠️  NO REPAIRS FOUND!')
                console.log('   💡 You need to create overdue repairs in the database')
                console.log('   💡 Run: php artisan db:seed --class=RepairReminderSampleSeeder')
            }
        } else {
            console.error('   ❌ API returned error:', data)
        }
    })
    .catch(error => {
        console.error('   ❌ API Error:', error)
    })

console.log('\n5️⃣ NEXT STEPS:')
console.log('   1. Refresh the page (F5)')
console.log('   2. Navigate to /inventory/home')
console.log('   3. Popup should appear if reminders exist')
console.log('   4. If still no popup, check console for errors')
