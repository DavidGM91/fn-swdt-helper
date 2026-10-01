document.getElementById('botForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const modelName = document.getElementById('modelName').value;
    const quality = parseInt(document.getElementById('quality').value, 10);

    const botList = document.getElementById('botList');
    const listItem = document.createElement('li');
    listItem.textContent = `${modelName} - Quality: ${quality}`;
    botList.appendChild(listItem);

    provideAdvice();
});

function provideAdvice() {
    const botList = document.getElementById('botList');
    const bots = Array.from(botList.children).map(item => {
        const [modelName, quality] = item.textContent.split(' - Quality: ');
        return { modelName, quality: parseInt(quality, 10) };
    });

    // Example advice logic (replace with actual logic)
    const advice = document.getElementById('advice');
    advice.textContent = 'Check your bots and consider upgrading low-quality ones.';
}