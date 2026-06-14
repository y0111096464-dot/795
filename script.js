// ==========================================
// CART MANAGEMENT
// ==========================================

class CartManager {
    constructor() {
        this.cart = this.loadCart();
    }

    loadCart() {
        const saved = localStorage.getItem('cart');
        return saved ? JSON.parse(saved) : [];
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    addItem(product, quantity = 1) {
        const existingItem = this.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                ...product,
                quantity: quantity
            });
        }
        
        this.saveCart();
        this.updateCartUI();
        this.showNotification('تمت إضافة المنتج إلى السلة', 'success');
    }

    removeItem(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartUI();
    }

    updateQuantity(productId, quantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            item.quantity = Math.max(1, quantity);
            this.saveCart();
            this.updateCartUI();
        }
    }

    getTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getItemCount() {
        return this.cart.reduce((count, item) => count + item.quantity, 0);
    }

    clearCart() {
        this.cart = [];
        this.saveCart();
        this.updateCartUI();
    }

    updateCartUI() {
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            cartCount.textContent = this.getItemCount();
        }

        const cartItems = document.getElementById('cart-items');
        if (cartItems) {
            if (this.cart.length === 0) {
                cartItems.innerHTML = '<p class="empty-cart">السلة فارغة حالياً</p>';
            } else {
                cartItems.innerHTML = this.cart.map(item => `
                    <div class="cart-item">
                        <div class="cart-item-info">
                            <div class="cart-item-name">${item.name}</div>
                            <div class="cart-item-price">${item.price} د.ل</div>
                            <div class="cart-item-controls">
                                <button class="quantity-btn minus-qty" data-id="${item.id}">−</button>
                                <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-id="${item.id}">
                                <button class="quantity-btn plus-qty" data-id="${item.id}">+</button>
                                <button class="remove-item" data-id="${item.id}">حذف</button>
                            </div>
                        </div>
                    </div>
                `).join('');

                // Add event listeners for quantity controls
                document.querySelectorAll('.minus-qty').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const id = parseInt(e.target.dataset.id);
                        const item = this.cart.find(i => i.id === id);
                        this.updateQuantity(id, item.quantity - 1);
                    });
                });

                document.querySelectorAll('.plus-qty').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const id = parseInt(e.target.dataset.id);
                        const item = this.cart.find(i => i.id === id);
                        this.updateQuantity(id, item.quantity + 1);
                    });
                });

                document.querySelectorAll('.quantity-input').forEach(input => {
                    input.addEventListener('change', (e) => {
                        const id = parseInt(e.target.dataset.id);
                        this.updateQuantity(id, parseInt(e.target.value));
                    });
                });

                document.querySelectorAll('.remove-item').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const id = parseInt(e.target.dataset.id);
                        this.removeItem(id);
                        this.showNotification('تمت إزالة المنتج من السلة', 'info');
                    });
                });
            }
        }

        const cartTotal = document.getElementById('cart-total');
        if (cartTotal) {
            cartTotal.textContent = `${this.getTotal().toFixed(2)} د.ل`;
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            background-color: ${type === 'success' ? '#27ae60' : '#3498db'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 3000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// ==========================================
// FORM VALIDATION
// ==========================================

class FormValidator {
    static validateFullName(fullName) {
        return fullName.trim().length >= 3;
    }

    static validatePhone(phone) {
        const phoneRegex = /^[\d\+\-\s\(\)]+$/;
        return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 7;
    }

    static validateCity(city) {
        return city.trim().length > 0;
    }

    static validateAddress(address) {
        return address.trim().length >= 5;
    }

    static validateForm(formData) {
        const errors = {};

        if (!this.validateFullName(formData.fullName)) {
            errors.fullName = 'الاسم الثلاثي مطلوب ويجب أن يكون 3 أحرف على الأقل';
        }

        if (!this.validatePhone(formData.phone)) {
            errors.phone = 'رقم الهاتف غير صحيح';
        }

        if (!this.validateCity(formData.city)) {
            errors.city = 'يرجى اختيار مدينة';
        }

        if (!this.validateAddress(formData.address)) {
            errors.address = 'العنوان التفصيلي مطلوب ويجب أن يكون 5 أحرف على الأقل';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }
}

// ==========================================
// CHECKOUT HANDLER
// ==========================================

class CheckoutHandler {
    constructor(cartManager) {
        this.cart = cartManager;
        this.init();
    }

    init() {
        const form = document.getElementById('checkout-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleCheckout(e));
        }

        this.updateOrderSummary();
    }

    updateOrderSummary() {
        const orderItemsDiv = document.getElementById('order-items');
        const orderTotalsDiv = document.getElementById('order-totals');

        if (!this.cart.cart.length) {
            if (orderTotalsDiv) {
                orderTotalsDiv.style.display = 'none';
            }
            return;
        }

        if (orderTotalsDiv) {
            orderTotalsDiv.style.display = 'block';
        }

        if (orderItemsDiv) {
            orderItemsDiv.innerHTML = this.cart.cart.map(item => `
                <div class="order-item">
                    <div>
                        <div class="order-item-name">${item.name}</div>
                        <div class="order-item-qty">الكمية: ${item.quantity}</div>
                    </div>
                    <div class="order-item-total">${(item.price * item.quantity).toFixed(2)} د.ل</div>
                </div>
            `).join('');
        }

        const subtotal = this.cart.getTotal();
        const shipping = 20;
        const total = subtotal + shipping;

        const subtotalEl = document.getElementById('subtotal');
        const shippingEl = document.getElementById('shipping');
        const finalTotalEl = document.getElementById('final-total');

        if (subtotalEl) subtotalEl.textContent = `${subtotal.toFixed(2)} د.ل`;
        if (shippingEl) shippingEl.textContent = `${shipping} د.ل`;
        if (finalTotalEl) finalTotalEl.textContent = `${total.toFixed(2)} د.ل`;
    }

    handleCheckout(e) {
        e.preventDefault();

        // Get form data
        const formData = {
            fullName: document.getElementById('full-name').value,
            phone: document.getElementById('phone').value,
            city: document.getElementById('city').value,
            address: document.getElementById('address').value,
            notes: document.getElementById('notes').value
        };

        // Clear previous errors
        this.clearErrors();

        // Validate
        const validation = FormValidator.validateForm(formData);

        if (!validation.isValid) {
            this.showErrors(validation.errors);
            return;
        }

        // Save order
        const order = {
            id: this.generateOrderId(),
            date: new Date().toISOString(),
            customer: formData,
            items: this.cart.cart,
            subtotal: this.cart.getTotal(),
            shipping: 20,
            total: this.cart.getTotal() + 20,
            status: 'pending',
            paymentMethod: 'cash-on-delivery'
        };

        this.saveOrder(order);
        this.showSuccessModal(order);
    }

    generateOrderId() {
        return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }

    saveOrder(order) {
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        orders.push(order);
        localStorage.setItem('orders', JSON.stringify(orders));
    }

    clearErrors() {
        document.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
        });
        document.querySelectorAll('input, select, textarea').forEach(el => {
            el.classList.remove('error');
        });
    }

    showErrors(errors) {
        for (const [field, message] of Object.entries(errors)) {
            const input = document.getElementById(field);
            const errorEl = document.getElementById(`error-${field}`);

            if (input) {
                input.classList.add('error');
            }
            if (errorEl) {
                errorEl.textContent = message;
            }
        }
    }

    showSuccessModal(order) {
        const modal = document.getElementById('success-modal');
        const orderNumber = document.getElementById('order-number');
        const whatsappBtn = document.getElementById('whatsapp-confirm-btn');

        if (orderNumber) {
            orderNumber.textContent = order.id;
        }

        if (modal) {
            modal.classList.add('active');
        }

        // Clear cart
        this.cart.clearCart();

        if (whatsappBtn) {
            whatsappBtn.addEventListener('click', () => {
                this.sendViaWhatsApp(order);
            });
        }

        // Close modal
        const closeBtn = document.getElementById('close-success-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('active');
            });
        }
    }

    sendViaWhatsApp(order) {
        const whatsappNumber = '218921234567'; // Replace with actual WhatsApp number
        
        let message = `مرحباً، أنا أريد تأكيد الطلب رقم ${order.id}\n\n`;
        message += `*البيانات الشخصية:*\n`;
        message += `الاسم: ${order.customer.fullName}\n`;
        message += `رقم الهاتف: ${order.customer.phone}\n`;
        message += `المدينة: ${order.customer.city}\n`;
        message += `العنوان: ${order.customer.address}\n\n`;
        
        message += `*المنتجات:*\n`;
        order.items.forEach(item => {
            message += `- ${item.name} x ${item.quantity} = ${item.price * item.quantity} د.ل\n`;
        });
        
        message += `\n*الإجمالي:* ${order.total} د.ل\n`;
        
        if (order.customer.notes) {
            message += `\n*ملاحظات:* ${order.customer.notes}`;
        }

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
        
        window.open(whatsappUrl, '_blank');
    }
}

