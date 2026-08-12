/* ==========================================================================
   Haridass R - Portfolio Interactive JavaScript
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Navigation Toggle
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinks = document.getElementById('navLinks');

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      const icon = mobileToggle.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
      }
    });

    // Close menu when clicking links
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        const icon = mobileToggle.querySelector('i');
        if (icon) {
          icon.classList.add('fa-bars');
          icon.classList.remove('fa-times');
        }
      });
    });
  }

  // 2. Project Category Filtering
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      projectCards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.style.display = 'flex';
          card.style.opacity = '1';
        } else {
          card.style.display = 'none';
          card.style.opacity = '0';
        }
      });
    });
  });

  // 3. Certificate Category Filtering
  const certFilterBtns = document.querySelectorAll('.cert-filter-btn');
  const certCards = document.querySelectorAll('.cert-card');

  certFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      certFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.certFilter;

      certCards.forEach(card => {
        if (filter === 'all' || card.dataset.certCategory === filter) {
          card.style.display = 'flex';
          card.style.opacity = '1';
        } else {
          card.style.display = 'none';
          card.style.opacity = '0';
        }
      });
    });
  });

  // 4. Certificate Lightbox Modal
  const certModal = document.getElementById('certModal');
  const modalImg = document.getElementById('modalImg');
  const modalTitle = document.getElementById('modalTitle');
  const modalDownloadPdf = document.getElementById('modalDownloadPdf');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const certTriggers = document.querySelectorAll('.cert-trigger');

  function openModal(imgSrc, title, pdfSrc) {
    if (certModal && modalImg && modalTitle && modalDownloadPdf) {
      modalImg.src = imgSrc;
      modalTitle.textContent = title;
      modalDownloadPdf.href = pdfSrc;
      certModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal() {
    if (certModal) {
      certModal.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  }

  certTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const imgSrc = trigger.dataset.img;
      const title = trigger.dataset.title;
      const pdfSrc = trigger.dataset.pdf;
      openModal(imgSrc, title, pdfSrc);
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }

  if (certModal) {
    certModal.addEventListener('click', (e) => {
      if (e.target === certModal) {
        closeModal();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && certModal && certModal.classList.contains('active')) {
      closeModal();
    }
  });

  // 5. Contact Form Submission Handling
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
      }

      setTimeout(() => {
        if (contactForm) contactForm.reset();
        if (submitBtn) {
          submitBtn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
          submitBtn.style.background = 'var(--primary)';
        }
        if (formSuccess) {
          formSuccess.style.display = 'block';
        }
        setTimeout(() => {
          if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
            submitBtn.disabled = false;
            submitBtn.style.background = '';
          }
          if (formSuccess) {
            formSuccess.style.display = 'none';
          }
        }, 4000);
      }, 1000);
    });
  }

  // 6. Active Link Highlight on Scroll
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 100;
      const sectionId = current.getAttribute('id');
      const link = document.querySelector(`.nav-links a[href*=${sectionId}]`);

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        if (link) link.classList.add('active');
      } else {
        if (link) link.classList.remove('active');
      }
    });
  });

  // 7. Interactive Excel Sales Dashboard Module
  let salesRawData = [];
  let salesFilteredData = [];
  let salesCurrentPage = 1;
  const salesRowsPerPage = 10;
  const chartInstances = {};

  const openSalesModalBtn = document.getElementById('openSalesDashboardBtn');
  const salesModal = document.getElementById('salesDashboardModal');
  const closeSalesModalBtn = document.getElementById('closeSalesModalBtn');
  const resetSalesFiltersBtn = document.getElementById('resetSalesFiltersBtn');
  const exportCsvBtn = document.getElementById('exportCsvBtn');
  const salesSearchInput = document.getElementById('salesSearchInput');
  const prevPageBtn = document.getElementById('prevPageBtn');
  const nextPageBtn = document.getElementById('nextPageBtn');

  const filterYear = document.getElementById('filterYear');
  const filterCategory = document.getElementById('filterCategory');
  const filterRegion = document.getElementById('filterRegion');
  const filterPayment = document.getElementById('filterPayment');

  function openSalesModal() {
    if (!salesModal) return;
    salesModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    if (salesRawData.length === 0) {
      fetch('assets/sales_data.json')
        .then(res => res.json())
        .then(data => {
          salesRawData = data;
          applySalesFilters();
        })
        .catch(err => {
          console.error('Error loading sales data:', err);
        });
    } else {
      applySalesFilters();
    }
  }

  function closeSalesModal() {
    if (salesModal) {
      salesModal.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  }

  if (openSalesModalBtn) {
    openSalesModalBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openSalesModal();
    });
  }

  if (closeSalesModalBtn) {
    closeSalesModalBtn.addEventListener('click', closeSalesModal);
  }

  if (salesModal) {
    salesModal.addEventListener('click', (e) => {
      if (e.target === salesModal) {
        closeSalesModal();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && salesModal && salesModal.classList.contains('active')) {
      closeSalesModal();
    }
  });

  function applySalesFilters() {
    if (!salesRawData.length) return;

    const yearVal = filterYear ? filterYear.value : 'all';
    const catVal = filterCategory ? filterCategory.value : 'all';
    const regVal = filterRegion ? filterRegion.value : 'all';
    const payVal = filterPayment ? filterPayment.value : 'all';
    const searchVal = salesSearchInput ? salesSearchInput.value.toLowerCase().trim() : '';

    salesFilteredData = salesRawData.filter(row => {
      const matchYear = yearVal === 'all' || (row['Year-Month'] && row['Year-Month'].startsWith(yearVal));
      const matchCat = catVal === 'all' || row['Category'] === catVal;
      const matchReg = regVal === 'all' || row['Region'] === regVal;
      const matchPay = payVal === 'all' || row['PaymentMode'] === payVal;

      let matchSearch = true;
      if (searchVal) {
        const text = [
          row['Order ID'],
          row['CustomerName'],
          row['State'],
          row['City'],
          row['Category'],
          row['Sub-Category'],
          row['PaymentMode']
        ].join(' ').toLowerCase();
        matchSearch = text.includes(searchVal);
      }

      return matchYear && matchCat && matchReg && matchPay && matchSearch;
    });

    salesCurrentPage = 1;
    updateKpiCards();
    updateCharts();
    renderTable();
  }

  function updateKpiCards() {
    const totalSales = salesFilteredData.reduce((sum, r) => sum + (Number(r['Amount']) || 0), 0);
    const totalProfit = salesFilteredData.reduce((sum, r) => sum + (Number(r['Profit']) || 0), 0);
    const totalQty = salesFilteredData.reduce((sum, r) => sum + (Number(r['Quantity']) || 0), 0);
    const count = salesFilteredData.length;

    const marginPct = totalSales > 0 ? ((totalProfit / totalSales) * 100).toFixed(2) : '0.00';
    const avgOrder = count > 0 ? Math.round(totalSales / count) : 0;

    const kpiSalesEl = document.getElementById('kpiTotalSales');
    const kpiProfitEl = document.getElementById('kpiTotalProfit');
    const kpiQtyEl = document.getElementById('kpiTotalQty');
    const kpiAvgEl = document.getElementById('kpiAvgOrder');

    const salesSubEl = document.getElementById('kpiSalesSub');
    const profitSubEl = document.getElementById('kpiProfitSub');

    if (kpiSalesEl) kpiSalesEl.textContent = '₹' + totalSales.toLocaleString('en-IN');
    if (kpiProfitEl) kpiProfitEl.textContent = '₹' + totalProfit.toLocaleString('en-IN');
    if (kpiQtyEl) kpiQtyEl.textContent = totalQty.toLocaleString('en-IN');
    if (kpiAvgEl) kpiAvgEl.textContent = '₹' + avgOrder.toLocaleString('en-IN');

    if (salesSubEl) salesSubEl.textContent = count.toLocaleString('en-IN') + ' Total Orders';
    if (profitSubEl) profitSubEl.textContent = marginPct + '% Margin';
  }

  function updateCharts() {
    if (typeof Chart === 'undefined') return;

    // Chart 1: Monthly Trend
    const monthlyMap = {};
    salesFilteredData.forEach(r => {
      const ym = r['Year-Month'] || 'Unknown';
      if (!monthlyMap[ym]) monthlyMap[ym] = { sales: 0, profit: 0 };
      monthlyMap[ym].sales += Number(r['Amount']) || 0;
      monthlyMap[ym].profit += Number(r['Profit']) || 0;
    });

    const monthsSorted = Object.keys(monthlyMap).sort();
    const salesSeries = monthsSorted.map(m => monthlyMap[m].sales);
    const profitSeries = monthsSorted.map(m => monthlyMap[m].profit);

    const trendCtx = document.getElementById('trendChart');
    if (trendCtx) {
      if (chartInstances.trend) chartInstances.trend.destroy();
      chartInstances.trend = new Chart(trendCtx, {
        type: 'line',
        data: {
          labels: monthsSorted,
          datasets: [
            {
              label: 'Sales (₹)',
              data: salesSeries,
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              tension: 0.3,
              fill: true
            },
            {
              label: 'Profit (₹)',
              data: profitSeries,
              borderColor: '#06b6d4',
              backgroundColor: 'rgba(6, 182, 212, 0.15)',
              tension: 0.3,
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { labels: { color: '#94a3b8' } } },
          scales: {
            x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.05)' } },
            y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.05)' } }
          }
        }
      });
    }

    // Chart 2: Sales Share by Category
    const catMap = {};
    salesFilteredData.forEach(r => {
      const cat = r['Category'] || 'Other';
      catMap[cat] = (catMap[cat] || 0) + (Number(r['Amount']) || 0);
    });

    const catLabels = Object.keys(catMap);
    const catData = Object.values(catMap);

    const catCtx = document.getElementById('categoryChart');
    if (catCtx) {
      if (chartInstances.category) chartInstances.category.destroy();
      chartInstances.category = new Chart(catCtx, {
        type: 'doughnut',
        data: {
          labels: catLabels,
          datasets: [{
            data: catData,
            backgroundColor: ['#10b981', '#06b6d4', '#3b82f6', '#f59e0b', '#8b5cf6'],
            borderWidth: 2,
            borderColor: '#0d1322'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } }
        }
      });
    }

    // Chart 3: Top 5 States
    const stateMap = {};
    salesFilteredData.forEach(r => {
      const st = r['State'] || 'Unknown';
      stateMap[st] = (stateMap[st] || 0) + (Number(r['Amount']) || 0);
    });

    const topStates = Object.entries(stateMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const stateCtx = document.getElementById('stateChart');
    if (stateCtx) {
      if (chartInstances.state) chartInstances.state.destroy();
      chartInstances.state = new Chart(stateCtx, {
        type: 'bar',
        data: {
          labels: topStates.map(s => s[0]),
          datasets: [{
            label: 'Revenue (₹)',
            data: topStates.map(s => s[1]),
            backgroundColor: '#3b82f6',
            borderRadius: 6
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.05)' } },
            y: { ticks: { color: '#94a3b8' }, grid: { display: false } }
          }
        }
      });
    }

    // Chart 4: Payment Methods
    const payMap = {};
    salesFilteredData.forEach(r => {
      const pm = r['PaymentMode'] || 'Other';
      payMap[pm] = (payMap[pm] || 0) + (Number(r['Amount']) || 0);
    });

    const payCtx = document.getElementById('paymentChart');
    if (payCtx) {
      if (chartInstances.payment) chartInstances.payment.destroy();
      chartInstances.payment = new Chart(payCtx, {
        type: 'bar',
        data: {
          labels: Object.keys(payMap),
          datasets: [{
            label: 'Sales Amount (₹)',
            data: Object.values(payMap),
            backgroundColor: ['#10b981', '#06b6d4', '#f59e0b', '#ec4899', '#8b5cf6'],
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
            y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.05)' } }
          }
        }
      });
    }
  }

  function renderTable() {
    const tbody = document.getElementById('salesTableBody');
    const tableInfo = document.getElementById('tableCountInfo');
    const pageText = document.getElementById('pageInfoText');

    if (!tbody) return;
    tbody.innerHTML = '';

    const totalRecords = salesFilteredData.length;
    const maxPage = Math.ceil(totalRecords / salesRowsPerPage) || 1;

    if (salesCurrentPage > maxPage) salesCurrentPage = maxPage;
    if (salesCurrentPage < 1) salesCurrentPage = 1;

    const startIdx = (salesCurrentPage - 1) * salesRowsPerPage;
    const pageRows = salesFilteredData.slice(startIdx, startIdx + salesRowsPerPage);

    if (pageRows.length === 0) {
      tbody.innerHTML = '<tr><td colspan="10" style="text-align: center; color: var(--text-muted); padding: 2rem;">No matching transaction records found.</td></tr>';
    } else {
      pageRows.forEach(r => {
        const tr = document.createElement('tr');

        let catBg = 'background: rgba(16, 185, 129, 0.15); color: #34d399;';
        if (r['Category'] === 'Furniture') catBg = 'background: rgba(6, 182, 212, 0.15); color: #22d3ee;';
        if (r['Category'] === 'Office Supplies') catBg = 'background: rgba(59, 130, 246, 0.15); color: #60a5fa;';

        tr.innerHTML = `
          <td style="font-weight: 600; color: var(--primary-light);">${r['Order ID'] || '-'}</td>
          <td style="color: var(--text-muted);">${r['Order Date'] || '-'}</td>
          <td style="font-weight: 500;">${r['CustomerName'] || '-'}</td>
          <td>${r['City'] || '-'}, ${r['State'] || '-'}</td>
          <td><span class="badge-tag" style="${catBg}">${r['Category'] || '-'}</span></td>
          <td>${r['Sub-Category'] || '-'}</td>
          <td><span class="badge-tag" style="background: rgba(255,255,255,0.06); color: var(--text-main);">${r['PaymentMode'] || '-'}</span></td>
          <td style="text-align: center;">${r['Quantity'] || 0}</td>
          <td style="font-weight: 600;">₹${(Number(r['Amount']) || 0).toLocaleString('en-IN')}</td>
          <td style="font-weight: 600; color: #34d399;">₹${(Number(r['Profit']) || 0).toLocaleString('en-IN')}</td>
        `;
        tbody.appendChild(tr);
      });
    }

    if (tableInfo) {
      const endIdx = Math.min(startIdx + salesRowsPerPage, totalRecords);
      tableInfo.textContent = `Showing ${totalRecords ? startIdx + 1 : 0} to ${endIdx} of ${totalRecords} records`;
    }

    if (pageText) pageText.textContent = `Page ${salesCurrentPage} of ${maxPage}`;

    if (prevPageBtn) prevPageBtn.disabled = salesCurrentPage <= 1;
    if (nextPageBtn) nextPageBtn.disabled = salesCurrentPage >= maxPage;
  }

  [filterYear, filterCategory, filterRegion, filterPayment].forEach(sel => {
    if (sel) sel.addEventListener('change', applySalesFilters);
  });

  if (salesSearchInput) {
    salesSearchInput.addEventListener('input', () => {
      applySalesFilters();
    });
  }

  if (resetSalesFiltersBtn) {
    resetSalesFiltersBtn.addEventListener('click', () => {
      if (filterYear) filterYear.value = 'all';
      if (filterCategory) filterCategory.value = 'all';
      if (filterRegion) filterRegion.value = 'all';
      if (filterPayment) filterPayment.value = 'all';
      if (salesSearchInput) salesSearchInput.value = '';
      applySalesFilters();
    });
  }

  if (prevPageBtn) {
    prevPageBtn.addEventListener('click', () => {
      if (salesCurrentPage > 1) {
        salesCurrentPage--;
        renderTable();
      }
    });
  }

  if (nextPageBtn) {
    nextPageBtn.addEventListener('click', () => {
      const maxPage = Math.ceil(salesFilteredData.length / salesRowsPerPage) || 1;
      if (salesCurrentPage < maxPage) {
        salesCurrentPage++;
        renderTable();
      }
    });
  }

  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', () => {
      if (!salesFilteredData.length) {
        alert('No data available to export.');
        return;
      }

      const headers = ['Order ID', 'Order Date', 'CustomerName', 'State', 'City', 'Region', 'Category', 'Sub-Category', 'PaymentMode', 'Quantity', 'Amount', 'Profit'];
      const csvRows = [headers.join(',')];

      salesFilteredData.forEach(row => {
        const values = headers.map(h => {
          const val = row[h] !== undefined ? String(row[h]).replace(/"/g, '""') : '';
          return `"${val}"`;
        });
        csvRows.push(values.join(','));
      });

      const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'));
      const downloadLink = document.createElement('a');
      downloadLink.href = csvContent;
      downloadLink.download = 'Sales_Dataset_Export.csv';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    });
  }
});

// Copy Email Utility
function copyEmail() {
  const email = "haridass.ece@gmail.com";
  navigator.clipboard.writeText(email).then(() => {
    alert("Email address copied to clipboard: " + email);
  }).catch(err => {
    console.error("Failed to copy: ", err);
  });
}
