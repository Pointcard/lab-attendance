// ★ ここにGASデプロイ時にコピーしたURLを貼り付けます
const GAS_URL = 'https://script.google.com/macros/s/AKfycbz_byv2YEj7XRxCi5hOUjNwq_Bk6Ez-RtFUUdSh739Jg0L-paHDuhwM0k5W0c-e7mB0/exec';

// ページ読み込み時に履歴を取得
window.onload = () => {
  fetchHistory();
};

async function recordAttendance(status) {
  const nameSelect = document.getElementById('member-select');
  const name = nameSelect.value;
  
  if (!name) {
    showMessage('名前を選択してください', 'error');
    return;
  }

  setLoading(true);
  
  const payload = {
    name: name,
    status: status
  };

  try {
    // GASへPOSTリクエスト（打刻）
    const response = await fetch(GAS_URL, {
      method: 'POST',
      body: JSON.stringify(payload)
      // GASのCORS制約を回避するため、あえてContent-Typeヘッダーは設定しません
    });

    const result = await response.json();
    
    if (result.success) {
      showMessage(`${name}さん、${status}を記録しました`, 'success');
      // 成功したら履歴を再取得して表示を更新
      fetchHistory();
    } else {
      showMessage('エラーが発生しました', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    showMessage('通信エラーが発生しました', 'error');
  } finally {
    setLoading(false);
  }
}

async function fetchHistory() {
  const historyList = document.getElementById('history-list');
  
  try {
    // GASへGETリクエスト（履歴取得）
    const response = await fetch(GAS_URL);
    const data = await response.json();
    
    historyList.innerHTML = ''; // クリア
    
    if (data.length === 0) {
      historyList.innerHTML = '<li>履歴がありません</li>';
      return;
    }

    data.forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span>${item.time} - ${item.name}</span>
        <span class="status-badge" style="color: ${getStatusColor(item.status)}">${item.status}</span>
      `;
      historyList.appendChild(li);
    });

  } catch (error) {
    console.error('Fetch History Error:', error);
    historyList.innerHTML = '<li>履歴の取得に失敗しました</li>';
  }
}

function getStatusColor(status) {
  switch(status) {
    case '出勤': return '#10b981';
    case '退勤': return '#ef4444';
    case '一時退出': return '#f59e0b';
    default: return '#334155';
  }
}

function showMessage(text, type) {
  const msgEl = document.getElementById('message');
  msgEl.textContent = text;
  msgEl.className = `message ${type}`;
  // 5秒後にメッセージを消す
  setTimeout(() => { msgEl.textContent = ''; }, 5000);
}

function setLoading(isLoading) {
  const buttons = document.querySelectorAll('.btn');
  const loadingEl = document.getElementById('loading');
  
  buttons.forEach(btn => btn.disabled = isLoading);
  if (isLoading) {
    loadingEl.classList.remove('hidden');
  } else {
    loadingEl.classList.add('hidden');
  }
}
