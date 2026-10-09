document.addEventListener('DOMContentLoaded', () => {
  // Theme Toggle Functionality
  const themeToggleBtn = document.getElementById('theme-toggle');
  const storedTheme = localStorage.getItem('theme') || 'dark';

  if (storedTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    themeToggleBtn.textContent = '☀️ Light Mode';
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeToggleBtn.textContent = '🌙 Dark Mode';
  }

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'light') {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      themeToggleBtn.textContent = '🌙 Dark Mode';
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
      themeToggleBtn.textContent = '☀️ Light Mode';
    }
  });

  // Canary Rollout Simulator Logic
  let rolloutTimers = [];
  let simulateAnomaly = false;

  const canarySplit = document.getElementById('canary-split');
  const stableSplit = document.getElementById('stable-split');
  const canaryLog = document.getElementById('canary-log');
  const anomalyToggleBtn = document.getElementById('anomaly-toggle');
  const runRolloutBtn = document.getElementById('run-rollout');
  const resetRolloutBtn = document.getElementById('reset-rollout');

  function updateSplit(canaryPercent) {
    if (canaryPercent === 0) {
      stableSplit.style.width = '100%';
      stableSplit.textContent = 'Stable v1.4.0 (100%)';
      canarySplit.style.width = '0%';
      canarySplit.textContent = '';
    } else {
      stableSplit.style.width = (100 - canaryPercent) + '%';
      stableSplit.textContent = canaryPercent < 100 ? `Stable ${(100 - canaryPercent)}%` : '';
      canarySplit.style.width = canaryPercent + '%';
      canarySplit.textContent = `Canary v1.5.0 (${canaryPercent}%)`;
    }
  }

  function appendLog(msg, type = 'normal') {
    const p = document.createElement('p');
    p.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
    if (type === 'success') p.style.color = '#10b981';
    else if (type === 'error') p.style.color = '#ef4444';
    else if (type === 'warn') p.style.color = '#f59e0b';
    canaryLog.appendChild(p);
    canaryLog.scrollTop = canaryLog.scrollHeight;
  }

  function runCanaryRollout() {
    rolloutTimers.forEach(clearTimeout);
    rolloutTimers = [];
    canaryLog.replaceChildren();
    updateSplit(0);
    appendLog('Initiating Argo Rollouts Canary Release v1.5.0...', 'normal');

    const steps = [
      { time: 800, percent: 10, msg: 'Canary pod deployed. Routing 10% traffic...' },
      { time: 2200, percent: 10, checkPrometheus: true },
      { time: 3500, percent: 50, msg: 'Metric analysis PASSED. Scaling Canary to 50% traffic...' },
      { time: 4800, percent: 50, checkPrometheus: true },
      { time: 6000, percent: 100, msg: 'Full verification successful. Promoting Canary to 100% Stable v1.5.0!' }
    ];

    steps.forEach(step => {
      const timer = setTimeout(() => {
        if (step.checkPrometheus) {
          if (simulateAnomaly) {
            rolloutTimers.forEach(clearTimeout);
            appendLog('ALERT: Prometheus Analysis detected 5xx Error Rate > 2.5%!', 'error');
            appendLog('Aborting Rollout! Rolling back traffic to Stable v1.4.0 (100%)...', 'warn');
            updateSplit(0);
            appendLog('Rollback complete. Incident prevented.', 'error');
            return;
          } else {
            appendLog('Prometheus Analysis: 5xx Error Rate = 0.02% (Target < 0.5%). Health PASSED.', 'success');
          }
        } else {
          updateSplit(step.percent);
          appendLog(step.msg, step.percent === 100 ? 'success' : 'normal');
        }
      }, step.time);
      rolloutTimers.push(timer);
    });
  }

  if (runRolloutBtn) {
    runRolloutBtn.addEventListener('click', runCanaryRollout);
  }

  if (resetRolloutBtn) {
    resetRolloutBtn.addEventListener('click', () => {
      rolloutTimers.forEach(clearTimeout);
      updateSplit(0);
      canaryLog.replaceChildren();
      appendLog('Rollout state reset.', 'normal');
    });
  }

  if (anomalyToggleBtn) {
    anomalyToggleBtn.addEventListener('click', () => {
      simulateAnomaly = !simulateAnomaly;
      if (simulateAnomaly) {
        anomalyToggleBtn.textContent = '⚠️ Anomaly Injection: ON (5xx Error Trigger)';
        anomalyToggleBtn.style.borderColor = '#ef4444';
        anomalyToggleBtn.style.color = '#ef4444';
      } else {
        anomalyToggleBtn.textContent = '🧪 Inject 5xx Anomaly (Test Auto-Rollback)';
        anomalyToggleBtn.style.borderColor = '';
        anomalyToggleBtn.style.color = '';
      }
    });
  }

  // DevSecOps Pipeline Simulator
  const runPipeBtn = document.getElementById('run-pipeline');
  const pipeOutput = document.getElementById('pipe-output');
  const stepBoxes = document.querySelectorAll('.pipe-step');

  if (runPipeBtn) {
    runPipeBtn.addEventListener('click', () => {
      runPipeBtn.disabled = true;
      pipeOutput.replaceChildren();
      stepBoxes.forEach(b => b.classList.remove('passed', 'active'));

      const stages = [
        { name: 'Gitleaks', stepIdx: 0, msg: 'Scanning commit history for exposed AWS tokens... 0 leaks found.' },
        { name: 'Checkov & TFLint', stepIdx: 1, msg: 'Validating Terraform IaC compliance & security rules... 100% Compliant.' },
        { name: 'SonarQube SAST', stepIdx: 2, msg: 'Executing SAST analysis on Java/Python microservices... Quality Gate PASSED.' },
        { name: 'Trivy & SBOM', stepIdx: 3, msg: 'Scanning container image vulnerabilities & generating CycloneDX SBOM... 0 Critical CVEs.' },
        { name: 'Docker & ECR', stepIdx: 4, msg: 'Building multi-stage image & pushing to AWS ECR with digest signing.' },
        { name: 'Argo CD GitOps', stepIdx: 5, msg: 'GitOps sync triggered. Manifests applied cleanly to EKS cluster.' }
      ];

      stages.forEach((st, i) => {
        setTimeout(() => {
          stepBoxes[st.stepIdx].classList.add('active');
          const p = document.createElement('p');
          p.textContent = `✔ [STAGE ${i+1}: ${st.name}] ${st.msg}`;
          p.style.color = '#10b981';
          pipeOutput.appendChild(p);
          pipeOutput.scrollTop = pipeOutput.scrollHeight;

          setTimeout(() => {
            stepBoxes[st.stepIdx].classList.remove('active');
            stepBoxes[st.stepIdx].classList.add('passed');
            if (i === stages.length - 1) {
              runPipeBtn.disabled = false;
            }
          }, 400);
        }, i * 900);
      });
    });
  }

  // Skills Filter Matrix
  const filterBtns = document.querySelectorAll('.filter-btn');
  const skillBoxes = document.querySelectorAll('.skill-box');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-cat');

      skillBoxes.forEach(box => {
        if (cat === 'all' || box.getAttribute('data-cat') === cat) {
          box.style.display = 'block';
        } else {
          box.style.display = 'none';
        }
      });
    });
  });

  // Modal Functionality for Resume
  const modalOverlay = document.getElementById('resume-modal');
  const modalCloseBtn = document.getElementById('modal-close');
  const openResumeBtns = document.querySelectorAll('.btn-open-resume');

  openResumeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      modalOverlay.classList.add('open');
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', () => {
      modalOverlay.classList.remove('open');
    });
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.classList.remove('open');
      }
    });
  }

  // Auto-run initial canary visualizer on load
  runCanaryRollout();
});
