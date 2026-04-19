require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const axios = require('axios')

const crustdata = axios.create({
  baseURL: 'https://api.crustdata.com',
  timeout: 10000,
  headers: {
    Authorization: `Token ${process.env.CRUSTDATA_API_KEY}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

async function testFilter(filter_type, value) {
  try {
    await crustdata.post('/screener/company/search', {
      filters: [{ filter_type, type: 'in', value: [value] }],
      page: 1,
    })
    console.log(`  ✅ "${value}"`)
    return true
  } catch (err) {
    const msg = err.response?.data?.non_field_errors?.[0] || err.message
    // Extract valid values hint if present
    const hint = msg.match(/Correct values are (\[.+\])/)?.[1] || ''
    console.log(`  ❌ "${value}"${hint ? ' → ' + hint : ''}`)
    return false
  }
}

async function run() {
  console.log('\n=== Tech/Software INDUSTRY values (LinkedIn new taxonomy) ===')
  const techIndustries = [
    'Technology, Information and Internet',
    'Software Development',
    'IT Services and IT Consulting',
    'Computer and Network Security',
    'Information Services',
    'Computer Hardware',
    'Semiconductor Manufacturing',
    'Artificial Intelligence',
    'Internet Marketplace Platforms',
    'Data Infrastructure and Analytics',
    'Mobile Computing Software Products',
    'Business Intelligence Platforms',
    'Embedded Software Products',
    'Cloud Computing',
    'Venture Capital and Private Equity Principals',
    'Financial Technology & Automated Investing',
  ]
  const valid = []
  for (const v of techIndustries) {
    const ok = await testFilter('INDUSTRY', v)
    if (ok) valid.push(v)
    await new Promise(r => setTimeout(r, 300))
  }

  console.log('\n=== More REGION values ===')
  const regions = [
    'Australia', 'Canada', 'France', 'Netherlands', 'Israel',
    'Brazil', 'Indonesia', 'Malaysia', 'Vietnam', 'Philippines',
    'Japan', 'South Korea', 'China', 'United Arab Emirates',
    'Kenya', 'Nigeria', 'South Africa',
  ]
  const validRegions = []
  for (const v of regions) {
    const ok = await testFilter('REGION', v)
    if (ok) validRegions.push(v)
    await new Promise(r => setTimeout(r, 300))
  }

  console.log('\n=== HEADCOUNT with correct format ===')
  await testFilter('COMPANY_HEADCOUNT', '501-1,000')
  await testFilter('COMPANY_HEADCOUNT', '5,001-10,000')
  await testFilter('COMPANY_HEADCOUNT', '10,001+')

  console.log('\n=== VALID TECH INDUSTRIES ===')
  console.log(valid)
  console.log('\n=== VALID REGIONS ===')
  console.log(validRegions)
}

run().catch(console.error)
