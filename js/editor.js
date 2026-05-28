class CodeEditor {
    constructor(textareaId) {
        this.textarea = document.getElementById(textareaId);
        this.initAutoIndent();
        this.initTabHandler();
        this.initPasteHandler();
    }

    initAutoIndent() {
        this.textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.handleNewline();
            } else if (e.key === 'Tab') {
                e.preventDefault();
                this.handleTab();
            } else if (e.key === 'Backspace') {
                this.handleBackspace();
            }
        });
    }

    handleNewline() {
        const start = this.textarea.selectionStart;
        const end = this.textarea.selectionEnd;
        const value = this.textarea.value;
        
        // Get current line
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const currentLine = value.substring(lineStart, start);
        
        // Calculate indent
        let indent = '';
        const match = currentLine.match(/^\s*/);
        if (match) {
            indent = match[0];
            // Add extra indent for colon
            if (currentLine.trim().endsWith(':')) {
                indent += '    ';
            }
        }
        
        const newValue = value.substring(0, start) + '\n' + indent + value.substring(end);
        this.textarea.value = newValue;
        this.textarea.selectionStart = this.textarea.selectionEnd = start + 1 + indent.length;
    }

    handleTab() {
        const start = this.textarea.selectionStart;
        const end = this.textarea.selectionEnd;
        const value = this.textarea.value;
        
        if (start === end) {
            // Insert 4 spaces at cursor
            this.textarea.value = value.substring(0, start) + '    ' + value.substring(end);
            this.textarea.selectionStart = this.textarea.selectionEnd = start + 4;
        } else {
            // Indent selected lines
            const lines = value.substring(start, end).split('\n');
            const indented = lines.map(line => '    ' + line).join('\n');
            this.textarea.value = value.substring(0, start) + indented + value.substring(end);
            this.textarea.selectionStart = start;
            this.textarea.selectionEnd = start + indented.length;
        }
    }

    handleBackspace() {
        const start = this.textarea.selectionStart;
        const value = this.textarea.value;
        
        if (start > 0 && value[start - 1] === ' ') {
            // Check if we're removing spaces at line start
            const lineStart = value.lastIndexOf('\n', start - 1) + 1;
            const spaces = start - lineStart;
            if (spaces % 4 === 0 && spaces > 0) {
                this.textarea.value = value.substring(0, start - 4) + value.substring(start);
                this.textarea.selectionStart = this.textarea.selectionEnd = start - 4;
            }
        }
    }

    initTabHandler() {
        // Disable default tab behavior
        this.textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
            }
        });
    }

    initPasteHandler() {
        this.textarea.addEventListener('paste', (e) => {
            e.preventDefault();
            const text = (e.clipboardData || window.clipboardData).getData('text');
            const start = this.textarea.selectionStart;
            const end = this.textarea.selectionEnd;
            this.textarea.value = this.textarea.value.substring(0, start) + text + this.textarea.value.substring(end);
            this.textarea.selectionStart = this.textarea.selectionEnd = start + text.length;
        });
    }

    getCode() {
        return this.textarea.value;
    }

    setCode(code) {
        this.textarea.value = code;
    }
}