// ==========================================
// DOM READY - INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize cart manager
    const cartManager = new CartManager();
    cartManager.updateCartUI();

    // Cart sidebar toggle
    const cartBtn = document.getElementById('cart-btn');
    const cartSidebar = document.getElementById('cart-sidebar');
    const closeCartBtn = document.getElementById('close-cart');
    const closeCartBtnBottom = document.getElementById('close-cart-btn');

    if (cartBtn && cartSidebar) {
        cartBtn.addEventListener('click', () => {
            cartSidebar.classList.add('active');
        });
    }

    if (closeCartBtn && cartSidebar) {
        closeCartBtn.addEventListener('click', () => {
            cartSidebar.classList.remove('active');
        });
    }

    if (closeCartBtnBottom && cartSidebar) {
        closeCartBtnBottom.addEventListener('click', () => {
            cartSidebar.classList.remove('active');
        });
    }

    // Add to cart buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productData = JSON.parse(btn.dataset.product);
            cartManager.addItem(productData);
        });
    });

    // Mobile menu toggle
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.querySelector('.navbar-menu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });

        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
            });
        });
    }

    // Checkout page
    if (document.getElementById('checkout-form')) {
        new CheckoutHandler(cartManager);
    }

    // Close cart when clicking outside
    document.addEventListener('click', (e) => {
        if (cartSidebar && 
            !cartSidebar.contains(e.target) && 
            !cartBtn.contains(e.target)) {
            cartSidebar.classList.remove('active');
        }
    });

    // Animation for slide in/out
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
        }
        @keyframes slideOut {
            from { transform: translateX(0); }
            to { transform: translateX(100%); }
        }
    `;
    document.head.appendChild(style);
});
