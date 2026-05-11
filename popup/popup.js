console.log("Popup")

const flask_server = "http://127.0.0.1:8000"
const autoScanToggle = document.getElementById('autoScanToggle');
const statusDot = document.querySelector('.status-dot');
const mainBtn = document.getElementById('scanButton');

autoScanToggle.addEventListener('change', () => {
  if (autoScanToggle.checked) {
    statusDot.style.background = '#C9C9C9';
  } else {
    statusDot.style.background = '#27a065';
  }
});

mainBtn.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'extractText' }, (response) => {
          if (chrome.runtime.lastError) {
              console.error('Error:', chrome.runtime.lastError.message);
              return;
          }
          
          if (!response || !response.text) {
              return;
          }
          let results = document.getElementById('results');
          if (!results) {
              results = document.createElement('p');
              results.id = 'results';
              results.style = 'font-size:11px; max-height:200px; overflow-y:auto; white-space:pre-wrap; padding:8px;';
              document.querySelector('.popup-container').appendChild(results);
          }
          results.textContent = "Scanning...";

           // Send the email text to the Flask backend
        fetch(`${flask_server}/api/scan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: response.text })
        })
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            results.textContent = `Error: ${data.error}`;
            return;
          }
          results.textContent = `Result: ${data.pred_label} (${data.pred_score}% confidence)`;
        })
        .catch(err => {
          results.textContent = 'Error: Could not reach the backend. Is Flask running?';
        });
      });
  });
});
