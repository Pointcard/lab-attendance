const GAS_URL = 'ここにGASのウェブアプリURLを貼り付け';

let currentAllStatus = {}; // 全員の最新状態を保持

window.onload = () => { fetchHistory(); };

async function recordAttendance(status) {
  const nameSelect = document.getElementById('member-select');
  const name = nameSelect.value;
  if (!name) { showMessage('名前を選択してください', 'error'); return; }

  // 一時退出中なら「戻り」として送信
  let finalStatus = status;
  if (status === '一時退出' && currentAllStatus[name] === '一時退出') {
    finalStatus = '戻り';
  }

  setLoading(true);
  try {
    const response = await fetch(GAS_URL, {
      method: 'POST',
      body: JSON.stringify({ name: name, status: finalStatus })
    });
    const result = await response.json();
    if (result.success) {
      showMessage(`${name}さん、${finalStatus}を記録しました`, 'success');
      nameSelect.selectedIndex = 0; // 選択をリセット
      await fetchHistory();
    }
  } catch (e) {
    showMessage('通信エラーが発生しました', 'error');
  } finally {
    setLoading(false);
  }
}

async function fetchHistory() {
  try {
    const response = await fetch(GAS_URL);
    const data = await response.json();
    currentAllStatus = data.allStatus;

    // ダッシュボード更新
    updateList('list-present', 'count-present', data.present);
    updateList('list-temp', 'count-temp', data.tempOut);

    // 履歴更新（最新3件）
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '';
    data.history.forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = `<span>${item.time} ${item.name}</span><span class="status-badge" style="color:${getStatusColor(item.status)}">${item.status}</span>`;
      historyList.appendChild(li);
    });
  } catch (e) { console.error('取得エラー:', e); }
}

function updateList(listId, countId, members) {
  const listEl = document.getElementById(listId);
  document.getElementById(countId).textContent = members.length;
  listEl.innerHTML = members.map(m => `<div class="member-item">${m}</div>`).join('');
}

function getStatusColor(s) {
  if (s === '出勤' || s === '戻り') return '#10b981';
  if (s === '退勤') return '#ef4444';
  if (s === '一時退出') return '#f59e0b';
  return '#334155';
}

function showMessage(t, type) {
  const el = document.getElementById('message');
  el.textContent = t; el.className = `message ${type}`;
  setTimeout(() => { el.textContent = ''; }, 4000);
}

function setLoading(b) {
  document.querySelectorAll('.btn').forEach(btn => btn.disabled = b);
  document.getElementById('loading').className = b ? '' : 'hidden';
}
