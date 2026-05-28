class Terminal {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.history = [];
    }

    print(text) {
        const line = document.createElement('div');
        line.textContent = text;
        line.style.marginBottom = '2px';
        this.container.appendChild(line);
        this.scrollToBottom();
    }

    printError(text) {
        const line = document.createElement('div');
        line.textContent = text;
        line.style.color = '#ef4444';
        line.style.marginBottom = '2px';
        this.container.appendChild(line);
        this.scrollToBottom();
    }

    clear() {
        this.container.innerHTML = '';
    }

    scrollToBottom() {
        this.container.scrollTop = this.container.scrollHeight;
    }

    printBanner() {
        this.print('Cobra Python Runner - Ready');
        this.print('WASM Acceleration Active');
        this.print('');
    }
}
