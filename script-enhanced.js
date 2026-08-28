// ==========================================
// CART MANAGEMENT - ENHANCED
// ==========================================

class CartManager {
    constructor() {
        this.cart = this.loadCart();
        this.initializeEventListeners();
    }

    loadCart() {
        try {
            const saved = localStorage.getItem('cart');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('خطأ في تحميل السلة:', error);
            return [];
        }
    }

    saveCart() {
        try {
            localStorage.setItem('cart', JSON.stringify(this.cart));
        } catch (error) {
            console.error('خطأ في حفظ السلة:', error);
        }
    }

    addItem(product, quantity = 1) {
        if (!product || !product.id) {
            this.showNotification('بيانات المنتج غير صحيحة', 'error');
            return false;
        }

        const existingItem = this.cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({ ...product, quantity });
        }
        this.saveCart();
        this.updateCartUI();
        this.showNotification(`تمت إضافة ${product.name} إلى السلة`, 'success');
        return true;
    }

    removeItem(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartUI();
    }

    updateQuantity(productId, quantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            item.quantity = Math.max(1, parseInt(quantity));
            if (item.quantity === 0) {
                this.removeItem(productId);
            } else {
                this.saveCart();
                this.updateCartUI();
            }
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

    initializeEventListeners() {
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('quantity-input')) {
                const id = parseInt(e.target.dataset.id);
                this.updateQuantity(id, e.target.value);
            }
        });

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('minus-qty')) {
                const id = parseInt(e.target.dataset.id);
                const item = this.cart.find(i => i.id === id);
                if (item) this.updateQuantity(id, item.quantity - 1);
            }

            if (e.target.classList.contains('plus-qty')) {
                const id = parseInt(e.target.dataset.id);
                const item = this.cart.find(i => i.id === id);
                if (item) this.updateQuantity(id, item.quantity + 1);
            }

            if (e.target.classList.contains('remove-item')) {
                const id = parseInt(e.target.dataset.id);
                this.removeItem(id);
                this.showNotification('تمت إزالة المنتج من السلة', 'info');
            }
        });
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
                        <div class="cart-item-image">
                            <img src="${item.image || 'https://via.placeholder.com/80x80'}" alt="${item.name}" loading="lazy">
                        </div>
                        <div class="cart-item-info">
                            <div class="cart-item-name">${this.escapeHtml(item.name)}</div>
                            <div class="cart-item-price">${item.price.toFixed(2)} د.ل</div>
                            <div class="cart-item-controls">
                                <button class="quantity-btn minus-qty" data-id="${item.id}" aria-label="تقليل الكمية">−</button>
                                <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="99" data-id="${item.id}" aria-label="كمية ${item.name}">
                                <button class="quantity-btn plus-qty" data-id="${item.id}" aria-label="زيادة الكمية">+</button>
                                <button class="remove-item" data-id="${item.id}" aria-label="حذف ${item.name}">حذف</button>
                            </div>
                        </div>
                    </div>
                `).join('');
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
        notification.setAttribute('role', 'status');
        notification.setAttribute('aria-live', 'polite');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            background-color: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 3000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            animation: slideInNotification 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutNotification 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// ==========================================
// FORM VALIDATION - ENHANCED
// ========================================== 

class FormValidator {
    static validateFullName(fullName) {
        const trimmed = fullName.trim();
        return trimmed.length >= 3 && trimmed.split(' ').length >= 2;
    }

    static validatePhone(phone) {
        const phoneRegex = /^[\d\+\-\s\(\)]{7,}$/;
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
            errors.phone = 'رقم الهاتف غير صحيح (يجب أن يكون 7 أرقام على الأقل)';
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
// CHECKOUT HANDLER - ENHANCED
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

        if (this.cart.cart.length === 0) {
            this.cart.showNotification('السلة فارغة، يرجى إضافة منتجات', 'error');
            return;
        }

        const formData = {
            fullName: document.getElementById('full-name')?.value || '',
            phone: document.getElementById('phone')?.value || '',
            city: document.getElementById('city')?.value || '',
            address: document.getElementById('address')?.value || '',
            notes: document.getElementById('notes')?.value || ''
        };

        this.clearErrors();

        const validation = FormValidator.validateForm(formData);

        if (!validation.isValid) {
            this.showErrors(validation.errors);
            this.cart.showNotification('يرجى تصحيح الأخطاء في النموذج', 'error');
            return;
        }

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
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9).toUpperCase();
        return `ORD-${timestamp}-${random}`;
    }

    saveOrder(order) {
        try {
            const orders = JSON.parse(localStorage.getItem('orders')) || [];
            orders.unshift(order);
            // احتفظ بآخر 100 طلب فقط
            localStorage.setItem('orders', JSON.stringify(orders.slice(0, 100)));
        } catch (error) {
            console.error('خطأ في حفظ الطلب:', error);
        }
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
                input.setAttribute('aria-invalid', 'true');
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
            modal.focus();
        }

        this.cart.clearCart();

        if (whatsappBtn) {
            whatsappBtn.onclick = () => this.sendViaWhatsApp(order);
        }

        const closeBtn = document.getElementById('close-success-modal');
        if (closeBtn) {
            closeBtn.onclick = () => {
                modal.classList.remove('active');
            };
        }
    }

    sendViaWhatsApp(order) {
        const whatsappNumber = '218921234567';
        
        let message = `مرحباً، أنا أريد تأكيد الطلب رقم ${order.id}\n\n`;
        message += `*البيانات الشخصية:*\n`;
        message += `الاسم: ${order.customer.fullName}\n`;
        message += `رقم الهاتف: ${order.customer.phone}\n`;
        message += `المدينة: ${order.customer.city}\n`;
        message += `العنوان: ${order.customer.address}\n\n`;
        
        message += `*المنتجات:*\n`;
        order.items.forEach(item => {
            message += `- ${item.name} x ${item.quantity} = ${(item.price * item.quantity).toFixed(2)} د.ل\n`;
        });
        
        message += `\n*الإجمالي:* ${order.total.toFixed(2)} د.ل\n`;
        
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
            closeCartBtn?.focus();
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
            try {
                const productData = JSON.parse(btn.dataset.product);
                cartManager.addItem(productData);
            } catch (error) {
                console.error('خطأ في إضافة المنتج:', error);
                cartManager.showNotification('خطأ في إضافة المنتج', 'error');
            }
        });
    });

    // Mobile menu toggle
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.querySelector('.navbar-menu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            const isActive = navMenu.classList.toggle('active');
            menuToggle.classList.toggle('active', isActive);
            navMenu.setAttribute('aria-expanded', isActive);
        });

        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                menuToggle.classList.remove('active');
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
            !cartBtn?.contains(e.target)) {
            cartSidebar.classList.remove('active');
        }
    });

    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInNotification {
            from { transform: translateX(-400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutNotification {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(-400px); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
});

// ==========================================
// LAZY LOADING IMAGES
// ==========================================

if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => imageObserver.observe(img));
}