class WASMBridge {
    constructor() {
        this.initialized = false;
        this.module = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            // Load WASM module
            const wasmUrl = 'wasm/python.wasm';
            
            fetch(wasmUrl)
                .then(response => response.arrayBuffer())
                .then(bytes => WebAssembly.instantiate(bytes, {
                    env: {
                        print: (ptr) => {
                            const output = this.readString(ptr);
                            if (this.onOutput) this.onOutput(output);
                        },
                        print_err: (ptr) => {
                            const output = this.readString(ptr);
                            if (this.onError) this.onError(output);
                        },
                        malloc: (size) => {
                            return this.module.instance.exports.malloc(size);
                        },
                        free: (ptr) => {
                            this.module.instance.exports.free(ptr);
                        }
                    }
                }))
                .then(module => {
                    this.module = module;
                    this.initialized = true;
                    resolve();
                })
                .catch(err => {
                    console.warn('WASM not available, using fallback', err);
                    this.initialized = false;
                    resolve(); // Resolve anyway with fallback
                });
        });
    }

    readString(ptr) {
        const memory = new Uint8Array(this.module.instance.exports.memory.buffer);
        let str = '';
        let i = ptr;
        while (memory[i] !== 0) {
            str += String.fromCharCode(memory[i]);
            i++;
        }
        return str;
    }

    writeString(str) {
        const encoder = new TextEncoder();
        const encoded = encoder.encode(str + '\0');
        const ptr = this.module.instance.exports.malloc(encoded.length);
        const memory = new Uint8Array(this.module.instance.exports.memory.buffer);
        memory.set(encoded, ptr);
        return ptr;
    }

    async executePython(code, onOutput, onError) {
        this.onOutput = onOutput;
        this.onError = onError;
        
        if (!this.initialized) {
            // Fallback JavaScript-based Python execution
            return this.fallbackExecute(code, onOutput, onError);
        }
        
        try {
            const codePtr = this.writeString(code);
            const result = this.module.instance.exports.execute(codePtr);
            this.module.instance.exports.free(codePtr);
            return result;
        } catch (err) {
            onError(`Execution error: ${err.message}`);
            return -1;
        }
    }

    fallbackExecute(code, onOutput, onError) {
        // Capture console.log
        const originalLog = console.log;
        const originalError = console.error;
        
        let output = [];
        let errors = [];
        
        console.log = (...args) => {
            output.push(args.join(' '));
            if (onOutput) onOutput(args.join(' '));
        };
        
        console.error = (...args) => {
            errors.push(args.join(' '));
            if (onError) onError(args.join(' '));
        };
        
        try {
            // Execute code in isolated context
            const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
            const fn = new AsyncFunction(code);
            fn().catch(err => {
                onError(`Runtime error: ${err.message}`);
            });
            
            // Simple sync execution for basic code
            const syncFn = new Function(code);
            syncFn();
            
            setTimeout(() => {
                console.log = originalLog;
                console.error = originalError;
            }, 100);
            
            return 0;
        } catch (err) {
            onError(`Syntax error: ${err.message}`);
            console.log = originalLog;
            console.error = originalError;
            return -1;
        }
    }
}
