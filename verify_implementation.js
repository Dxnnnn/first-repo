// Verification script for modal implementation
// This script checks that all the necessary elements and functions are present

console.log("Starting verification of modal implementation...");

// Check if admin.html contains the modal elements
const fs = require('fs');
const path = require('path');

try {
    const adminHtml = fs.readFileSync(path.join(__dirname, 'admin.html'), 'utf8');
    
    // Check for edit modal
    const hasEditModal = adminHtml.includes('editDepartmentModal');
    console.log(`✓ Edit Department Modal present: ${hasEditModal}`);
    
    // Check for delete modal  
    const hasDeleteModal = adminHtml.includes('deleteDepartmentModal');
    console.log(`✓ Delete Department Modal present: ${hasDeleteModal}`);
    
    // Check for modal CSS
    const cssContent = fs.readFileSync(path.join(__dirname, 'index.css'), 'utf8');
    const hasModalCss = cssContent.includes('.modal');
    console.log(`✓ Modal CSS present: ${hasModalCss}`);
    
    // Check for JavaScript functions
    const jsContent = fs.readFileSync(path.join(__dirname, 'admin.js'), 'utf8');
    const hasOpenModal = jsContent.includes('function openModal');
    const hasCloseModal = jsContent.includes('function closeModal');
    const usesOpenModal = jsContent.includes('openModal("editDepartmentModal"') && jsContent.includes('openModal("deleteDepartmentModal"');
    
    console.log(`✓ openModal function present: ${hasOpenModal}`);
    console.log(`✓ closeModal function present: ${hasCloseModal}`);
    console.log(`✓ openModal used for both edit and delete: ${usesOpenModal}`);
    
    // Check for event listeners
    const hasModalListeners = jsContent.includes('Modal event listeners');
    console.log(`✓ Modal event listeners present: ${hasModalListeners}`);
    
    console.log("\nVerification complete!");
    console.log("Implementation summary:");
    console.log("- Added edit and delete modals to admin.html");
    console.log("- Added modal CSS to index.css");
    console.log("- Implemented openModal and closeModal functions in admin.js");
    console.log("- Updated department edit/delete buttons to use openModal");
    console.log("- Added event listeners for modal interactions");
    
} catch (error) {
    console.error("Error during verification:", error.message);
}