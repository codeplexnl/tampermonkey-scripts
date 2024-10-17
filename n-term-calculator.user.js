// ==UserScript==
// @name         N-Term calculator
// @namespace    http://tampermonkey.net/
// @version      2024-10-04
// @description  Calculate N Term
// @author       You
// @match        https://nl.wikipedia.org/wiki/N-term
// @grant        none
// ==/UserScript==


(function() {
    'use strict';

    // Create a container for the inputs
    const container = document.createElement('div');
    Object.assign(container.style, {
        position: 'fixed',
        top: '10px',
        right: '10px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: '15px',
        borderRadius: '8px',
        color: 'white',
        fontFamily: 'Arial, sans-serif',
        zIndex: '9999'
    });

    // Add a title to the panel
    const title = document.createElement('h3');
    title.innerText = 'Score Input Panel';
    title.style.margin = '0 0 10px';
    container.appendChild(title);

    // Create an input field
    function createInputField(labelText, id, type, min, max) {
        const label = document.createElement('label');
        label.innerText = labelText;
        label.style.display = 'block';
        label.style.marginBottom = '5px';

        const input = document.createElement('input');
        Object.assign(input, {
            type,
            id,
            min: min !== undefined ? min : undefined,
            max: max !== undefined ? max : undefined,
            style: {
                width: '100%',
                padding: '5px',
                marginBottom: '10px',
                borderRadius: '4px',
                border: '1px solid #ccc'
            }
        });

        container.appendChild(label);
        container.appendChild(input);
    }

    // Adding the specified fields
    createInputField('N-Term', 'n-term', 'number', -2, 4);
    createInputField('Max Points', 'max-points', 'number', 0);
    createInputField('Scored Points', 'scored-points', 'number', 0);
    createInputField('Deduction Points', 'deduction-points', 'number', 0);

    // Create a label to display dynamic updates
    const resultLabel = document.createElement('div');
    resultLabel.id = 'result-label';
    resultLabel.innerText = 'Result: ';
    resultLabel.style.marginTop = '10px';
    resultLabel.style.fontWeight = 'bold';
    container.appendChild(resultLabel);

    // Append the container to the body
    document.body.appendChild(container);

    // Input elements
    const scoredPointsInput = document.getElementById('scored-points');
    const deductionPointsInput = document.getElementById('deduction-points');
    const maxPointsInput = document.getElementById('max-points');
    const nTermInput = document.getElementById('n-term');

    function calculateNterm(isHigh) {
        const maxPointsValue = parseFloat(maxPointsInput.value) || 0;
        const scoredPointsValue = parseFloat(scoredPointsInput.value) || 0;
        const nTermValue = parseFloat(nTermInput.value) || 0;

        const borderValues = [
            1 + scoredPointsValue * (9 / maxPointsValue) * (isHigh ? 2 : 0.5),
            10 - (maxPointsValue - scoredPointsValue) * (9 / maxPointsValue) * (isHigh ? 0.5 : 2)
        ];

        const mainCalcValue = (9 * (scoredPointsValue / maxPointsValue)) + nTermValue;
        return isHigh ? Math.min(mainCalcValue, ...borderValues) : Math.max(mainCalcValue, ...borderValues);
    }

    function calculateScore() {
        const nTermValue = parseFloat(nTermInput.value) || 0;
        const maxPointsValue = parseFloat(maxPointsInput.value) || 0;
        const scoredPointsValue = parseFloat(scoredPointsInput.value) || 0;

        let score = (9 * (scoredPointsValue / maxPointsValue)) + nTermValue;

        if (nTermValue > 1) {
            score = calculateNterm(true);
        } else if (nTermValue < 1) {
            score = calculateNterm(false);
        }

        resultLabel.innerText = `Result: ${Math.round(score * 10) / 10}`;
    }

    function updatePoints(inputField, isDeduction) {
        const maxPointsValue = parseFloat(maxPointsInput.value) || 0;
        const value = parseFloat(inputField.value) || 0;
        if (isDeduction) {
            scoredPointsInput.value = maxPointsValue - value;
        } else {
            deductionPointsInput.value = maxPointsValue - value;
        }
        calculateScore();
    }

    // Attach event listeners to both fields
    scoredPointsInput.addEventListener('input', () => updatePoints(scoredPointsInput, false));
    deductionPointsInput.addEventListener('input', () => updatePoints(deductionPointsInput, true));
})();
