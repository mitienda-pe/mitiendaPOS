<template>
    <div class="right-to-left-money-input">
        <label v-if="label" :for="id" class="input-label">{{ label }}</label>
        <div class="input-container">
            <span class="currency-symbol">S/</span>
            <input :id="id" ref="inputRef" type="text" :value="displayValue" placeholder="0.00" readonly
                @keydown="handleKeyDown" @paste="handlePaste" @focus="handleFocus" @click="handleFocus"
                :class="{ 'input-error': error }" />
        </div>
        <p v-if="error" class="error-text">{{ error }}</p>
        <p v-else-if="helpText" class="help-text">{{ helpText }}</p>

        <div v-if="showInstructions" class="instructions">
            <h3>Instrucciones:</h3>
            <ul>
                <li>Cada número que ingreses se añade a la izquierda</li>
                <li>Los últimos dos dígitos siempre son centavos</li>
                <li>Usa Backspace para borrar el último dígito ingresado</li>
                <li>Máximo 8 dígitos enteros y 2 decimales</li>
            </ul>
        </div>
    </div>
</template>

<script>
import { ref, computed, watch, onMounted, defineExpose } from 'vue';

export default {
    name: 'RightToLeftMoneyInput',

    props: {
        modelValue: {
            type: [Number, String],
            default: 0
        },
        label: {
            type: String,
            default: 'Monto (S/):'
        },
        helpText: {
            type: String,
            default: 'Ingrese los dígitos de derecha a izquierda (centavos primero)'
        },
        showInstructions: {
            type: Boolean,
            default: false
        },
        maxDigits: {
            type: Number,
            default: 10 // 8 enteros + 2 decimales
        },
        error: {
            type: String,
            default: ''
        },
        id: {
            type: String,
            default: () => `money-input-${Math.random().toString(36).substr(2, 9)}`
        }
    },

    emits: ['update:modelValue', 'change'],

    setup(props, { emit }) {
        const internalValue = ref('');
        const displayValue = ref('0.00');
        const inputRef = ref(null);

        // Inicializar con el valor del prop
        onMounted(() => {
            if (props.modelValue) {
                setValue(props.modelValue);
            }
        });

        // Actualiza el componente cuando cambia el prop
        watch(() => props.modelValue, (newValue) => {
            if (newValue !== getValue()) {
                setValue(newValue);
            }
        });

        // Procesa la entrada y actualiza los valores
        const processInput = (digits) => {
            if (digits === '') {
                displayValue.value = '0.00';
                internalValue.value = '';
                emitChange(0);
                return;
            }

            // Limitar a máximo de dígitos (defecto: 10 = 8 enteros + 2 decimales)
            if (digits.length > props.maxDigits) {
                digits = digits.substring(digits.length - props.maxDigits);
            }

            // Formatear con punto decimal
            const centavos = digits.slice(-2).padStart(2, '0');
            const enteros = digits.slice(0, -2) || '0';

            // Formatear con separadores de miles
            const enterosFormatted = enteros.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

            displayValue.value = `${enterosFormatted}.${centavos}`;
            internalValue.value = digits;

            // Emitir el valor numérico para v-model
            emitChange(parseFloat(`${enteros}.${centavos}`));
        };

        // Emite el cambio para v-model y evento change
        const emitChange = (numericValue) => {
            emit('update:modelValue', numericValue);
            emit('change', {
                value: numericValue,
                formatted: displayValue.value,
                raw: internalValue.value
            });
        };

        // Maneja las teclas presionadas
        const handleKeyDown = (e) => {
            // Permitir solo teclas numéricas, backspace, delete, tab, y flechas
            const allowedKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
            const isNumericKey = /^[0-9]$/.test(e.key);

            if (!isNumericKey && !allowedKeys.includes(e.key)) {
                e.preventDefault();
                return;
            }

            // Si presiona una tecla numérica
            if (isNumericKey) {
                e.preventDefault();
                const newValue = internalValue.value + e.key;
                processInput(newValue);
            }

            // Manejar backspace
            if (e.key === 'Backspace') {
                e.preventDefault();
                const newValue = internalValue.value.slice(0, -1);
                processInput(newValue);
            }
        };

        // Maneja el pegado (paste)
        const handlePaste = (e) => {
            e.preventDefault();
            const pastedText = e.clipboardData.getData('text');
            const numericText = pastedText.replace(/[^\d]/g, '');

            if (numericText) {
                const newValue = internalValue.value + numericText;
                processInput(newValue);
            }
        };

        // Coloca el cursor al final del input
        const handleFocus = () => {
            setTimeout(() => {
                if (inputRef.value) {
                    inputRef.value.selectionStart = inputRef.value.value.length;
                    inputRef.value.selectionEnd = inputRef.value.value.length;
                }
            }, 0);
        };

        // Obtiene el valor numérico actual
        const getValue = () => {
            if (internalValue.value === '') return 0;

            const centavos = internalValue.value.slice(-2).padStart(2, '0');
            const enteros = internalValue.value.slice(0, -2) || '0';

            return parseFloat(`${enteros}.${centavos}`);
        };

        // Establece un valor numérico
        const setValue = (value) => {
            if (value === null || value === undefined) {
                processInput('');
                return;
            }

            // Convertir a string y eliminar punto decimal
            const valueStr = parseFloat(value).toFixed(2).replace('.', '');
            processInput(valueStr);
        };

        // Resetea el campo
        const reset = () => {
            processInput('');
        };

        // Exponer métodos al componente padre
        const expose = {
            getValue,
            setValue,
            reset,
            getFormattedValue: () => displayValue.value,
            getRawValue: () => internalValue.value
        };

        // ¡Importante! En Vue 3, debemos retornar los métodos que queremos exponer
        defineExpose(expose);

        return {
            internalValue,
            displayValue,
            inputRef,
            handleKeyDown,
            handlePaste,
            handleFocus
        };
    }
};
</script>

<style scoped>
.right-to-left-money-input {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    margin-bottom: 1.5rem;
}

.input-label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
}

.input-container {
    position: relative;
    margin-top: 0.5rem;
}

.input-container input {
    display: block;
    width: 100%;
    padding: 0.5rem 0.75rem 0.5rem 1.75rem;
    border: 1px solid #D1D5DB;
    border-radius: 0.375rem;
    font-size: 1rem;
    line-height: 1.5;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    box-sizing: border-box;
}

.input-container input:focus {
    outline: none;
    border-color: #6366F1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.input-container input.input-error {
    border-color: #EF4444;
}

.currency-symbol {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: #6B7280;
    pointer-events: none;
}

.help-text {
    margin-top: 0.5rem;
    font-size: 0.875rem;
    color: #6B7280;
}

.error-text {
    margin-top: 0.5rem;
    font-size: 0.875rem;
    color: #EF4444;
}

.instructions {
    margin-top: 1rem;
    padding: 1rem;
    background-color: #F3F4F6;
    border-radius: 0.375rem;
}

.instructions h3 {
    margin-top: 0;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
}

.instructions ul {
    margin: 0;
    padding-left: 1.5rem;
}

.instructions li {
    font-size: 0.875rem;
    color: #4B5563;
    margin-bottom: 0.25rem;
}
</style>