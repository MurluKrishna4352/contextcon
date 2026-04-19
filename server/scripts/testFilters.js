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
    console.log(`  ✅ ${filter_type}: "${value}"`)
    return true
  } catch (err) {
    const msg = err.response?.data?.non_field_errors?.[0] || err.message
    console.log(`  ❌ ${filter_type}: "${value}" — ${msg}`)
    return false
  }
}

async function run() {
  console.log('\n=== Testing INDUSTRY values ===')
  const industries = [
    'Computer Software', 'Information Technology and Services', 'Internet',
    'Financial Services', 'Hospital & Health Care', 'E-Learning',
    'Renewables & Environment', 'Real Estate', 'Legal Services',
    'Human Resources', 'Marketing and Advertising', 'Retail',
    'Biotechnology', 'Telecommunications', 'Consumer Electronics',
    'Software', 'Technology', 'SaaS', 'Fintech',
  ]
  const validIndustries = []
  for (const v of industries) {
    const ok = await testFilter('INDUSTRY', v)
    if (ok) validIndustries.push(v)
    await new Promise(r => setTimeout(r, 300))
  }

  console.log('\n=== Testing REGION values ===')
  const regions = [
    'India', 'United States', 'United Kingdom', 'Singapore',
    'Germany', 'Bangalore', 'Mumbai', 'San Francisco',
  ]
  const validRegions = []
  for (const v of regions) {
    const ok = await testFilter('REGION', v)
    if (ok) validRegions.push(v)
    await new Promise(r => setTimeout(r, 300))
  }

  console.log('\n=== Testing COMPANY_HEADCOUNT values ===')
  const headcounts = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1,001-5,000']
  for (const v of headcounts) {
    await testFilter('COMPANY_HEADCOUNT', v)
    await new Promise(r => setTimeout(r, 300))
  }

  console.log('\n=== VALID SUMMARY ===')
  console.log('Industries:', validIndustries)
  console.log('Regions:', validRegions)
}

run().catch(console.error)
