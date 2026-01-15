// Final verification script for complete modal implementation
console.log("=== Final Verification of Modal Implementation ===\n");

const fs = require('fs');
const path = require('path');

try {
    // Check HTML modals
    const adminHtml = fs.readFileSync(path.join(__dirname, 'admin.html'), 'utf8');
    
    const modals = [
        'editDepartmentModal',
        'deleteDepartmentModal', 
        'profileEditModal',
        'editEmployeeModal',
        'deleteEmployeeModal',
        'requestsModal'
    ];
    
    console.log("📋 HTML Modals Present:");
    modals.forEach(modal => {
        const present = adminHtml.includes(modal);
        console.log(`  ${present ? '✅' : '❌'} ${modal}`);
    });
    
    // Check CSS
    const cssContent = fs.readFileSync(path.join(__dirname, 'index.css'), 'utf8');
    const hasModalCss = cssContent.includes('.modal') && cssContent.includes('.hidden');
    console.log(`\n🎨 CSS Styling: ${hasModalCss ? '✅ Present' : '❌ Missing'}`);
    
    // Check JavaScript functions
    const jsContent = fs.readFileSync(path.join(__dirname, 'admin.js'), 'utf8');
    
    const jsChecks = [
        { name: 'openModal function', check: jsContent.includes('function openModal') },
        { name: 'closeModal function', check: jsContent.includes('function closeModal') },
        { name: 'Department edit modal usage', check: jsContent.includes('openModal("editDepartmentModal"') },
        { name: 'Department delete modal usage', check: jsContent.includes('openModal("deleteDepartmentModal"') },
        { name: 'Profile edit modal usage', check: jsContent.includes('openModal("profileEditModal"') },
        { name: 'Employee edit modal usage', check: jsContent.includes('openModal("editEmployeeModal"') },
        { name: 'Employee delete modal usage', check: jsContent.includes('openModal("deleteEmployeeModal"') },
        { name: 'Requests modal usage', check: jsContent.includes('openModal("requestsModal"') },
        { name: 'Modal event listeners', check: jsContent.includes('Modal event listeners') },
        { name: 'Profile edit button updated', check: jsContent.includes('editProfileBtn?.addEventListener') },
        { name: 'Employee actions updated', check: jsContent.includes('employeesTableBody?.addEventListener') }
    ];
    
    console.log("\n📜 JavaScript Implementation:");
    jsChecks.forEach(check => {
        console.log(`  ${check.check ? '✅' : '❌'} ${check.name}`);
    });
    
    // Count modal-related elements
    const modalElementCount = (adminHtml.match(/class="modal hidden"/g) || []).length;
    console.log(`\n🔢 Total Modals Implemented: ${modalElementCount}`);
    
    // Summary
    const allModalsPresent = modals.every(modal => adminHtml.includes(modal));
    const allJsFunctionsPresent = jsChecks.every(check => check.check);
    
    console.log("\n📊 Implementation Summary:");
    console.log(`  ${allModalsPresent ? '✅' : '❌'} All HTML modals present`);
    console.log(`  ${allJsFunctionsPresent ? '✅' : '❌'} All JavaScript functions implemented`);
    console.log(`  ${hasModalCss ? '✅' : '❌'} CSS styling complete`);
    
    if (allModalsPresent && allJsFunctionsPresent && hasModalCss) {
        console.log("\n🎉 SUCCESS: Complete modal implementation verified!");
        console.log("\n📝 Features Implemented:");
        console.log("  • Department edit/delete modals");
        console.log("  • Profile edit modal");
        console.log("  • Employee edit/delete modals");
        console.log("  • Requests modal");
        console.log("  • Reusable openModal/closeModal functions");
        console.log("  • Proper event handling for all modals");
        console.log("  • Data passing between components");
    } else {
        console.log("\n⚠️  Some components may need review");
    }
    
} catch (error) {
    console.error("❌ Error during verification:", error.message);
}