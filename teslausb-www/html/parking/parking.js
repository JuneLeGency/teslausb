(() => {
  const timer = document.getElementById('parkingTimer');
  const note = document.getElementById('timerNote');
  const startedKey = 'teslausbParkingStartedAt';

  function renderTimer() {
    const startedAt = Number(localStorage.getItem(startedKey) || 0);
    if (!startedAt) return;
    const elapsed = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
    const hours = String(Math.floor(elapsed / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
    const seconds = String(elapsed % 60).padStart(2, '0');
    timer.textContent = `${hours}:${minutes}:${seconds}`;
    note.textContent = `开始于 ${new Date(startedAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
  }
  document.getElementById('timerStart').addEventListener('click', () => {
    if (!localStorage.getItem(startedKey)) localStorage.setItem(startedKey, String(Date.now()));
    renderTimer();
  });
  document.getElementById('timerReset').addEventListener('click', () => {
    localStorage.removeItem(startedKey); timer.textContent = '00:00:00'; note.textContent = '尚未开始计时';
  });
  renderTimer(); setInterval(renderTimer, 1000);

  function pressure() {
    const value = Math.max(0, Number(document.getElementById('pressureValue').value) || 0);
    const unit = document.getElementById('pressureUnit').value;
    const kpa = unit === 'psi' ? value * 6.894757 : unit === 'bar' ? value * 100 : value;
    document.getElementById('pressureResult').textContent = `${kpa.toFixed(0)} kPa · ${(kpa / 6.894757).toFixed(1)} psi · ${(kpa / 100).toFixed(2)} bar`;
  }
  document.getElementById('pressureValue').addEventListener('input', pressure);
  document.getElementById('pressureUnit').addEventListener('change', pressure);

  function charge() {
    const now = Number(document.getElementById('socNow').value) || 0;
    const target = Number(document.getElementById('socTarget').value) || 0;
    const battery = Math.max(0, Number(document.getElementById('batteryKwh').value) || 0);
    const power = Math.max(.1, Number(document.getElementById('chargeKw').value) || .1);
    const price = Math.max(0, Number(document.getElementById('priceKwh').value) || 0);
    const efficiency = Math.max(.5, Math.min(1, (Number(document.getElementById('efficiency').value) || 90) / 100));
    const energy = Math.max(0, target - now) / 100 * battery;
    const inputEnergy = energy / efficiency;
    const minutes = Math.round(inputEnergy / power * 60);
    document.getElementById('chargeResult').textContent = `约 ${Math.floor(minutes / 60)} 小时 ${minutes % 60} 分 · 电网取电 ${inputEnergy.toFixed(1)} kWh · 约 ¥${(inputEnergy * price).toFixed(2)}`;
  }
  document.querySelectorAll('.charge-tool input').forEach((input) => input.addEventListener('input', charge));
  charge();

  const lightTool = document.getElementById('lightTool');
  let lightColor = '#fff3d6';
  document.querySelectorAll('.swatches button').forEach((button, index) => button.addEventListener('click', () => {
    document.querySelectorAll('.swatches button').forEach((item) => item.classList.remove('selected'));
    button.classList.add('selected'); lightColor = button.dataset.color; lightTool.style.setProperty('--light-color', lightColor);
  }));
  document.querySelector('.swatches button').classList.add('selected');
  document.getElementById('lightFullscreen').addEventListener('click', async () => {
    if (!lightTool.classList.contains('fullscreen-light')) {
      lightTool.classList.add('fullscreen-light'); lightTool.style.setProperty('--light-color', lightColor);
      if (lightTool.requestFullscreen) await lightTool.requestFullscreen().catch(() => {});
    } else {
      lightTool.classList.remove('fullscreen-light');
      if (document.fullscreenElement) await document.exitFullscreen().catch(() => {});
    }
  });
  document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement) lightTool.classList.remove('fullscreen-light'); });
})();
