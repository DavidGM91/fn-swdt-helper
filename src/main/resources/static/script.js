document.getElementById('botForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const modelName = document.getElementById('modelName').value;
    const quality = parseInt(document.getElementById('quality').value, 10);

    fetch('/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `modelName=${encodeURIComponent(modelName)}&quality=${encodeURIComponent(quality)}`,
    })
    .then(response => response.text())
    .then(data => {
        if (data === "success") {
            const botList = document.getElementById('botList');
            const listItem = document.createElement('li');
            listItem.textContent = `${modelName} - Quality: ${quality}`;
            botList.appendChild(listItem);

            provideAdvice();
        }
    });
});

function provideAdvice() {
    fetch('/advice')
    .then(response => response.text())
    .then(adviceText => {
        const advice = document.getElementById('advice');
        advice.textContent = adviceText;
    });
}