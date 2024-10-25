// Configuration object to hold settings
const keyboardConfig = {
    inputSelector: 'input' // Applies to all input fields
};

window.addEventListener('load', function () {
    let activeInput = null;
    let isCapsLockActive = false;
    let isShiftActive = false;
    let isDragging = false;

    const shiftKeyElement1 = document.getElementById('bm3-leftShiftKey');
    const shiftKeyElement2 = document.getElementById('bm3-rightShiftKey');
    const capsLockKeyElement = document.getElementById('bm3-capsLock');

    // Toggle Shift and Caps Lock functionality
    const toggleShift = () => {
        isShiftActive = !isShiftActive;
        toggleCase();

        if (isShiftActive) {
            shiftKeyElement1.classList.add('bm3-activeKey');
            shiftKeyElement2.classList.add('bm3-activeKey');
        } else {
            shiftKeyElement1.classList.remove('bm3-activeKey');
            shiftKeyElement2.classList.remove('bm3-activeKey');
        }
    };

    const toggleCase = () => {
        const keys = document.querySelectorAll('.bm3-key');
        keys.forEach(key => {
            let keyText = key.innerText;
            if (keyText.length === 1) {
                if (isShiftActive) {
                    key.innerText = shiftKeyMap[keyText] || keyText.toUpperCase();
                } else if (!isCapsLockActive) {
                    key.innerText = keyText.toLowerCase();
                } else {
                    key.innerText = keyText.toUpperCase();
                }
            }
        });
    };

    shiftKeyElement1.addEventListener('click', toggleShift);
    shiftKeyElement2.addEventListener('click', toggleShift);

    capsLockKeyElement.addEventListener('click', function () {
        isCapsLockActive = !isCapsLockActive;
        toggleCase();

        if (isCapsLockActive) {
            capsLockKeyElement.classList.add('bm3-activeKey');
        } else {
            capsLockKeyElement.classList.remove('bm3-activeKey');
        }
    });

    // Shift transformations map (numbers and special characters)
    const shiftKeyMap = {
        '1': '!', '2': '@', '3': '#', '4': '$', '5': '%', '6': '^', '7': '&', '8': '*', '9': '(', '0': ')',
        '-': '_', '=': '+', '[': '{', ']': '}', '\\': '|', ';': ':', "'": '"', ',': '<', '.': '>', '/': '?', '`': '~'
    };

    const keyboard = document.getElementById('bm3-virtualKeyboard');
    const closeKeyboardBtn = document.getElementById('bm3-closeKeyboard');

    // Activate the virtual keyboard when an input is focused
    const activateKeyboard = (input) => {
        activeInput = input;
        keyboard.style.display = 'block';
    };

    // Add focus event listener to dynamically added inputs
    const addKeyboardEventListeners = () => {
        document.querySelectorAll(keyboardConfig.inputSelector).forEach(input => {
            input.addEventListener('focus', function () {
                activateKeyboard(this);
            });
        });
    };

    // Initial activation for inputs already on the page
    addKeyboardEventListeners();

    // Close keyboard when clicking outside (unless dragging)
    document.addEventListener('click', function (event) {
        if (!event.target.closest('input') && !event.target.closest('#bm3-virtualKeyboard') && !isDragging) {
            keyboard.style.display = 'none';
        }
    });

    // Handle key presses on the virtual keyboard
    document.querySelectorAll('.bm3-key').forEach(key => {
        key.addEventListener('click', function () {
            if (activeInput) {
                let keyValue = this.innerText;
                if (keyValue === 'Backspace') {
                    activeInput.value = activeInput.value.slice(0, -1);
                } else if (keyValue === 'Enter') {
                    activeInput.value += '\n';
                    keyboard.style.display = 'none'; // Close on Enter
                } else {
                    if (isShiftActive) keyValue = shiftKeyMap[keyValue] || keyValue.toUpperCase();
                    if (isCapsLockActive && !isShiftActive) keyValue = keyValue.toUpperCase();
                    activeInput.value += keyValue;
                }
                activeInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });
    });

    closeKeyboardBtn.addEventListener('click', function () {
        keyboard.style.display = 'none';
    });

    const keyboardHeader = document.getElementById('bm3-keyboardHeader');
    keyboardHeader.onmousedown = function (event) {
        isDragging = true;
        event.preventDefault();
        let shiftX = event.clientX - keyboard.getBoundingClientRect().left;
        let shiftY = event.clientY - keyboard.getBoundingClientRect().top;

        document.onmousemove = function (event) {
            keyboard.style.left = event.clientX - shiftX + 'px';
            keyboard.style.top = event.clientY - shiftY + 'px';
            keyboard.style.bottom = 'auto';
        };

        document.onmouseup = function () {
            document.onmousemove = null;
            document.onmouseup = null;
            isDragging = false;
        };
    };

    keyboardHeader.ondragstart = function () {
        return false;
    };

    // Re-add event listeners for dynamically added inputs
    const observer = new MutationObserver(() => {
        addKeyboardEventListeners();
    });
    observer.observe(document.getElementById('playerFields'), { childList: true, subtree: true });
});
