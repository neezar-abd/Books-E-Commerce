const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const path = require('path');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function compareNames() {
    // Get Excel subcategories
    const excelPath = path.join(__dirname, '..', 'kategori.xlsx');
    const workbook = XLSX.readFile(excelPath);
    const worksheet = workbook.Sheets[workbook.SheetNames[1]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    const excelSubcats = jsonData[1].filter(s => s && s !== '-');

    // Get DB categories
    const { data: dbCats } = await supabase
        .from('categories')
        .select('name')
        .order('name');

    console.log('\n📋 Excel Subcategories (first 15):');
    excelSubcats.slice(0, 15).forEach((s, i) => console.log(`   ${i + 1}. "${s}"`));

    console.log('\n📚 Database Categories (first 15):');
    dbCats.slice(0, 15).forEach((c, i) => console.log(`   ${i + 1}. "${c.name}"`));

    console.log(`\n📊 Excel: ${excelSubcats.length} subcategories`);
    console.log(`📊 Database: ${dbCats.length} categories`);
}

compareNames();
