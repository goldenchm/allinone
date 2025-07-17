// Main JavaScript file for Golden Chicken and Mutton Centre

// Utility functions
const Utils = {
    // Format currency
    formatCurrency: (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    },

    // Format date
    formatDate: (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    },

    // Format time
    formatTime: (dateString) => {
        return new Date(dateString).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    // Show notification
    showNotification: (message, type = 'success') => {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} notification-toast`;
        notification.innerHTML = `
            <i class="bi bi-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i>
            ${message}
        `;
        
        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease-in-out;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    },

    // Validate form data
    validateForm: (formData) => {
        const errors = [];
        
        if (!formData.product || formData.product.trim() === '') {
            errors.push('Product is required');
        }
        
        if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
            errors.push('Valid quantity is required');
        }
        
        return errors;
    },

    // Loading state management
    setLoadingState: (element, isLoading) => {
        if (isLoading) {
            element.classList.add('loading');
            element.disabled = true;
            if (element.tagName === 'BUTTON') {
                element.dataset.originalText = element.innerHTML;
                element.innerHTML = '<i class="bi bi-hourglass-split"></i> Loading...';
            }
        } else {
            element.classList.remove('loading');
            element.disabled = false;
            if (element.tagName === 'BUTTON' && element.dataset.originalText) {
                element.innerHTML = element.dataset.originalText;
            }
        }
    }
};

// Stock management functions
const StockManager = {
    // Add stock entry
    addStock: async (stockData) => {
        try {
            const response = await fetch('/add-stock', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(stockData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                Utils.showNotification('Stock entry added successfully!', 'success');
                return { success: true };
            } else {
                Utils.showNotification(result.error, 'danger');
                return { success: false, error: result.error };
            }
        } catch (error) {
            Utils.showNotification('Network error occurred', 'danger');
            return { success: false, error: 'Network error' };
        }
    }
};

// Sales management functions
const SalesManager = {
    // Add sale entry
    addSale: async (saleData) => {
        try {
            const response = await fetch('/add-sale', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(saleData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                Utils.showNotification('Sale completed successfully!', 'success');
                return { success: true, receipt: result.receipt };
            } else {
                Utils.showNotification(result.error, 'danger');
                return { success: false, error: result.error };
            }
        } catch (error) {
            Utils.showNotification('Network error occurred', 'danger');
            return { success: false, error: 'Network error' };
        }
    }
};

// Receipt management functions
const ReceiptManager = {
    // Generate receipt HTML
    generateReceiptHTML: (receipt) => {
        return `
            <div class="text-center">
                <h6>Golden Chicken and Mutton Centre</h6>
                <p class="mb-1">${receipt.branch} Branch</p>
                <p class="mb-1">Hyderabad</p>
                <hr>
                <p class="mb-1">Date: ${receipt.date}</p>
                <p class="mb-1">Time: ${receipt.time}</p>
                <hr>
            </div>
            
            <table class="table table-sm table-borderless">
                <tr>
                    <td>${receipt.product}</td>
                    <td class="text-end">${receipt.quantity} kg</td>
                </tr>
                <tr>
                    <td>Rate:</td>
                    <td class="text-end">₹${receipt.rate}/kg</td>
                </tr>
                <tr style="border-top: 1px solid #000;">
                    <td><strong>Total:</strong></td>
                    <td class="text-end"><strong>₹${receipt.total}</strong></td>
                </tr>
            </table>
            
            <div class="text-center">
                <hr>
                <p class="mb-0">Thank you for your business!</p>
            </div>
        `;
    },

    // Print receipt for thermal printer
    printThermalReceipt: (receipt) => {
        const receiptHTML = ReceiptManager.generateReceiptHTML(receipt);
        const printWindow = window.open('', '_blank');
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Receipt</title>
                <style>
                    @media print {
                        @page {
                            size: 58mm auto;
                            margin: 0;
                        }
                        body {
                            font-family: monospace;
                            font-size: 12px;
                            margin: 5mm;
                            width: 48mm;
                        }
                        .text-center { text-align: center; }
                        .text-end { text-align: right; }
                        table { width: 100%; border-collapse: collapse; }
                        hr { border: 1px solid #000; margin: 5px 0; }
                        h6 { margin: 0; font-size: 14px; }
                        p { margin: 2px 0; }
                    }
                    body {
                        font-family: monospace;
                        font-size: 12px;
                        margin: 5mm;
                        width: 48mm;
                    }
                    .text-center { text-align: center; }
                    .text-end { text-align: right; }
                    table { width: 100%; border-collapse: collapse; }
                    hr { border: 1px solid #000; margin: 5px 0; }
                    h6 { margin: 0; font-size: 14px; }
                    p { margin: 2px 0; }
                </style>
            </head>
            <body>
                ${receiptHTML}
            </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
    }
};

// Form validation and submission handlers
document.addEventListener('DOMContentLoaded', function() {
    // Smart unit selection based on product
    const productSelects = document.querySelectorAll('select[name="product"]');
    productSelects.forEach(productSelect => {
        productSelect.addEventListener('change', function() {
            const unitSelect = document.querySelector('select[name="unit"]');
            if (unitSelect) {
                const selectedProduct = this.value;
                
                // Auto-select appropriate unit based on product
                if (selectedProduct === 'Thalakaya') {
                    unitSelect.value = 'pieces';
                    // Update label
                    const quantityLabel = document.querySelector('label[for="quantity"]');
                    if (quantityLabel) {
                        quantityLabel.textContent = 'Quantity (Pieces)';
                    }
                } else if (['Chicken', 'Mutton', 'Boti'].includes(selectedProduct)) {
                    unitSelect.value = 'kg';
                    // Update label
                    const quantityLabel = document.querySelector('label[for="quantity"]');
                    if (quantityLabel) {
                        quantityLabel.textContent = 'Quantity (kg)';
                    }
                } else {
                    unitSelect.value = '';
                    const quantityLabel = document.querySelector('label[for="quantity"]');
                    if (quantityLabel) {
                        quantityLabel.textContent = 'Quantity';
                    }
                }
            }
        });
    });
    // Auto-calculate totals in sales forms
    const quantityInputs = document.querySelectorAll('input[name="quantity"]');
    const rateInputs = document.querySelectorAll('input[name="rate"]');
    
    quantityInputs.forEach(input => {
        input.addEventListener('input', calculateTotal);
    });
    
    rateInputs.forEach(input => {
        input.addEventListener('input', calculateTotal);
    });
    
    function calculateTotal() {
        const quantityInput = document.querySelector('input[name="quantity"]');
        const rateInput = document.querySelector('input[name="rate"]');
        const totalInput = document.querySelector('input[name="total"]');
        
        if (quantityInput && rateInput && totalInput) {
            const quantity = parseFloat(quantityInput.value) || 0;
            const rate = parseFloat(rateInput.value) || 0;
            const total = quantity * rate;
            totalInput.value = total.toFixed(2);
        }
    }
    
    // Form submission handlers
    const stockForm = document.getElementById('stockForm');
    if (stockForm) {
        stockForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitButton = this.querySelector('button[type="submit"]');
            Utils.setLoadingState(submitButton, true);
            
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            const errors = Utils.validateForm(data);
            if (errors.length > 0) {
                Utils.showNotification(errors.join(', '), 'danger');
                Utils.setLoadingState(submitButton, false);
                return;
            }
            
            const result = await StockManager.addStock(data);
            
            if (result.success) {
                this.reset();
                // Set today's date as default
                const dateInput = this.querySelector('input[name="date"]');
                if (dateInput) {
                    dateInput.value = new Date().toISOString().split('T')[0];
                }
            }
            
            Utils.setLoadingState(submitButton, false);
        });
    }
    
    const salesForm = document.getElementById('salesForm');
    if (salesForm) {
        salesForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitButton = this.querySelector('button[type="submit"]');
            Utils.setLoadingState(submitButton, true);
            
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            const errors = Utils.validateForm(data);
            if (errors.length > 0) {
                Utils.showNotification(errors.join(', '), 'danger');
                Utils.setLoadingState(submitButton, false);
                return;
            }
            
            const result = await SalesManager.addSale(data);
            
            if (result.success) {
                this.reset();
                document.querySelector('input[name="total"]').value = '';
                
                // Show receipt modal if available
                if (result.receipt && typeof showReceipt === 'function') {
                    showReceipt(result.receipt);
                }
            }
            
            Utils.setLoadingState(submitButton, false);
        });
    }
    
    // Set default dates
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        if (!input.value) {
            input.value = new Date().toISOString().split('T')[0];
        }
    });
    
    // Initialize tooltips if Bootstrap is available
    if (typeof bootstrap !== 'undefined') {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
});

// Export functions for global use
window.Utils = Utils;
window.StockManager = StockManager;
window.SalesManager = SalesManager;
window.ReceiptManager = ReceiptManager;