// Simple toast utility - replace with your preferred toast library
type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

class ToastManager {
  private toasts: Map<string, HTMLElement> = new Map();
  private container: HTMLElement | null = null;

  private ensureContainer() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.className = 'fixed top-4 right-4 z-50 space-y-2';
      document.body.appendChild(this.container);
    }
    return this.container;
  }

  private createToast(message: string, type: ToastType, options: ToastOptions = {}) {
    const container = this.ensureContainer();
    const id = Math.random().toString(36).substr(2, 9);
    
    const toast = document.createElement('div');
    toast.className = `
      max-w-sm p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full
      ${this.getTypeStyles(type)}
    `;
    
    const icon = this.getIcon(type);
    toast.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="flex-shrink-0">${icon}</div>
        <div class="flex-1">
          <p class="text-sm font-medium">${message}</p>
        </div>
        <button class="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 focus:outline-none">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    `;
    
    // Add close functionality
    const closeBtn = toast.querySelector('button');
    closeBtn?.addEventListener('click', () => this.removeToast(id));
    
    container.appendChild(toast);
    this.toasts.set(id, toast);
    
    // Animate in
    requestAnimationFrame(() => {
      toast.classList.remove('translate-x-full');
      toast.classList.add('translate-x-0');
    });
    
    // Auto remove
    const duration = options.duration || 5000;
    setTimeout(() => {
      this.removeToast(id);
    }, duration);
    
    return id;
  }
  
  private removeToast(id: string) {
    const toast = this.toasts.get(id);
    if (toast) {
      toast.classList.add('translate-x-full', 'opacity-0');
      setTimeout(() => {
        toast.remove();
        this.toasts.delete(id);
        
        // Remove container if empty
        if (this.toasts.size === 0 && this.container) {
          this.container.remove();
          this.container = null;
        }
      }, 300);
    }
  }
  
  private getTypeStyles(type: ToastType): string {
    switch (type) {
      case 'success':
        return 'bg-green-50 border border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border border-yellow-200 text-yellow-800';
      case 'info':
      default:
        return 'bg-blue-50 border border-blue-200 text-blue-800';
    }
  }
  
  private getIcon(type: ToastType): string {
    switch (type) {
      case 'success':
        return '<svg class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>';
      case 'error':
        return '<svg class="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>';
      case 'warning':
        return '<svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>';
      case 'info':
      default:
        return '<svg class="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>';
    }
  }
  
  success(message: string, options?: ToastOptions) {
    return this.createToast(message, 'success', options);
  }
  
  error(message: string, options?: ToastOptions) {
    return this.createToast(message, 'error', options);
  }
  
  info(message: string, options?: ToastOptions) {
    return this.createToast(message, 'info', options);
  }
  
  warning(message: string, options?: ToastOptions) {
    return this.createToast(message, 'warning', options);
  }
}

const toastManager = new ToastManager();

export const toast = {
  success: (message: string, options?: ToastOptions) => toastManager.success(message, options),
  error: (message: string, options?: ToastOptions) => toastManager.error(message, options),
  info: (message: string, options?: ToastOptions) => toastManager.info(message, options),
  warning: (message: string, options?: ToastOptions) => toastManager.warning(message, options),
};